// Dahan, Magnuson, Tanenhaus & Hogan (2001), Fig. 4: TRACE simulations of
// fixations to cross-spliced words with subcategorical mismatches.
//
// Question: when the vowel of a target word (W1, e.g. "net") carries
// coarticulatory cues to a different final consonant, is recognition delayed
// more when those cues point to another word (W2, "neck": W2W1 = ne(ck)+t) than
// to a nonword (N3, "*nep": N3W1 = ne(p)+t)? Lateral inhibition between words
// predicts yes; the eye-tracking data showed it.
//
// Design (pp. 523-524): 15 triplets x 3 splicing conditions (W1W1, W2W1, N3W1),
// default (M&E 1986) parameters, words preceded by 6 cycles of silence.
//   splicing: input slices up to 23 come from the first token, slices from 24
//             (the final consonant's peak) on from W1 (lib/items.js)
//   lexicon:  default + every W1 and W2 (the nonwords N3 are not added)
//   display:  W1, W2 and two phonologically unrelated distractors from the
//             lexicon (the paper doesn't list its TRACE distractors; seeded picks)
//   readout:  each word's most active copy (post-hoc max)
//
// Output (results/):
//   activations.csv  one row per item x condition x display word x cycle
//
// Run:  node simulate.js [outputDir]        (45 simulations, ~3 s)

const path = require('path');
const { TraceSim, createDefaultConfig } = require('tstrace');
const { maxCopy, outputDir, isSmoke, writeCsv, writeMetadata } = require('../../lib/sim-utils');
const { SUBCAT, spliced, buildLexicon, mulberry32, pickDistractors } = require('../lib/items');

const CYCLES = 100;
const SEED = 2001;
const CONDITIONS = { W1W1: 1, W2W1: 2, N3W1: 3 }; // condition -> index of the pre-splice token
const ITEMS = isSmoke() ? SUBCAT.slice(0, 2) : SUBCAT;

const dir = outputDir(__dirname);
const lexicon = buildLexicon(SUBCAT.flatMap(([, w1, w2]) => [[w1, 1], [w2, 1]])); // frequency plays no role here
const random = mulberry32(SEED);
const rows = [];

for (const item of ITEMS) {
  const [name, w1, w2] = item;
  const distractors = pickDistractors(random, 2, [w1, w2]);
  const display = { W1: w1, W2: w2, D1: distractors[0], D2: distractors[1] };
  for (const [condition, pre] of Object.entries(CONDITIONS)) {
    const config = createDefaultConfig();
    config.lexicon = lexicon;
    config.modelInput = spliced(item[pre], w1);
    const sim = new TraceSim(config);
    sim.cycle(CYCLES);
    for (const [role, phon] of Object.entries(display)) {
      const series = maxCopy(sim, lexicon.findIndex((w) => w.phon === phon));
      series.forEach((a, cycle) => rows.push([name, condition, config.modelInput, role, phon, cycle, a]));
    }
  }
}

writeCsv(path.join(dir, 'activations.csv'), ['item', 'condition', 'input', 'role', 'word', 'cycle', 'activation'], rows);
writeMetadata(dir, {
  example: 'dahan-2001/01-subcategorical-eyetracking',
  cycles: CYCLES,
  items: ITEMS.length,
  lexiconSize: lexicon.length,
  seed: SEED,
  parameters: 'defaults',
});
