// M&E (1986) p. 62-64: segmenting every word pair.
// (Magnuson & Crinnion, 2022, Table 22.1, effect 11; Strauss et al., 2007,
// Table 1, validation simulation 13.)
//
// Question: with no cues to word boundaries, how often does lexical
// competition alone parse a two-word stream correctly? M&E made 211 pairs by
// "permuting the lexicon twice and then abutting the two permutations so that
// each word occurred once as the first word and once as the second word",
// with silence at the start and end of each stream. A parse counted as
// correct "in the sense that no other word was more active than either of the
// two words that had been presented". TRACE got 189 of 211 right (90%).
//
// Design:
//   * the 212 words of the default lexicon (M&E's lexicon had 211; silence is
//     not a word here), permuted twice with a seeded generator; pair i is
//     word i of the first permutation followed by word i of the second
//   * M&E ran one such set of pairs; here SETS independent sets are run, so
//     the proportion correct can be given with a standard error across sets
//   * input: "-" + first + second + "-"; default parameters, except that the
//     Trace is lengthened (fSlices = 135) so the longest streams (up to 20
//     positions) fit. A longer Trace leaves activations inside a stream that
//     already fits unchanged, apart from edge effects near the end of the
//     default 99-slice Trace.
//   * readout: M&E judged the parse "a few slices after the end" of the input
//     without giving a number, so the parse is scored at several lags after
//     the center of the second word's last phoneme (LAGS, in cycles)
//   * presented words: each word's most active unit within one slot of where
//     it starts (its true alignment); rivals: every unit of every other word,
//     at any slot (silence excluded)
//
// Output (results/):
//   pairs.csv  one row per set x pair x lag: the two words, their activations, the
//              strongest rival and its activation, and whether the parse is
//              correct (no rival more active than either word)
//
// Run:  node simulate.js [outputDir]        (8 x 212 simulations, ~2 min)

const path = require('path');
const { TraceSim, createDefaultConfig } = require('tstrace');
const { slotOf, outputDir, isSmoke, writeCsv, writeMetadata } = require('../../lib/sim-utils');

const SEED = 1986;
const F_SLICES = 135;
const LAGS = [6, 12, 18, 24, 36]; // cycles after the last phoneme's center
const SETS = isSmoke() ? 1 : 8;
const N_SMOKE = 6; // pairs per set in smoke runs

/** Small seeded random number generator (mulberry32), so the pairs repeat across runs. */
const random = ((seed) => () => {
  seed = (seed + 0x6d2b79f5) >>> 0;
  let t = Math.imul(seed ^ (seed >>> 15), seed | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
})(SEED);

/** Fisher-Yates shuffle of a copy of `items`. */
const shuffle = (items) => {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const words = createDefaultConfig()
  .lexicon.map((w) => w.phon)
  .filter((w) => w !== '-');
const pairs = []; // [set, first word, second word]
for (let set = 1; set <= SETS; set++) {
  const first = shuffle(words);
  const second = shuffle(words);
  first.slice(0, isSmoke() ? N_SMOKE : undefined).forEach((w, i) => pairs.push([set, w, second[i]]));
}

const dir = outputDir(__dirname);
const rows = [];

pairs.forEach(([set, w1, w2], i) => {
  const config = createDefaultConfig();
  config.fSlices = F_SLICES;
  config.modelInput = `-${w1}${w2}-`;
  const lastCenter = config.deltaInput * (w1.length + w2.length + 1); // input arrives one slice per cycle
  const sim = new TraceSim(config);
  sim.cycle(lastCenter + Math.max(...LAGS) + 1);

  const rowOf = (phon) => config.lexicon.findIndex((w) => w.phon === phon);
  const s1 = slotOf(config, 1);
  const s2 = slotOf(config, 1 + w1.length);
  const near = (layer, row, slot) => Math.max(layer[row][slot - 1], layer[row][slot], layer[row][slot + 1]);

  for (const lag of LAGS) {
    const layer = sim.wordLayer[lastCenter + lag];
    const a1 = near(layer, rowOf(w1), s1);
    const a2 = near(layer, rowOf(w2), s2);
    let rival = '';
    let rivalAct = -Infinity;
    config.lexicon.forEach(({ phon }, r) => {
      if (phon === '-' || phon === w1 || phon === w2) return;
      const a = Math.max(...layer[r]);
      if (a > rivalAct) {
        rivalAct = a;
        rival = phon;
      }
    });
    rows.push([set, i + 1, w1, w2, lag, lastCenter + lag, a1, a2, rival, rivalAct, rivalAct < Math.min(a1, a2) ? 1 : 0]);
  }
  if ((i + 1) % 100 === 0) console.log(`${i + 1} / ${pairs.length} pairs`);
});

writeCsv(
  path.join(dir, 'pairs.csv'),
  ['set', 'pair', 'first', 'second', 'lag', 'cycle', 'first_act', 'second_act', 'rival', 'rival_act', 'correct'],
  rows
);
writeMetadata(dir, {
  example: 'original-trace-replications/15-all-word-pairs',
  seed: SEED,
  sets: SETS,
  pairs: pairs.length,
  words, // the lexicon the pairs were drawn from (used by plot.py to find alternative parses)
  lags: LAGS,
  fSlices: F_SLICES,
  parameters: 'defaults, except fSlices',
});
