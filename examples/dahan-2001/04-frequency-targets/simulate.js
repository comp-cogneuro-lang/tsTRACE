// Dahan, Magnuson & Tanenhaus (2001), Experiment 2 simulations (Figs. 9-12):
// frequency of the target itself.
//
// Question: with no phonologically related pictures in the display, are
// high-frequency targets (bed) fixated sooner than low-frequency ones (bell),
// and which frequency implementation predicts the time course?
//
// Design (pp. 348-351): 21 low/high-frequency pairs; each word presented alone
// (-word-) for 100 cycles; three unrelated distractors per pair, the same for
// both members, "with similar frequencies to those for the distractors used in
// the experiment" (picked here, seeded, from distribution-lexicon words with
// frequencies 10-150, since the paper doesn't list them).
//   lexicon, parameters, methods and readout as in example 03 (lib/items.js)
//
// Output (results/):
//   activations.csv  one row per method x pair x target type (HF/LF) x display
//                    word x cycle, with the word's frequency
//
// Run:  node simulate.js [outputDir]        (126 simulations, ~10 s)

const path = require('path');
const { TraceSim } = require('tstrace');
const { maxCopy, outputDir, isSmoke, writeCsv, writeMetadata } = require('../../lib/sim-utils');
const { FREQ_EXP2, frequencyLexicon, frequencyConfig, mulberry32, pickDistractors } = require('../lib/items');

const CYCLES = 100;
const SEED = 2001;
const METHODS = ['none', 'rest', 'wt'];
const PAIRS = isSmoke() ? FREQ_EXP2.slice(0, 2) : FREQ_EXP2;

const dir = outputDir(__dirname);
const lexicon = frequencyLexicon();
const freqOf = new Map(lexicon.map((w) => [w.phon, w.freq]));
const random = mulberry32(SEED);
const displays = PAIRS.map(([lfName, lf, , hfName, hf]) => ({
  pair: `${lfName}/${hfName}`,
  targets: { LF: lf, HF: hf },
  distractors: pickDistractors(random, 3, [lf, hf], { minFreq: 10, maxFreq: 150 }),
}));
const rows = [];

for (const method of METHODS) {
  for (const { pair, targets, distractors } of displays) {
    for (const [type, target] of Object.entries(targets)) {
      const config = frequencyConfig(method, lexicon);
      config.modelInput = `-${target}-`;
      const sim = new TraceSim(config);
      sim.cycle(CYCLES);
      const words = { target, D1: distractors[0], D2: distractors[1], D3: distractors[2] };
      for (const [role, phon] of Object.entries(words)) {
        const series = maxCopy(sim, config.lexicon.findIndex((w) => w.phon === phon));
        series.forEach((a, cycle) => rows.push([method, pair, type, role, phon, freqOf.get(phon), cycle, a]));
      }
    }
  }
  console.log(`${method} done`);
}

writeCsv(path.join(dir, 'activations.csv'), ['method', 'pair', 'type', 'role', 'word', 'freq', 'cycle', 'activation'], rows);
writeMetadata(dir, {
  example: 'dahan-2001/04-frequency-targets',
  cycles: CYCLES,
  pairs: PAIRS.length,
  lexiconSize: lexicon.length,
  seed: SEED,
  displays,
  parameters: 'defaults, except rest.W -0.3; rest: freqNode.RDL_rest_s 0.06; wt: freqNode.RDL_wt_s 0.13',
});
