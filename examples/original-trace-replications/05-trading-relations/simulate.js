// M&E (1986) Figs. 15-18: trading relations between two cues to /g/ vs /k/.
// (Magnuson & Crinnion, 2022, Table 22.1, effect 6.)
//
// Question: TRACE adds up the bottom-up support a phoneme unit gets from all
// feature dimensions. Can a strong cue on one dimension then make up for a
// weak cue on another, as listeners trade voice onset time (VOT) against
// first-formant onset frequency (F1OF) (Summerfield & Haggard, 1977)?
//
// Model: the stripped-down /-/, /a/, /g/, /k/ model of lib/ga-ka.js (no word
// level, M&E's parameter changes). Stimuli: 5 VOT patterns x 5 F1OF patterns,
// each a bump between canonical /g/ and /k/, in /-Xa-/. The five values are
// centered on the /g/-/k/ boundary and span Stimuli 4-8 of the categorical-
// perception continuum (see README for why). The consonant X is supplied as an
// input-only phoneme (config.inputPhonemes).
//
// Output (results/):
//   trading.csv   activations of the /g/ and /k/ units at slice 12 (slot 4),
//                 one row per stimulus x cycle
//   patterns.csv  the VOT/F1OF patterns: canonical /g/ and /k/ and the five
//                 intermediate values (the same on both dimensions)
//   snapshot.csv  the phoneme level every 3 cycles for the most /g/-like stimulus (Fig. 17)
//
// Run:  node simulate.js [outputDir]        (25 simulations, ~2 s)

const path = require('path');
const { TraceSim } = require('tstrace');
const { slotOf, phonemeRow, traceSnapshot, outputDir, isSmoke, writeCsv, writeMetadata } = require('../../lib/sim-utils');
const { G_CENTER, K_CENTER, WIDTH, bump, consonant, gakaConfig, cpCenter } = require('../../lib/ga-ka');

const CYCLES = 60; // M&E read out at time slice 60
const STEPS = [4, 5, 6, 7, 8].map(cpCenter); // bump centers of the five values (1 = most /g/-like)
const USE = isSmoke() ? [0, 4] : [0, 1, 2, 3, 4];

const dir = outputDir(__dirname);
const rows = [];
const snapshotRows = [];

for (const v of USE) {
  for (const f of USE) {
    const config = gakaConfig();
    config.inputPhonemes = [consonant('X', STEPS[v], STEPS[f])];
    config.modelInput = '-Xa-';
    const sim = new TraceSim(config);
    sim.cycle(CYCLES);

    const slot = slotOf(config, 1); // the consonant: slice 12
    const g = phonemeRow(sim, 'g');
    const k = phonemeRow(sim, 'k');
    sim.phonLayer.forEach((layer, cycle) => rows.push([v + 1, f + 1, cycle, layer[g][slot], layer[k][slot]]));
    if (v === 0 && f === 0) {
      const every3 = Array.from({ length: CYCLES / 3 }, (_, i) => 3 * i);
      for (const r of traceSnapshot(sim, config, every3)) if (r[1] === 'phoneme') snapshotRows.push(r);
    }
  }
}

const patterns = [['/g/', G_CENTER], ...STEPS.map((c, i) => [String(i + 1), c]), ['/k/', K_CENTER]];
const patternRows = patterns.flatMap(([name, c]) => bump(c).map((value, unit) => [name, c, unit, value]));

writeCsv(path.join(dir, 'trading.csv'), ['vot', 'f1of', 'cycle', 'g', 'k'], rows);
writeCsv(path.join(dir, 'patterns.csv'), ['pattern', 'center', 'unit', 'value'], patternRows);
writeCsv(path.join(dir, 'snapshot.csv'), ['cycle', 'level', 'unit', 'slot', 'length', 'activation'], snapshotRows);
writeMetadata(dir, {
  example: 'original-trace-replications/05-trading-relations',
  cycles: CYCLES,
  centers: { g: G_CENTER, k: K_CENTER, steps: STEPS },
  width: WIDTH,
  parameters: 'defaults, except alpha.PF 0.05, decay.F 0.03, gamma.P 0.05, no word level (lib/ga-ka.js)',
});
