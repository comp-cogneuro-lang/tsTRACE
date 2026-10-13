// McClelland (1991) Fig. 6: with noise in the input, interactive activation
// gives the classical (additive) joint effects of context and stimulus.
//
// Question: if each trial's input is perturbed by noise and the response is
// simply the more active alternative, do z(P(/r/)) curves become parallel
// straight lines, as signal detection theory predicts?
//
// Network: the small IA network of lib/iac.js (McClelland's Fig. 5).
// Design (pp. 14-15): 5 inputs x 4 contexts (the isolated condition is left
// out, as in the paper), 10,000 trials per cell, 60 cycles per trial.
//   input:   mean input to /r/ .3, .4, .5, .6 or .7; on each trial it is shifted
//            by a normal sample with SD 0.141421 (/l/ always gets 1 minus /r/'s input)
//   context: input 0.5 to /s/, /p/ or /t/, or none
//   response: the target unit (/l/ or /r/) with the larger running average at cycle 60
//
// Output (results/):
//   choices.csv  number of trials and of /r/ responses per condition
//
// Run:  node simulate.js [outputDir]        (200,000 trials, ~3 s)
//       TRIALS=1000 node simulate.js        (fewer trials per cell)

const path = require('path');
const { L, R, weights, run, externalInput, gauss, mulberry32 } = require('../lib/iac');
const { outputDir, isSmoke, writeCsv, writeMetadata } = require('../../lib/sim-utils');

const CYCLES = 60;
const INPUTS = [0.3, 0.4, 0.5, 0.6, 0.7];
const CONTEXTS = ['s', 'p', 't', 'none'];
const CONTEXT_STRENGTH = 0.5;
const INPUT_SD = 0.141421; // 0.1 * sqrt(2)
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
      const perturbed = input + INPUT_SD * gauss(random);
      const { abar } = run(w, externalInput(perturbed, unit, CONTEXT_STRENGTH), { cycles: CYCLES });
      if (abar[R] > abar[L]) r++;
    }
    rows.push([context, input, TRIALS, r]);
  }
  console.log(`context ${context} done`);
}

writeCsv(path.join(dir, 'choices.csv'), ['context', 'input', 'trials', 'r'], rows);
writeMetadata(dir, {
  example: 'mcclelland-1991/02-input-noise',
  cycles: CYCLES,
  trials: TRIALS,
  inputSD: INPUT_SD,
  contextStrength: CONTEXT_STRENGTH,
  seed: SEED,
});
