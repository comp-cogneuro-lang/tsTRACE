// Example 5: full replication of Magnuson (2015), "Phoneme restoration and
// empirical coverage of interactive activation and adaptive resonance models
// of human speech processing", JASA 137(3), 1481-1492.
//
// Question: does TRACE restore a phoneme that is replaced by noise more than
// one replaced by silence, as listeners do? Grossberg & Kazerounian (2011)
// said no, but they built "noise" as a phoneme. Magnuson (2015) instead
// replaced the stretch of input a phoneme spans with Gaussian noise (or zeros,
// "true silence") and found greater restoration for noise -- once phoneme
// definitions were revised so that no phoneme resembles noise more than others.
//
// Conditions, applied to one phoneme of a word (its "replaced" phoneme):
//   intact            the word as is
//   silence-phoneme   the phoneme swapped for TRACE's silence phoneme "-"
//   noise-0.0         its input span set to zeros (true silence)
//   noise-0.2/0.6/1.0 its input span replaced by Gaussian noise with mean = level
//                     and SD = 25% of the level (as in the paper)
// Positions: initial, medial (middle phoneme), final.
//
// Parts (each feeds the paper's figures; see README.md):
//   A  stimuli only (input matrices)                     Figs. 1, 2
//   B  "luxury", original and revised phonemes           Figs. 3, 4, 7, 8
//      and revised phonemes with luxury as the only word  Figs. 11, 12
//   C  every 3-, 5-, and 7-phoneme word, both phoneme    Figs. 5, 9, 10, 13
//      sets                                               + statistics
//   D  luxury, initial /l/, noise 0.1 ... 1.2             footnote 4
// Fig. 6 (the phoneme definitions) is drawn from phoneme-definitions.csv.
// Original default parameters throughout; every noisy stimulus has a fixed seed.
//
// Output (results/):
//   phonemes.csv.gz         one row per simulation x cycle: activations of all 15
//                           phoneme units at the replaced phoneme's slot, and the
//                           first input slice of the replaced phoneme (span_start)
//   inputs.csv.gz           input matrices for Figs. 1 and 2
//   phoneme-definitions.csv original and revised feature vectors (Fig. 6)
//   lexicon.csv             the lexicon (for the bigram analysis)
//
// Run:  node simulate.js [outputDir]        (~4,300 simulations, ~8 min, 1 core)
//       SMOKE=1 node simulate.js /tmp/x     (a few simulations, to check it runs)

const path = require('path');
const { TraceNet, TraceSim, createDefaultConfig } = require('tstrace');
const { slotOf, phonemeLabels, outputDir, isSmoke, writeCsv, writeMetadata } = require('../lib/sim-utils');
const { useRevisedPhonemes } = require('./revised-phonemes');

const CYCLES = 100;
const LUXURY = 'l^kS^ri';
const CONDITIONS = ['intact', 'silence-phoneme', 'noise-0.0', 'noise-0.2', 'noise-0.6', 'noise-1.0'];
const POSITIONS = ['initial', 'medial', 'final'];
const FOOTNOTE_LEVELS = [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0, 1.1, 1.2];

const dir = outputDir(__dirname);

// ----------------------------------------------------------------------------
// Building blocks
// ----------------------------------------------------------------------------

/** Default config with the requested phoneme set and lexicon. */
const makeConfig = ({ features, lexicon }) => {
  const config = createDefaultConfig();
  if (features === 'revised') useRevisedPhonemes(config);
  if (lexicon === 'luxury-only') config.lexicon = config.lexicon.filter((w) => w.phon === LUXURY);
  return config;
};

/** Index (within the word) of the phoneme replaced at each position. */
const indexOf = (word, position) =>
  position === 'initial' ? 0 : position === 'final' ? word.length - 1 : Math.floor(word.length / 2);

/** Small deterministic hash, so each noisy stimulus always gets the same seed. */
const seedFor = (text) => [...text].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);

/**
 * Configure one stimulus: `word` with the phoneme at `position` treated
 * according to `condition` (or a raw noise level, for footnote 4).
 * Returns the replaced phoneme's input position and its input span.
 */
const applyCondition = (config, word, position, condition) => {
  const k = indexOf(word, position);
  const inputPos = k + 1; // after the leading silence
  config.modelInput = `-${word}-`;
  // the slices this phoneme contributes to, including those shared with neighbors
  const span = new TraceNet(config).getInputPhonemeSpans()[inputPos];
  if (condition === 'silence-phoneme') {
    config.modelInput = `-${word.slice(0, k)}-${word.slice(k + 1)}-`;
  } else if (condition.startsWith('noise-')) {
    const level = Number(condition.slice('noise-'.length));
    config.replaceStart = span.start;
    config.replaceEnd = span.end;
    config.replaceMean = level;
    config.replaceSD = 0.25 * level;
    config.seed = seedFor(`${word}|${position}|${condition}`);
  }
  return { inputPos, span };
};

// ----------------------------------------------------------------------------
// Simulations (parts B, C, D) -> phonemes.csv.gz
// ----------------------------------------------------------------------------

const phonemeRows = [];
let labels = null; // phoneme unit labels, in row order
let count = 0;

