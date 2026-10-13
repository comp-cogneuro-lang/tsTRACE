// M&E (1986) Figs. 12-13: phonotactic effects as a lexical "conspiracy".
// (Magnuson & Crinnion, 2022, Table 22.1, effect 5.)
//
// Questions:
//   1. Massaro & Cohen (1983) found that a segment ambiguous between /l/ and /r/
//      is heard as /l/ after /s/ (where English allows /l/ but not /r/), even
//      though neither "sli" nor "sri" is a word. TRACE has no phonotactic rules:
//      can partial activation of words like "sleep" and "sleet" produce the bias?
//      (M&E Fig. 12)
//   2. If the bias comes from words, a phonotactically illegal segment should
//      win when it makes the input close to a word: /?luli/, with ? between /p/
//      and /t/, is close to "truly", so TRACE should come to prefer the illegal
//      /t/ (cf. Elman's "bwacelet"). (M&E Fig. 13)
//
// Inputs (each ambiguous segment, "1", is the midpoint of a 3-step continuum):
//   /s?i/ (M&E), /p?i/, /t?i/ (jTRACE gallery), ? between /l/ and /r/
//   /s?i/ with no words in the lexicon (control, added here): no conspiracy
//   /?luli/ (M&E), ? between /p/ and /t/; and the clear word /truli/
// Default lexicon and parameters otherwise.
//
// Output (results/):
//   phonemes.csv  every phoneme unit at the slots of input positions 1 and 2,
//                 one row per run x slot x cycle x phoneme
//   snapshot.csv  the whole Trace every 3 cycles for /s?i/ (Fig. 12) and
//                 /?luli/ (Fig. 13)
//
// Run:  node simulate.js [outputDir]        (6 simulations, ~1 s)

const path = require('path');
const { TraceSim, createDefaultConfig } = require('tstrace');
const { slotOf, phonemeSlotRows, traceSnapshot, outputDir, isSmoke, writeCsv, writeMetadata } = require('../../lib/sim-utils');

const CYCLES = isSmoke() ? 48 : 80;
// run name: [model input, continuum, lexicon ('default' or 'none')]
const RUNS = {
  's?i': ['-s1i-', 'lr3', 'default'],
  'p?i': ['-p1i-', 'lr3', 'default'],
  't?i': ['-t1i-', 'lr3', 'default'],
  's?i (no words)': ['-s1i-', 'lr3', 'none'],
  '?luli': ['-1luli-', 'pt3', 'default'],
  'truli': ['-truli-', '', 'default'],
};
const SNAPSHOT_RUNS = ['s?i', '?luli'];
const POSITIONS = [1, 2]; // input positions read out (the first two phonemes)

const dir = outputDir(__dirname);
const phonemeRows = [];
const snapshotRows = [];

for (const [run, [input, continuum, lexicon]] of Object.entries(RUNS)) {
  const config = createDefaultConfig();
  if (lexicon === 'none') config.lexicon = [{ phon: '-', freq: 1, prime: 0 }]; // silence only
  config.continuumSpec = continuum;
  config.modelInput = input;
  const sim = new TraceSim(config);
  sim.cycle(CYCLES);

  for (const position of POSITIONS) {
    const slot = slotOf(config, position);
    for (const row of phonemeSlotRows(sim, slot)) phonemeRows.push([run, position, ...row]);
  }
  if (SNAPSHOT_RUNS.includes(run)) {
    const every3 = Array.from({ length: Math.ceil(CYCLES / 3) }, (_, i) => 3 * i);
    for (const row of traceSnapshot(sim, config, every3)) snapshotRows.push([run, ...row]);
  }
}

writeCsv(path.join(dir, 'phonemes.csv'), ['run', 'position', 'cycle', 'phoneme', 'activation'], phonemeRows);
writeCsv(path.join(dir, 'snapshot.csv'), ['run', 'cycle', 'level', 'unit', 'slot', 'length', 'activation'], snapshotRows);
writeMetadata(dir, {
  example: 'original-trace-replications/04-conspiracy',
  cycles: CYCLES,
  runs: RUNS,
  parameters: 'defaults',
});
