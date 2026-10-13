// M&E (1986) Fig. 8: lexical effects on a word-final ambiguous segment.
// (Magnuson & Crinnion, 2022, Table 22.1, effect 3.)
//
// Question: is the lexical effect larger and faster when the ambiguous segment
// comes at the end of a word, after the word is already identified? M&E
// (pp. 27-28) predicted that, unlike word-initial effects, a word-final effect
// would appear "within the duration of a single phoneme" and so would survive
// Fox's (1982) 500-ms response deadline.
//
// Inputs (each ambiguous segment, "1", is the midpoint of a 3-step continuum):
//   word-final   /targ^?/ (target; /t/-/d/), from M&E Fig. 8, and from the
//                jTRACE gallery /dra?/ (drop), /gru?/ (group), /kri?/ (creep),
//                /kl^?/ (club), all /b/-/p/
//   word-initial /?l^g/ (plug), /?ragr^s/ (progress), /?ist/ (beast),
//                /?r^S/ (brush), all /b/-/p/, for comparison
// Default lexicon and parameters.
//
// Output (results/):
//   phonemes.csv  every phoneme unit at the ambiguous segment's slot, one row
//                 per run x cycle x phoneme. Each run also records where the
//                 segment is (initial/final), the phoneme the word calls for
//                 (consistent), the other continuum endpoint (inconsistent),
//                 and the cycle at which the segment's features peak (center).
//   snapshot.csv  the whole Trace every 3 cycles for /targ^?/ (Fig. 8)
//
// Run:  node simulate.js [outputDir]        (9 simulations, ~2 s)

const path = require('path');
const { TraceSim, createDefaultConfig } = require('tstrace');
const { slotOf, phonemeSlotRows, traceSnapshot, outputDir, isSmoke, writeCsv, writeMetadata } = require('../../lib/sim-utils');

const CYCLES = isSmoke() ? 48 : 90;
// run name: [model input, continuum, word-consistent phoneme, inconsistent phoneme]
const RUNS = {
  'targ^?': ['-targ^1-', 'td3', 't', 'd'],
  'dra?': ['-dra1-', 'bp3', 'p', 'b'],
  'gru?': ['-gru1-', 'bp3', 'p', 'b'],
  'kri?': ['-kri1-', 'bp3', 'p', 'b'],
  'kl^?': ['-kl^1-', 'bp3', 'b', 'p'],
  '?l^g': ['-1l^g-', 'bp3', 'p', 'b'],
  '?ragr^s': ['-1ragr^s-', 'bp3', 'p', 'b'],
  '?ist': ['-1ist-', 'bp3', 'b', 'p'],
  '?r^S': ['-1r^S-', 'bp3', 'b', 'p'],
};
const SNAPSHOT_RUN = 'targ^?';

const dir = outputDir(__dirname);
const phonemeRows = [];
const snapshotRows = [];

for (const [run, [input, continuum, consistent, inconsistent]] of Object.entries(RUNS)) {
  const config = createDefaultConfig();
  config.continuumSpec = continuum;
  config.modelInput = input;
  const sim = new TraceSim(config);
  sim.cycle(CYCLES);

  const position = input.indexOf('1'); // input position of the ambiguous segment
  const where = position === 1 ? 'initial' : 'final';
  const center = config.deltaInput * (position + 1); // input arrives one slice per cycle
  for (const row of phonemeSlotRows(sim, slotOf(config, position))) {
    phonemeRows.push([run, where, consistent, inconsistent, center, ...row]);
  }
  if (run === SNAPSHOT_RUN) {
    const every3 = Array.from({ length: Math.ceil(CYCLES / 3) }, (_, i) => 3 * i);
    for (const row of traceSnapshot(sim, config, every3)) snapshotRows.push([run, ...row]);
  }
}

writeCsv(
  path.join(dir, 'phonemes.csv'),
  ['run', 'position', 'consistent', 'inconsistent', 'center', 'cycle', 'phoneme', 'activation'],
  phonemeRows
);
writeCsv(path.join(dir, 'snapshot.csv'), ['run', 'cycle', 'level', 'unit', 'slot', 'length', 'activation'], snapshotRows);
writeMetadata(dir, {
  example: 'original-trace-replications/02-word-final',
  cycles: CYCLES,
  runs: RUNS,
  parameters: 'defaults',
});
