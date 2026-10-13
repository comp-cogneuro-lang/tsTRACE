// M&E (1986) Fig. 24: recovering from a mismatching first phoneme.
// (Magnuson & Crinnion, 2022, Table 22.1, effect 8.)
//
// Question: the COHORT model drops a word as soon as the input mismatches it,
// so a distorted onset should make the word unrecognizable. TRACE instead lets
// word units compete: if no word matches the input exactly, the closest word
// can still win (M&E pp. 55-57).
//   /lig^l/  "legal": the input matches "legal", which should completely
//            dominate "regal" (one feature away at the onset)
//   /l^g^d/  "lugged" is not a word, so "rugged" should eventually win, more
//            slowly than when /r^g^d/ itself is presented
//   /r^g^d/  "rugged" presented intact, for comparison (added here)
// M&E's lexicon had "regal"; the surviving TRACE lexicon (used by jTRACE, the
// C code, and tsTRACE) does not, so it is added here. Otherwise all parameters
// are the defaults.
//
// Output (results/):
//   words.csv     each word's most active copy, one row per run x word x cycle,
//                 for the words that ever exceed 0.05 in that run, plus legal,
//                 regal, and rugged in every run
//   snapshot.csv  the whole Trace every 3 cycles for /lig^l/ and /l^g^d/ (Fig. 24)
//
// Run:  node simulate.js [outputDir]        (3 simulations, ~1 s)

const path = require('path');
const { TraceSim, createDefaultConfig } = require('tstrace');
const { maxCopy, traceSnapshot, outputDir, isSmoke, writeCsv, writeMetadata } = require('../../lib/sim-utils');

const CYCLES = isSmoke() ? 40 : 90;
const ADDED_WORDS = ['rig^l']; // "regal": in M&E's lexicon, missing from today's
const RUNS = { 'lig^l': '-lig^l-', 'l^g^d': '-l^g^d-', 'r^g^d': '-r^g^d-' };
const SNAPSHOT_RUNS = ['lig^l', 'l^g^d'];
const MIN_PEAK = 0.05; // words that never get this active are not written...
const ALWAYS = ['lig^l', 'rig^l', 'r^g^d']; // ...except these, which the figures compare

const dir = outputDir(__dirname);
const wordRows = [];
const snapshotRows = [];

for (const [run, input] of Object.entries(RUNS)) {
  const config = createDefaultConfig();
  config.lexicon.push(...ADDED_WORDS.map((phon) => ({ phon, freq: 1, prime: 0 })));
  config.modelInput = input;
  const sim = new TraceSim(config);
  sim.cycle(CYCLES);

  config.lexicon.forEach((word, row) => {
    if (word.phon === '-') return; // the silence "word" is not a lexical candidate
    const series = maxCopy(sim, row);
    if (Math.max(...series) < MIN_PEAK && !ALWAYS.includes(word.phon)) return;
    series.forEach((activation, cycle) => wordRows.push([run, word.phon, cycle, activation]));
  });
  if (SNAPSHOT_RUNS.includes(run)) {
    const every3 = Array.from({ length: Math.ceil(CYCLES / 3) }, (_, i) => 3 * i);
    for (const row of traceSnapshot(sim, config, every3)) snapshotRows.push([run, ...row]);
  }
}

writeCsv(path.join(dir, 'words.csv'), ['run', 'word', 'cycle', 'activation'], wordRows);
writeCsv(path.join(dir, 'snapshot.csv'), ['run', 'cycle', 'level', 'unit', 'slot', 'length', 'activation'], snapshotRows);
writeMetadata(dir, {
  example: 'original-trace-replications/07-mismatching-onset',
  cycles: CYCLES,
  addedWords: ADDED_WORDS,
  runs: RUNS,
  parameters: 'defaults',
});
