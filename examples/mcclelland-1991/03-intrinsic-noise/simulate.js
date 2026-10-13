// McClelland (1991) Fig. 8: with noise intrinsic to processing, interactive
// activation still gives the classical joint effects of context and stimulus.
//
// Question: in most experiments the stimulus does not vary from trial to
// trial; variability comes from the perceiver. If noise is added to every
// unit's net input on every cycle (a "stochastic interactive activation"
// network), are z(P(/r/)) curves still parallel straight lines?
//
// Network: the small IA network of lib/iac.js (McClelland's Fig. 5).
// Design (p. 21): 5 inputs x 4 contexts, 10,000 trials per cell, 60 cycles.
//   input:   /r/ gets .3, .4, .5, .6 or .7, /l/ 1 minus that (no input noise)
//   context: input 1.0 (up from 0.5) to /s/, /p/ or /t/, or none
//   noise:   a normal sample with SD 0.14 added to each unit's net input on
//            every cycle (after the 0.1 input scaling; see lib/iac.js)
//   response: the target unit with the larger running average at cycle 60
//
// Output (results/):
//   choices.csv  number of trials and of /r/ responses per condition
//
// Run:  node simulate.js [outputDir]        (200,000 trials, ~7 s)
//       TRIALS=1000 node simulate.js        (fewer trials per cell)

const path = require('path');
const { L, R, weights, run, externalInput, mulberry32 } = require('../lib/iac');
const { outputDir, isSmoke, writeCsv, writeMetadata } = require('../../lib/sim-utils');

const CYCLES = 60;
const INPUTS = [0.3, 0.4, 0.5, 0.6, 0.7];
const CONTEXTS = ['s', 'p', 't', 'none'];
const CONTEXT_STRENGTH = 1.0;
const NOISE_SD = 0.14;
const TRIALS = isSmoke() ? 200 : Number(process.env.TRIALS) || 10000;
const SEED = 1991;

const dir = outputDir(__dirname);
const random = mulberry32(SEED);
const w = weights();
const rows = [];
for (const context of CONTEXTS) {
  const unit = context === 'none' ? null : context;
  for (const input of INPUTS) {
    let r = 0;
    for (let trial = 0; trial < TRIALS; trial++) {
      const { abar } = run(w, externalInput(input, unit, CONTEXT_STRENGTH), { cycles: CYCLES, noiseSD: NOISE_SD, random });
      if (abar[R] > abar[L]) r++;
    }
    rows.push([context, input, TRIALS, r]);
  }
  console.log(`context ${context} done`);
}

writeCsv(path.join(dir, 'choices.csv'), ['context', 'input', 'trials', 'r'], rows);
writeMetadata(dir, {
  example: 'mcclelland-1991/03-intrinsic-noise',
  cycles: CYCLES,
  trials: TRIALS,
  noiseSD: NOISE_SD,
  contextStrength: CONTEXT_STRENGTH,
  seed: SEED,
});
