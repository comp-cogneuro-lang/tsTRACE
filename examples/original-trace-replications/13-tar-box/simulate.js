// M&E (1986) Fig. 31: short words need the next word; long words do not.
// (Magnuson & Crinnion, 2022, Table 22.1, effect 11, lexical segmentation.)
//
// Question: at the /r/ of "tar box", "tar" may yet turn out to be "target".
// M&E (pp. 67-69) showed that in TRACE "tar" leads "target" only slightly
// while the /r/ comes in, and that "target" fades only once "box" emerges
// from the following phonemes. A longer word is different: in "guitar box",
// "guitar" is clearly dominant by the time its /r/ has registered. This
// mirrors Grosjean's (1985) finding that monosyllables often cannot be
// identified until well into the next word.
//
// Inputs: /tarbaks/ (tar box) and /g^tarbaks/ (guitar box). Default lexicon
// and parameters, 100 cycles.
//
// Output (results/):
//   words.csv     activation of the most active copy of tar, target, guitar,
//                 box, and every other word that exceeds 0.1 at some point
//                 (silence excluded), one row per run x word x cycle
//   snapshot.csv  the whole Trace every 3 cycles for each run (Fig. 31)
//
// Run:  node simulate.js [outputDir]        (2 simulations, ~1 s)

const path = require('path');
const { TraceSim, createDefaultConfig } = require('tstrace');
const { maxCopy, traceSnapshot, outputDir, isSmoke, writeCsv, writeMetadata } = require('../../lib/sim-utils');

const CYCLES = isSmoke() ? 50 : 100;
const RUNS = { tarbaks: '-tarbaks-', 'g^tarbaks': '-g^tarbaks-' };
const ALWAYS = ['tar', 'targ^t', 'g^tar', 'baks']; // saved even if they stay low
const MIN_PEAK = 0.1;

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
    if (!ALWAYS.includes(phon) && Math.max(...series) < MIN_PEAK) return;
    series.forEach((a, cycle) => wordRows.push([run, phon, cycle, a]));
  });
  for (const row of traceSnapshot(sim, config, every3)) snapshotRows.push([run, ...row]);
}

writeCsv(path.join(dir, 'words.csv'), ['run', 'word', 'cycle', 'activation'], wordRows);
writeCsv(path.join(dir, 'snapshot.csv'), ['run', 'cycle', 'level', 'unit', 'slot', 'length', 'activation'], snapshotRows);
writeMetadata(dir, {
  example: 'original-trace-replications/13-tar-box',
  cycles: CYCLES,
  runs: RUNS,
  minPeak: MIN_PEAK,
  parameters: 'defaults',
});
