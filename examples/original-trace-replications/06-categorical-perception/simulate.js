// M&E (1986) Figs. 19-22: categorical perception of a /g/-/k/ continuum.
// (Magnuson & Crinnion, 2022, Table 22.1, effect 7.)
//
// Questions:
//   1. Identification: the bottom-up support for /g/ vs /k/ changes only a
//      little from step to step. Does competition at the phoneme level turn
//      that into a sharp identification function? (Figs. 20-21)
//   2. Discrimination: phoneme-to-feature feedback pushes the feature level
//      toward the winning phoneme's canonical pattern. Does that make stimuli
//      from the same category hard to tell apart, and stimuli that straddle
//      the boundary easy, as in listeners' ABX discrimination? (Figs. 21-22)
//
// Model: the stripped-down /-/, /a/, /g/, /k/ model of lib/ga-ka.js. Stimuli:
// 11 consonants equally spaced on both VOT and F1OF, from beyond /g/ (1) to
// beyond /k/ (11); 3 is canonical /g/ and 9 canonical /k/. Each is presented
// in /-Xa-/ as an input-only phoneme (config.inputPhonemes) for 60 cycles.
// Every stimulus is run twice: with M&E's phoneme-to-feature feedback (0.05)
// and, as a control added here, without it (0).
//
// Output (results/):
//   phonemes.csv  /g/ and /k/ activations at slice 12 (slot 4), per feedback x
//                 stimulus x cycle
//   features.csv  activations of the 18 VOT and F1OF feature units at slice 12
//                 (the consonant's center), every 5 cycles and at the last one
//   stimuli.csv   each stimulus's bump center and the bottom-up excitation it
//                 sends to /g/ and /k/
//
// Run:  node simulate.js [outputDir]        (22 simulations, ~2 s)

const path = require('path');
const { TraceSim } = require('tstrace');
const { slotOf, phonemeRow, outputDir, isSmoke, writeCsv, writeMetadata } = require('../../lib/sim-utils');
const { G_CENTER, K_CENTER, WIDTH, consonant, gakaConfig, cpCenter, bottomUp, CUE_ROWS } = require('../../lib/ga-ka');

const CYCLES = 60;
const STIMULI = isSmoke() ? [3, 5, 6, 7, 9] : [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];
const FEEDBACK = [0.05, 0];
const CENTER_SLICE = 12; // feature slice at the consonant's center

const dir = outputDir(__dirname);
const phonemeRows = [];
const featureRows = [];
const stimulusRows = [];

for (const feedback of FEEDBACK) {
  for (const n of STIMULI) {
    const config = gakaConfig({ feedback });
    const x = consonant('X', cpCenter(n), cpCenter(n));
    config.inputPhonemes = [x];
    config.modelInput = '-Xa-';
    const sim = new TraceSim(config);
    sim.cycle(CYCLES);

    const slot = slotOf(config, 1);
    const g = phonemeRow(sim, 'g');
    const k = phonemeRow(sim, 'k');
    sim.phonLayer.forEach((layer, cycle) => phonemeRows.push([feedback, n, cycle, layer[g][slot], layer[k][slot]]));
    sim.featLayer.forEach((layer, cycle) => {
      if (cycle % 5 === 0 || cycle === CYCLES - 1) {
        CUE_ROWS.forEach((row, unit) => featureRows.push([feedback, n, cycle, unit, layer[row][CENTER_SLICE]]));
      }
    });
    if (feedback === FEEDBACK[0]) {
      const bu = bottomUp(x, config);
      stimulusRows.push([n, cpCenter(n), bu.g, bu.k]);
    }
  }
}

writeCsv(path.join(dir, 'phonemes.csv'), ['feedback', 'stimulus', 'cycle', 'g', 'k'], phonemeRows);
writeCsv(path.join(dir, 'features.csv'), ['feedback', 'stimulus', 'cycle', 'unit', 'activation'], featureRows);
writeCsv(path.join(dir, 'stimuli.csv'), ['stimulus', 'center', 'bottomup_g', 'bottomup_k'], stimulusRows);
writeMetadata(dir, {
  example: 'original-trace-replications/06-categorical-perception',
  cycles: CYCLES,
  stimuli: STIMULI,
  feedback: FEEDBACK,
  centers: { g: G_CENTER, k: K_CENTER },
  width: WIDTH,
  parameters: 'defaults, except alpha.PF (see feedback), decay.F 0.03, gamma.P 0.05, no word level (lib/ga-ka.js)',
});
