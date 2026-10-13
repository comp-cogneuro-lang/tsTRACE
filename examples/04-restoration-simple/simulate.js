// Example 4: phoneme restoration with replaced input -- the short version.
// (Example 5 replicates all of Magnuson, 2015.)
//
// Question: when part of a word is replaced, is the missing phoneme restored
// more when the gap holds noise than when it holds silence?
//
// Design: "luxury" (/l^kS^ri/) with its initial /l/, medial /S/, or final /i/
// treated in one of six ways:
//   intact            unchanged
//   silence-phoneme   the phoneme swapped for TRACE's silence phoneme "-"
//   noise-0.0         the phoneme's input span set to zeros (true silence)
//   noise-0.2/0.6/1.0 its span replaced by Gaussian noise, mean = level,
//                     SD = 25% of the level (Magnuson, 2015)
// The span is every input slice the phoneme contributes to, including those it
// shares with its neighbors (the GUI's "Replace phoneme" menu fills in the same
// span). Original default parameters; noise is seeded, so runs repeat exactly.
//
// Output (results/):
//   phonemes.csv   one row per position x condition x cycle: activations of all
//                  15 phoneme units at the replaced phoneme's slot
//   inputs.csv     the input matrices for the initial-/l/ noise conditions
//
// Run:  node simulate.js [outputDir]        (18 simulations, ~3 s)

const path = require('path');
const { TraceNet, TraceSim, createDefaultConfig } = require('tstrace');
const { slotOf, phonemeLabels, outputDir, writeCsv, writeMetadata } = require('../lib/sim-utils');

const CYCLES = 100;
const WORD = 'l^kS^ri';
const POSITIONS = { initial: 0, medial: 3, final: 6 }; // index of the replaced phoneme in WORD
const CONDITIONS = ['intact', 'silence-phoneme', 'noise-0.0', 'noise-0.2', 'noise-0.6', 'noise-1.0'];
const SEED = 2015;

const dir = outputDir(__dirname);
const phonemeRows = [];
const inputRows = [];
let labels;

for (const [position, k] of Object.entries(POSITIONS)) {
  const inputPos = k + 1; // input position of the replaced phoneme (after the leading "-")
  for (const condition of CONDITIONS) {
    const config = createDefaultConfig();
    config.modelInput = `-${WORD}-`;

    if (condition === 'silence-phoneme') {
      config.modelInput = `-${WORD.slice(0, k)}-${WORD.slice(k + 1)}-`;
    } else if (condition.startsWith('noise-')) {
      const level = Number(condition.slice('noise-'.length));
      // the input slices this phoneme spans
      const span = new TraceNet(config).getInputPhonemeSpans()[inputPos];
      config.replaceStart = span.start;
      config.replaceEnd = span.end;
      config.replaceMean = level;
      config.replaceSD = 0.25 * level;
      config.seed = SEED;
    }

    const sim = new TraceSim(config);
    sim.cycle(CYCLES);
    labels = labels || phonemeLabels(sim);

    const slot = slotOf(config, inputPos);
    for (let cycle = 0; cycle < CYCLES; cycle++) {
      const acts = sim.phonLayer[cycle].map((row) => row[slot].toFixed(5));
      phonemeRows.push([position, WORD[k], condition, cycle, ...acts]);
    }

    // keep the input matrices of the initial-/l/ noise conditions for plotting
    if (position === 'initial' && condition.startsWith('noise-')) {
      sim.getInputData(0).forEach(([unit, ...values]) =>
        values.forEach((v, slice) => Number(v) !== 0 && inputRows.push([condition, unit, slice, v]))
      );
    }
  }
}

writeCsv(path.join(dir, 'phonemes.csv'), ['position', 'replaced', 'condition', 'cycle', ...labels], phonemeRows);
writeCsv(path.join(dir, 'inputs.csv'), ['condition', 'unit', 'slice', 'value'], inputRows);
writeMetadata(dir, { example: '04-restoration-simple', word: WORD, cycles: CYCLES, conditions: CONDITIONS, seed: SEED, parameters: 'defaults' });
