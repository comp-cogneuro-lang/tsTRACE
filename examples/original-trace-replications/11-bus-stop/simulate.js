// M&E (1986) Fig. 29: overlapping parses are not suppressed.
// (Magnuson & Crinnion, 2022, Table 22.1, effect 11, lexical segmentation.)
//
// Question: TRACE does not insist that each phoneme belong to exactly one
// word. M&E (p. 64) argue this is often a virtue, since a phoneme sometimes
// does double duty ("brush shop", "hound dog"). With /b^stap/, "bus stop"
// shares its /s/ between the two words, while "bus top" uses each phoneme
// once. M&E showed that TRACE keeps both "stop" (overlapping "bus") and "top"
// (not overlapping it) active, and with /br^Sap/ keeps both "brush" and
// "shop", which share the /S/.
//
// Inputs: /b^stap/ and /br^Sap/, as in M&E's Fig. 29. All four words of
// "bus stop", "bus top" and "brush shop" are in the default lexicon
// (b^s, stap, tap, br^S, Sap). Default parameters, 100 cycles.
//
// Output (results/):
//   words.csv     activation of the most active copy of every word whose
//                 activation exceeds 0.1 at some point (silence excluded),
//                 one row per run x word x cycle
//   snapshot.csv  the whole Trace every 3 cycles for each run (Fig. 29)
//
// Run:  node simulate.js [outputDir]        (2 simulations, ~1 s)

const path = require('path');
const { TraceSim, createDefaultConfig } = require('tstrace');
const { maxCopy, traceSnapshot, outputDir, isSmoke, writeCsv, writeMetadata } = require('../../lib/sim-utils');

const CYCLES = isSmoke() ? 45 : 100;
const RUNS = { 'b^stap': '-b^stap-', 'br^Sap': '-br^Sap-' };
const MIN_PEAK = 0.1; // keep words that get at least this active

const dir = outputDir(__dirname);
const wordRows = [];
const snapshotRows = [];
const every3 = Array.from({ length: Math.ceil(CYCLES / 3) }, (_, i) => 3 * i);

for (const [run, input] of Object.entries(RUNS)) {
  const config = createDefaultConfig();
  config.modelInput = input;
  const sim = new TraceSim(config);
  sim.cycle(CYCLES);

  config.lexicon.forEach(({ phon }, row) => {
    if (phon === '-') return;
    const series = maxCopy(sim, row);
    if (Math.max(...series) < MIN_PEAK) return;
    series.forEach((a, cycle) => wordRows.push([run, phon, cycle, a]));
  });
  for (const row of traceSnapshot(sim, config, every3)) snapshotRows.push([run, ...row]);
}

writeCsv(path.join(dir, 'words.csv'), ['run', 'word', 'cycle', 'activation'], wordRows);
writeCsv(path.join(dir, 'snapshot.csv'), ['run', 'cycle', 'level', 'unit', 'slot', 'length', 'activation'], snapshotRows);
writeMetadata(dir, {
  example: 'original-trace-replications/11-bus-stop',
  cycles: CYCLES,
  runs: RUNS,
  minPeak: MIN_PEAK,
  parameters: 'defaults',
});
