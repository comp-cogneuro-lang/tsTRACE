// Dahan, Magnuson & Tanenhaus (2001), Experiment 1 simulations (Figs. 5-7):
// frequency of cohort competitors.
//
// Question: participants fixated a high-frequency cohort competitor (bed)
// more than a low-frequency one (bell) while hearing a target (bench), from
// very early on. Which implementation of frequency in TRACE predicts that time
// course: frequency in resting levels, in phoneme-to-word connection weights,
// or applied after activation in the choice rule (as in the NAM)?
//
// Design (pp. 333-339): 17 target / HF cohort / LF cohort triplets plus one
// unrelated distractor each; each target presented alone (-target-), all words
// competing, 100 cycles.
//   lexicon:  default + every Experiment 1 and 2 stimulus (as in the paper's
//             303-word lexicon), with Kučera-Francis frequencies (lib/items.js)
//   parameters: M&E defaults except word resting level -0.3 (Appendix B)
//   methods:  none, rest (s = 0.06), wt (s = 0.13); the post-activation method
//             uses the 'none' activations and is applied in plot.py
//   readout:  each word's most active copy (the paper's method, footnote 4)
//
// Output (results/):
//   activations.csv  one row per method x item x display word x cycle, with the
//                    word's frequency
//
// Run:  node simulate.js [outputDir]        (51 simulations, ~4 s)

const path = require('path');
const { TraceSim } = require('tstrace');
const { maxCopy, outputDir, isSmoke, writeCsv, writeMetadata } = require('../../lib/sim-utils');
const { FREQ_EXP1, frequencyLexicon, frequencyConfig, mulberry32, pickDistractors } = require('../lib/items');

const CYCLES = 100;
const SEED = 2001;
const METHODS = ['none', 'rest', 'wt'];
const ITEMS = isSmoke() ? FREQ_EXP1.slice(0, 2) : FREQ_EXP1;

const dir = outputDir(__dirname);
const lexicon = frequencyLexicon();
const freqOf = new Map(lexicon.map((w) => [w.phon, w.freq]));
const random = mulberry32(SEED);
const displays = ITEMS.map(([name, target, , hf, hfPhon, , lf, lfPhon]) => ({
  name,
  words: { target, HF: hfPhon, LF: lfPhon, distractor: pickDistractors(random, 1, [target, hfPhon, lfPhon])[0] },
}));
const rows = [];

for (const method of METHODS) {
  for (const { name, words } of displays) {
    const config = frequencyConfig(method, lexicon);
    config.modelInput = `-${words.target}-`;
    const sim = new TraceSim(config);
    sim.cycle(CYCLES);
    for (const [role, phon] of Object.entries(words)) {
      const series = maxCopy(sim, config.lexicon.findIndex((w) => w.phon === phon));
      series.forEach((a, cycle) => rows.push([method, name, role, phon, freqOf.get(phon), cycle, a]));
    }
  }
  console.log(`${method} done`);
}

writeCsv(path.join(dir, 'activations.csv'), ['method', 'item', 'role', 'word', 'freq', 'cycle', 'activation'], rows);
writeMetadata(dir, {
  example: 'dahan-2001/03-frequency-cohorts',
  cycles: CYCLES,
  items: ITEMS.length,
  lexiconSize: lexicon.length,
  seed: SEED,
  displays,
  parameters: 'defaults, except rest.W -0.3; rest: freqNode.RDL_rest_s 0.06; wt: freqNode.RDL_wt_s 0.13',
});
