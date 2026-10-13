// M&E (1986) Figs. 25-26: the time course of recognizing one word, "product".
// (Magnuson & Crinnion, 2022, Table 22.1, effect 9.)
//
// Question: how close does TRACE come to COHORT's assumption that a candidate
// drops out as soon as the input diverges from it? M&E (pp. 57-59) followed
// five words that diverge from /prad^kt/ at successive phonemes:
//   /trat/ (trot) 1st, /pas^b^l/ (possible) 2nd, /prist/ (priest) 3rd,
//   /pragr^s/ (progress) 4th, /pradus/ (produce) 5th
// and found that each "begins to fade" just after its mismatching phoneme
// arrives, and that shorter words have a temporary advantage over longer ones.
// Default lexicon and parameters.
//
// Output (results/):
//   words.csv     activation of product and the five words, one row per word x
//                 cycle. Each word's most active copy among those aligned near
//                 the input's first phoneme (slots 2-6; the first phoneme is at
//                 slot 4), since M&E compare words that start where "product" does.
//   snapshot.csv  the whole Trace every 3 cycles (Fig. 25)
//
// Run:  node simulate.js [outputDir]        (1 simulation, <1 s)

const path = require('path');
const { TraceSim, createDefaultConfig } = require('tstrace');
const { slotOf, maxCopy, traceSnapshot, outputDir, isSmoke, writeCsv, writeMetadata } = require('../../lib/sim-utils');

const CYCLES = isSmoke() ? 40 : 80;
const INPUT = '-prad^kt-';
// word -> input position (1 = first phoneme) at which it first mismatches /prad^kt/
const WORDS = { 'prad^kt': null, trat: 1, 'pas^b^l': 2, prist: 3, 'pragr^s': 4, pradus: 5 };

const dir = outputDir(__dirname);
const config = createDefaultConfig();
config.modelInput = INPUT;
const sim = new TraceSim(config);
sim.cycle(CYCLES);

const onset = slotOf(config, 1);
const rows = [];
for (const [word, mismatch] of Object.entries(WORDS)) {
  const row = config.lexicon.findIndex((w) => w.phon === word);
  if (row < 0) throw new Error(`${word} is not in the lexicon`);
  const series = maxCopy(sim, row, { from: onset - 2, to: onset + 2 });
  // cycle at which the first mismatching phoneme's features peak (input arrives one slice per cycle)
  const mismatchPeak = mismatch === null ? '' : config.deltaInput * (mismatch + 1);
  series.forEach((activation, cycle) => rows.push([word, mismatch ?? '', mismatchPeak, cycle, activation]));
}
const every3 = Array.from({ length: Math.ceil(CYCLES / 3) }, (_, i) => 3 * i);

writeCsv(path.join(dir, 'words.csv'), ['word', 'mismatch_position', 'mismatch_peak', 'cycle', 'activation'], rows);
writeCsv(
  path.join(dir, 'snapshot.csv'),
  ['cycle', 'level', 'unit', 'slot', 'length', 'activation'],
  traceSnapshot(sim, config, every3)
);
writeMetadata(dir, {
  example: 'original-trace-replications/08-product',
  cycles: CYCLES,
  input: INPUT,
  words: WORDS,
  parameters: 'defaults',
});
