// Dahan, Magnuson, Tanenhaus & Hogan (2001), Fig. 4: TRACE simulations of
// fixations to cross-spliced words with subcategorical mismatches.
//
// Question: when the vowel of a target word (W1, e.g. "net") carries
// coarticulatory cues to a different final consonant, is recognition delayed
// more when those cues point to another word (W2, "neck": W2W1 = ne(ck)+t) than
// to a nonword (N3, "*nep": N3W1 = ne(p)+t)? Lateral inhibition between words
// predicts yes; the eye-tracking data showed it.
//
// Design (pp. 523-524, and the archived simulation code; see the README):
// 15 triplets x 3 splicing conditions (W1W1, W2W1, N3W1), 100 cycles.
//   splicing: input slices up to 23 come from the first token, slices from 24
//             (the final consonant's peak) on from W1 (lib/items.js)
//   lexicon:  the archived construction: the 235-word distribution lexicon
//             plus every W1, W2 and cohort-absent W2b (263 words)
//   display:  W1, W2 and the archived displays' two unrelated distractors
//   readout:  each word's most active copy (post-hoc max), as in the archive
// Every condition is run with two parameter sets (lib/items.js):
//   archive  what the archived code ran (distribution phonemes and feature
//            spreads, word-to-phoneme excitation 0.015, phoneme inhibition 0.05)
//   me86     what the paper's text describes (M&E 1986 parameters and phonemes)
//
// Output (results/):
//   activations.csv  one row per parameter set x item x condition x display word x cycle
//
// Run:  node simulate.js [outputDir]        (90 simulations, ~6 s)

const path = require('path');
const { TraceSim } = require('tstrace');
const { maxCopy, outputDir, isSmoke, writeCsv, writeMetadata } = require('../../lib/sim-utils');
const { SUBCAT, subcatConfig, spliced } = require('../lib/items');

const CYCLES = 100;
const PARAMS = ['archive', 'me86'];
const CONDITIONS = { W1W1: 1, W2W1: 2, N3W1: 3 }; // condition -> index of the pre-splice token
const ITEMS = isSmoke() ? SUBCAT.slice(0, 2) : SUBCAT;

const dir = outputDir(__dirname);
const rows = [];

for (const params of PARAMS) {
  for (const item of ITEMS) {
    const [name, w1, w2, , , d1, d2] = item;
    const display = { W1: w1, W2: w2, D1: d1, D2: d2 };
    for (const [condition, pre] of Object.entries(CONDITIONS)) {
      const config = subcatConfig(params);
      config.modelInput = spliced(item[pre], w1, config);
      const sim = new TraceSim(config);
      sim.cycle(CYCLES);
      for (const [role, phon] of Object.entries(display)) {
        const series = maxCopy(sim, config.lexicon.findIndex((w) => w.phon === phon));
        series.forEach((a, cycle) => rows.push([params, name, condition, config.modelInput, role, phon, cycle, a]));
      }
    }
  }
}

writeCsv(path.join(dir, 'activations.csv'), ['params', 'item', 'condition', 'input', 'role', 'word', 'cycle', 'activation'], rows);
writeMetadata(dir, {
  example: 'dahan-2001/01-subcategorical-eyetracking',
  cycles: CYCLES,
  items: ITEMS.length,
  lexiconSize: subcatConfig().lexicon.length,
  parameters: { archive: 'distribution phonemes and spreads, alpha.WP 0.015, gamma.P 0.05', me86: 'defaults' },
});
