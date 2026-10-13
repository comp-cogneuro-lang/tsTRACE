// Dahan, Magnuson, Tanenhaus & Hogan (2001), pp. 529-530: lexical decisions
// to cross-spliced words, simulated from TRACE activations.
//
// Question: lexical-decision studies (Marslen-Wilson & Warren, 1994; McQueen et
// al., 1999) found equal latencies for W2W1 and N3W1, which seemed to rule out
// lexical competition. Dahan et al. proposed that a "yes" can be triggered by
// either the target W1 or the competitor W2 reaching threshold. W2W1 then mixes
// early W2-driven responses with late, competition-delayed W1 responses, so its
// mean can match N3W1's while its variability is larger (as in McQueen et al.'s
// data: SDs 162, 201, 168 ms for W1W1, W2W1, N3W1).
//
// The paper gives only the outline ("a 'yes' response is generated
// probabilistically when either the target (W1) or the competitor (W2) reaches
// threshold ... 1000 times for each of the 15 experimental items, across a range
// of response thresholds"); the details were in an unpublished report. The
// rule used here: on each run the threshold is the nominal value plus normal
// noise (SD 0.05); the response time is the first cycle at which W1 or W2 (most
// active copies) reaches it. Runs that never reach it give no response.
//
// TRACE activations come from the same simulations as example 01 (15 items x
// 3 conditions, archived lexicon and splicing), with both parameter sets
// (archive and me86; see lib/items.js). The archived code contains no
// lexical-decision simulation, so this rule remains a reconstruction.
//
// Output (results/):
//   decisions.csv  per parameter set x item x condition x threshold: runs,
//                  responses, mean and SD of response cycle, and the share of
//                  responses W2 triggered
//
// Run:  node simulate.js [outputDir]        (90 simulations + 1000 runs per cell, ~8 s)

const path = require('path');
const { TraceSim } = require('tstrace');
const { maxCopy, outputDir, isSmoke, writeCsv, writeMetadata } = require('../../lib/sim-utils');
const { SUBCAT, subcatConfig, spliced, mulberry32 } = require('../lib/items');

const CYCLES = 100;
const RUNS = isSmoke() ? 50 : 1000;
const THRESHOLD_SD = 0.05;
const THRESHOLDS = [0.1, 0.15, 0.2, 0.25, 0.3, 0.35, 0.4, 0.45, 0.5];
const CONDITIONS = { W1W1: 1, W2W1: 2, N3W1: 3 };
const PARAMS = ['archive', 'me86'];
const ITEMS = isSmoke() ? SUBCAT.slice(0, 2) : SUBCAT;
const SEED = 2001;

const gauss = (random) => Math.sqrt(-2 * Math.log(1 - random())) * Math.cos(2 * Math.PI * random());

const dir = outputDir(__dirname);
const random = mulberry32(SEED);
const rows = [];

for (const params of PARAMS) for (const item of ITEMS) {
  const [name, w1, w2] = item;
  for (const [condition, pre] of Object.entries(CONDITIONS)) {
    const config = subcatConfig(params);
    config.modelInput = spliced(item[pre], w1, config);
    const sim = new TraceSim(config);
    sim.cycle(CYCLES);
    const a1 = maxCopy(sim, config.lexicon.findIndex((w) => w.phon === w1));
    const a2 = maxCopy(sim, config.lexicon.findIndex((w) => w.phon === w2));

    for (const threshold of THRESHOLDS) {
      const rts = [];
      let byW2 = 0;
      for (let run = 0; run < RUNS; run++) {
        const theta = threshold + THRESHOLD_SD * gauss(random);
        const t = a1.findIndex((x, c) => x >= theta || a2[c] >= theta);
        if (t >= 0) {
          rts.push(t);
          if (a2[t] >= theta && a1[t] < theta) byW2++;
        }
      }
      const mean = rts.length ? rts.reduce((s, x) => s + x, 0) / rts.length : NaN;
      const sd = rts.length > 1 ? Math.sqrt(rts.reduce((s, x) => s + (x - mean) ** 2, 0) / (rts.length - 1)) : NaN;
      rows.push([params, name, condition, threshold, RUNS, rts.length, mean, sd, rts.length ? byW2 / rts.length : NaN]);
    }
  }
}

writeCsv(
  path.join(dir, 'decisions.csv'),
  ['params', 'item', 'condition', 'threshold', 'runs', 'responses', 'mean_rt', 'sd_rt', 'share_w2'],
  rows
);
writeMetadata(dir, {
  example: 'dahan-2001/02-subcategorical-lexical-decision',
  cycles: CYCLES,
  runs: RUNS,
  thresholds: THRESHOLDS,
  thresholdSD: THRESHOLD_SD,
  seed: SEED,
  parameters: { archive: 'distribution phonemes and spreads, alpha.WP 0.015, gamma.P 0.05', me86: 'defaults' },
});
