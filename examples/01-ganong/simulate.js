// Example 1: the Ganong effect -- lexical context shifts phoneme identification.
//
// Question: does the word an ambiguous phoneme would complete pull its
// identification toward that word? (Ganong, 1980; McClelland & Elman, 1986.)
//
// Design: a 7-step /b/-/p/ continuum (step 0 = /b/, step 6 = /p/) placed
// before two contexts from the default lexicon:
//   _l^g   "plug" is a word, "blug" is not  -> context favors /p/
//   _l^d   "blood" is a word, "plood" is not -> context favors /b/
// Everything else uses the original default parameters.
//
// Output (results/): ganong.csv, one row per context x step x cycle, with the
// activations of the /b/ and /p/ phoneme units at the ambiguous phoneme's
// slot, and of the most active copies of "plug" and "blood".
//
// Run:  node simulate.js [outputDir]        (~2 s)

const path = require('path');
const { TraceSim, createDefaultConfig } = require('tstrace');
const { slotOf, phonemeRow, maxCopy, outputDir, isSmoke, writeCsv, writeMetadata } = require('../lib/sim-utils');

const CYCLES = 100;
const STEPS = 7;
const CONTEXTS = { plug: 'l^g', blood: 'l^d' }; // name -> phonemes after the ambiguous one

const dir = outputDir(__dirname);
const rows = [];

for (const [context, rest] of Object.entries(CONTEXTS)) {
  for (let step = 0; step < (isSmoke() ? 2 : STEPS); step++) {
    const config = createDefaultConfig();
    // continuumSpec "bp7" adds input-only phonemes "0".."6" blending /b/ into /p/
    config.continuumSpec = `bp${STEPS}`;
    config.modelInput = `-${step}${rest}-`;

    const sim = new TraceSim(config);
    sim.cycle(CYCLES);

    // the ambiguous phoneme is input position 1 (after the leading silence)
    const slot = slotOf(config, 1);
    const b = phonemeRow(sim, 'b');
    const p = phonemeRow(sim, 'p');
    // word rows follow config.lexicon order; use each word's most active copy
    const plug = maxCopy(sim, config.lexicon.findIndex((w) => w.phon === 'pl^g'));
    const blood = maxCopy(sim, config.lexicon.findIndex((w) => w.phon === 'bl^d'));

    for (let cycle = 0; cycle < CYCLES; cycle++) {
      rows.push([
        context,
        step,
        cycle,
        sim.phonLayer[cycle][b][slot],
        sim.phonLayer[cycle][p][slot],
        plug[cycle],
        blood[cycle],
      ]);
    }
  }
}

writeCsv(path.join(dir, 'ganong.csv'), ['context', 'step', 'cycle', 'b', 'p', 'plug', 'blood'], rows);
writeMetadata(dir, { example: '01-ganong', cycles: CYCLES, steps: STEPS, contexts: CONTEXTS, parameters: 'defaults' });
