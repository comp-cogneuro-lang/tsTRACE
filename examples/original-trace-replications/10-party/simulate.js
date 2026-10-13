// M&E (1986) Figs. 27-28: one long word or two short ones?
// (Magnuson & Crinnion, 2022, Table 22.1, effect 11, lexical segmentation.)
//
// Question: the stream /parti/ could be one word ("party") or two ("par tea").
// M&E (pp. 62-64) showed that TRACE first favors the short word "par", then
// settles on "party"; that a brief silence (/par-ti/) gives "par" + "tea"; that
// with no spanning word (/barti/) it settles on "bar" + "tea", which gang up on
// the overlapping "art"; and that it can also fail to find a valid parse
// (/parki/: "park" beats "par" and "key").
//
// Inputs (all phonemes clear): /parti/, /par-ti/, /barti/, /parki/ (the
// jTRACE gallery's "word segmentation" set). Default lexicon and parameters.
//
// Output (results/):
//   words.csv     activation of the most active copy of each word of interest,
//                 one row per run x word x cycle
//   snapshot.csv  the whole Trace every 3 cycles for each run (Figs. 27-28)
//
// Run:  node simulate.js [outputDir]        (4 simulations, ~1 s)

const path = require('path');
const { TraceSim, createDefaultConfig } = require('tstrace');
const { maxCopy, traceSnapshot, outputDir, isSmoke, writeCsv, writeMetadata } = require('../../lib/sim-utils');

const CYCLES = isSmoke() ? 45 : 100;
const RUNS = { parti: '-parti-', 'par-ti': '-par-ti-', barti: '-barti-', parki: '-parki-' };
// the candidate words M&E discuss (party, par, tea, bar, art, park, key), plus
// "part", which turns out to be a strong rival in /par-ti/
const WORDS = ['parti', 'par', 'ti', 'bar', 'art', 'park', 'ki', 'part'];

const dir = outputDir(__dirname);
const wordRows = [];
const snapshotRows = [];
const every3 = Array.from({ length: Math.ceil(CYCLES / 3) }, (_, i) => 3 * i);

for (const [run, input] of Object.entries(RUNS)) {
  const config = createDefaultConfig();
  config.modelInput = input;
  const sim = new TraceSim(config);
  sim.cycle(CYCLES);

  for (const word of WORDS) {
    const series = maxCopy(sim, config.lexicon.findIndex((w) => w.phon === word));
    series.forEach((a, cycle) => wordRows.push([run, word, cycle, a]));
  }
  for (const row of traceSnapshot(sim, config, every3)) snapshotRows.push([run, ...row]);
}

writeCsv(path.join(dir, 'words.csv'), ['run', 'word', 'cycle', 'activation'], wordRows);
writeCsv(path.join(dir, 'snapshot.csv'), ['run', 'cycle', 'level', 'unit', 'slot', 'length', 'activation'], snapshotRows);
writeMetadata(dir, {
  example: 'original-trace-replications/10-party',
  cycles: CYCLES,
  runs: RUNS,
  words: WORDS,
  parameters: 'defaults',
});
