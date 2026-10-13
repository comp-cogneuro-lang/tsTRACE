// M&E (1986) Figs. 9-11: lexical effects on phoneme-monitoring reaction times.
// (Magnuson & Crinnion, 2022, Table 22.1, effect 3.)
//
// Question: if the lexicon always takes part in phoneme perception, why do
// monitoring times for word-initial targets not differ between words and
// nonwords (Foss & Blank, 1980), while targets late in a word are detected
// faster in words (Marslen-Wilson, 1980)? M&E: a clear word-initial phoneme is
// identified before the lexicon knows whether the input is a word; late in a
// word, the lexicon is already active and adds to the bottom-up input.
//
// Inputs (all phonemes clear; the target phoneme is /t/):
//   word-initial /t/:  /targ^t/ (target)  vs  /tr^g^s/ ("trugus", a nonword)
//   word-final /t/:    /sikr^t/ (secret)  vs  /g^ld^t/ ("guldut", a nonword)
// Default lexicon and parameters.
//
// Output (results/):
//   phonemes.csv  every phoneme unit at the target /t/'s slot, one row per
//                 run x cycle x phoneme; `position` is the /t/'s input
//                 position and `center` the cycle at which its features peak
//   snapshot.csv  the whole Trace every 3 cycles for /targ^t/ and /tr^g^s/ (Fig. 9)
//
// Run:  node simulate.js [outputDir]        (4 simulations, ~1 s)

const path = require('path');
const { TraceSim, createDefaultConfig } = require('tstrace');
const { slotOf, phonemeSlotRows, traceSnapshot, outputDir, isSmoke, writeCsv, writeMetadata } = require('../../lib/sim-utils');

const CYCLES = isSmoke() ? 48 : 80;
// run name: [model input, input position of the target /t/]
const RUNS = {
  'targ^t': ['-targ^t-', 1],
  'tr^g^s': ['-tr^g^s-', 1],
  'sikr^t': ['-sikr^t-', 6],
  'g^ld^t': ['-g^ld^t-', 6],
};
const SNAPSHOT_RUNS = ['targ^t', 'tr^g^s'];

const dir = outputDir(__dirname);
const phonemeRows = [];
const snapshotRows = [];

for (const [run, [input, position]] of Object.entries(RUNS)) {
  const config = createDefaultConfig();
  config.modelInput = input;
  const sim = new TraceSim(config);
  sim.cycle(CYCLES);

  const center = config.deltaInput * (position + 1); // input arrives one slice per cycle
  for (const row of phonemeSlotRows(sim, slotOf(config, position))) phonemeRows.push([run, position, center, ...row]);
  if (SNAPSHOT_RUNS.includes(run)) {
    const every3 = Array.from({ length: Math.ceil(CYCLES / 3) }, (_, i) => 3 * i);
    for (const row of traceSnapshot(sim, config, every3)) snapshotRows.push([run, ...row]);
  }
}

writeCsv(path.join(dir, 'phonemes.csv'), ['run', 'position', 'center', 'cycle', 'phoneme', 'activation'], phonemeRows);
writeCsv(path.join(dir, 'snapshot.csv'), ['run', 'cycle', 'level', 'unit', 'slot', 'length', 'activation'], snapshotRows);
writeMetadata(dir, {
  example: 'original-trace-replications/03-reaction-time',
  cycles: CYCLES,
  runs: RUNS,
  parameters: 'defaults',
});
