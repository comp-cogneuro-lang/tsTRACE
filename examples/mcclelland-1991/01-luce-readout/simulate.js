// McClelland (1991) Fig. 4: deterministic interactive activation with a Luce
// readout distorts the joint effects of context and stimulus.
//
// Question: classical models predict that z(P(/r/)) is a straight line in the
// stimulus, shifted up or down by context. Does the deterministic IA network,
// read out the way TRACE and the letter-perception model were (Luce choice on
// running-average activations), give that pattern?
//
// Network: the small IA network of lib/iac.js (McClelland's Fig. 5).
// Design (p. 12): 5 inputs x 5 contexts.
//   input:   /r/ gets .3, .4, .5, .6 or .7; /l/ gets 1 minus that
//   context: input 0.5 to /s/ (favors /l/), /p/ (neutral) or /t/ (favors /r/);
//            "none" (no context input); "isolated" (target-word connections cut)
// Each condition runs once (it is deterministic) for 60 cycles.
//
// Output (results/):
//   activations.csv  running averages of /l/ and /r/ at every cycle, per condition
//
// Run:  node simulate.js [outputDir]        (25 runs, < 1 s)

const path = require('path');
const { L, R, weights, run, externalInput } = require('../lib/iac');
const { outputDir, writeCsv, writeMetadata } = require('../../lib/sim-utils');

const CYCLES = 60;
const INPUTS = [0.3, 0.4, 0.5, 0.6, 0.7];
const CONTEXT_STRENGTH = 0.5;
const CONTEXTS = ['s', 'p', 't', 'none', 'isolated'];

const dir = outputDir(__dirname);
const rows = [];
for (const context of CONTEXTS) {
  const w = weights({ isolated: context === 'isolated' });
  const unit = ['s', 'p', 't'].includes(context) ? context : null;
  for (const input of INPUTS) {
    run(w, externalInput(input, unit, CONTEXT_STRENGTH), {
      cycles: CYCLES,
      onCycle: (cycle, a, abar) => rows.push([context, input, cycle, abar[L], abar[R]]),
    });
  }
}

writeCsv(path.join(dir, 'activations.csv'), ['context', 'input', 'cycle', 'abar_l', 'abar_r'], rows);
writeMetadata(dir, {
  example: 'mcclelland-1991/01-luce-readout',
  cycles: CYCLES,
  inputs: INPUTS,
  contexts: CONTEXTS,
  contextStrength: CONTEXT_STRENGTH,
});