const simulate = ({ part, features, lexicon, word, position, condition }) => {
  const config = makeConfig({ features, lexicon });
  const { inputPos, span } = applyCondition(config, word, position, condition);
  const sim = new TraceSim(config);
  sim.cycle(CYCLES);

  labels = labels || phonemeLabels(sim);
  const slot = slotOf(config, inputPos);
  const replaced = word[indexOf(word, position)];
  for (let cycle = 0; cycle < CYCLES; cycle++) {
    const acts = sim.phonLayer[cycle].map((row) => row[slot].toFixed(5));
    phonemeRows.push([part, features, lexicon, word, word.length, position, replaced, span.start, condition, cycle, ...acts]);
  }
  if (++count % 50 === 0) console.log(`${count} simulations`);
};

const lexiconWords = createDefaultConfig().lexicon.map((w) => w.phon);
const smokeOr = (all, few) => (isSmoke() ? few : all);

// Part B: luxury
for (const [features, lexicon] of [
  ['original', 'full'],
  ['revised', 'full'],
  ['revised', 'luxury-only'],
]) {
  for (const position of POSITIONS) {
    for (const condition of CONDITIONS) {
      simulate({ part: 'B', features, lexicon, word: LUXURY, position, condition });
    }
  }
}

// Part C: every 3-, 5-, and 7-phoneme word
const wordSet = lexiconWords.filter((w) => [3, 5, 7].includes(w.length));
for (const features of ['original', 'revised']) {
  for (const word of smokeOr(wordSet, [wordSet.find((w) => w.length === 3), wordSet.find((w) => w.length === 5), LUXURY])) {
    for (const position of POSITIONS) {
      for (const condition of CONDITIONS) {
        simulate({ part: 'C', features, lexicon: 'full', word, position, condition });
      }
    }
  }
}

// Part D: footnote 4, more noise levels (luxury, initial /l/, original phonemes)
for (const level of smokeOr(FOOTNOTE_LEVELS, [0, 1])) {
  simulate({ part: 'D', features: 'original', lexicon: 'full', word: LUXURY, position: 'initial', condition: `noise-${level.toFixed(1)}` });
}

writeCsv(
  path.join(dir, 'phonemes.csv.gz'),
  ['part', 'features', 'lexicon', 'word', 'length', 'position', 'replaced', 'span_start', 'condition', 'cycle', ...labels],
  phonemeRows
);

// ----------------------------------------------------------------------------
// Part A: input matrices -> inputs.csv.gz
// ----------------------------------------------------------------------------

const inputRows = [];
const recordInput = (figure, panel, config) => {
  new TraceNet(config).inputLayer.forEach((row, unit) =>
    row.forEach((value, slice) => {
      if (value !== 0) inputRows.push([figure, panel, unit, slice, value.toFixed(4)]);
    })
  );
};

// Fig. 1: the Grossberg & Kazerounian (2011) stimuli. Their "true silence
// phoneme" (all features 0) and "noise phoneme" (all 63 values 0.4) were new
// phonemes, so we add them to the phonology as "_" and "#".
const gkConfig = (input) => {
  const config = createDefaultConfig();
  const template = config.phonology.find((p) => p.label === 'p');
  config.phonology.push({ ...template, label: '_', features: Array(63).fill(0) });
  config.phonology.push({ ...template, label: '#', features: Array(63).fill(0.4) });
  config.modelInput = input;
  return config;
};
recordInput('fig1', 'Intact', gkConfig(`-${LUXURY}-`));
recordInput('fig1', 'Silence phoneme', gkConfig(`--${LUXURY.slice(1)}-`));
recordInput('fig1', "'True' silence phoneme", gkConfig(`-_${LUXURY.slice(1)}-`));
recordInput('fig1', "Noise 'phoneme'", gkConfig(`-#${LUXURY.slice(1)}-`));

// Fig. 2: replacing the input span of /l/ with zeros or noise
for (const level of ['0.0', '0.2', '0.6', '1.0']) {
  const config = createDefaultConfig();
  applyCondition(config, LUXURY, 'initial', `noise-${level}`);
  recordInput('fig2', `Noise = ${level}`, config);
}
writeCsv(path.join(dir, 'inputs.csv.gz'), ['figure', 'panel', 'unit', 'slice', 'value'], inputRows);

// ----------------------------------------------------------------------------
// Phoneme definitions (Fig. 6) and the lexicon
// ----------------------------------------------------------------------------

const definitionRows = [];
for (const features of ['original', 'revised']) {
  for (const p of makeConfig({ features }).phonology) {
    p.features.forEach((value, unit) => definitionRows.push([features, p.label, unit, value]));
  }
}
writeCsv(path.join(dir, 'phoneme-definitions.csv'), ['features', 'phoneme', 'unit', 'value'], definitionRows);
writeCsv(path.join(dir, 'lexicon.csv'), ['word'], lexiconWords.map((w) => [w]));

writeMetadata(dir, {
  example: '05-restoration-magnuson2015',
  cycles: CYCLES,
  conditions: CONDITIONS,
  positions: POSITIONS,
  wordSetSizes: { 3: wordSet.filter((w) => w.length === 3).length, 5: wordSet.filter((w) => w.length === 5).length, 7: wordSet.filter((w) => w.length === 7).length },
  simulations: count,
  parameters: 'defaults',
});
