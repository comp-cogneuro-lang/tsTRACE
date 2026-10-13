// M&E (1986) Figs. 5-7: the lexical effect on phoneme identification, why it
// disappears under time pressure, and why it needs an ambiguous phoneme.
// (Magnuson & Crinnion, 2022, Table 22.1, effects 1, 2 and 4.)
//
// Questions:
//   1. Does the word an ambiguous /b/-/p/ segment would complete pull it toward
//      that word? (Ganong, 1980; M&E Figs. 5-6)
//   2. When does that pull appear? M&E: only about one phoneme after the
//      segment that identifies the word, too late for responses made under a
//      deadline (Fox, 1982), while a clear /p/ is identified within ~12 cycles.
//      (Figs. 6-7)
//   3. Does the lexicon also move clear tokens? M&E: no; a clear /b/ or /p/
//      wins whatever follows it (p. 29).
//
// Inputs (the ambiguous segment is the midpoint of a 3-step /b/-/p/
// continuum, written "1"; its features support /b/ and /p/ equally):
//   M&E:            ?l^g (plug), ?l^S (blush), and clear pl^g, bl^g, pl^S, bl^S
//   jTRACE gallery: ?ist (beast), ?r^S (brush), ?ragr^s (progress)
// M&E's lexicon had "blush"; the surviving TRACE lexicon (used by jTRACE, the
// C code, and tsTRACE) does not, so it is added here. Otherwise all parameters
// are the defaults.
//
// Output (results/):
//   phonemes.csv  every phoneme unit at the initial segment's slot (slot 4,
//                 M&E's "Slice 12"), one row per run x cycle x phoneme
//   snapshot.csv  the whole Trace every 3 cycles for ?l^g (Fig. 5) and bl^g (Fig. 7)
//
// Run:  node simulate.js [outputDir]        (9 simulations, ~3 s)

const path = require('path');
const { TraceSim, createDefaultConfig } = require('tstrace');
const { slotOf, phonemeSlotRows, traceSnapshot, outputDir, isSmoke, writeCsv, writeMetadata } = require('../../lib/sim-utils');

const CYCLES = isSmoke() ? 36 : 75;
const CONTINUUM = 'bp3'; // input-only phonemes 0 (/b/), 1 (midpoint), 2 (/p/)
const ADDED_WORDS = ['bl^S']; // in M&E's lexicon, missing from today's
// run name -> model input ("?" in names stands for the ambiguous segment "1")
const RUNS = {
  '?l^g': '-1l^g-',
  '?l^S': '-1l^S-',
  'pl^g': '-pl^g-',
  'bl^g': '-bl^g-',
  'pl^S': '-pl^S-',
  'bl^S': '-bl^S-',
  '?ist': '-1ist-',
  '?r^S': '-1r^S-',
  '?ragr^s': '-1ragr^s-',
};
const SNAPSHOT_RUNS = ['?l^g', 'bl^g'];

const dir = outputDir(__dirname);
const phonemeRows = [];
const snapshotRows = [];

for (const [run, input] of Object.entries(RUNS)) {
  const config = createDefaultConfig();
  config.lexicon.push(...ADDED_WORDS.map((phon) => ({ phon, freq: 1, prime: 0 })));
  config.continuumSpec = CONTINUUM;
  config.modelInput = input;
  const sim = new TraceSim(config);
  sim.cycle(CYCLES);

  // the initial segment is input position 1 (after the leading silence)
  for (const row of phonemeSlotRows(sim, slotOf(config, 1))) phonemeRows.push([run, ...row]);
  if (SNAPSHOT_RUNS.includes(run)) {
    const every3 = Array.from({ length: Math.ceil(CYCLES / 3) }, (_, i) => 3 * i);
    for (const row of traceSnapshot(sim, config, every3)) snapshotRows.push([run, ...row]);
  }
}

writeCsv(path.join(dir, 'phonemes.csv'), ['run', 'cycle', 'phoneme', 'activation'], phonemeRows);
writeCsv(path.join(dir, 'snapshot.csv'), ['run', 'cycle', 'level', 'unit', 'slot', 'length', 'activation'], snapshotRows);
writeMetadata(dir, {
  example: 'original-trace-replications/01-lexical-effect',
  cycles: CYCLES,
  continuum: CONTINUUM,
  addedWords: ADDED_WORDS,
  runs: RUNS,
  parameters: 'defaults',
});
