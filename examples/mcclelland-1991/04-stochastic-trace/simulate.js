// McClelland (1991) Fig. 9: TRACE with intrinsic noise gives the classical
// joint effects of context and stimulus.
//
// Question: the small network of examples 01-03 lacks time, features and a
// real lexicon. Does the full TRACE model, with noise added to every unit's
// net input, still give parallel straight lines in z(P(/r/))?
//
// Design (pp. 23-25): 3 contexts x 3 targets, 500 trials each, 90 cycles.
//   inputs:  /s_i/, /p_i/, /t_i/ with an /l/-like, neutral, or /r/-like liquid,
//            preceded and followed by two silences, so the liquid peaks at slice 24
//   liquids: /r/ and /l/ made more similar on the acuteness dimension
//            (footnote 4: .25 .50 .75 for /r/, .75 .50 .25 for /l/, .50 .50 .50
//            for the neutral one, on units 4-6), presented as input-only
//            phonemes (config.inputPhonemes) so the /r/ and /l/ units keep their
//            usual definitions. All other dimensions as in the default phonemes;
//            on diffuseness, where /r/ and /l/ differ, the neutral liquid gets
//            their average (a choice made here; the paper doesn't say).
//   changes to the M&E parameters (pp. 23-25): feature spread 3 on every
//            dimension (so phonemes don't overlap), word resting level -0.1,
//            phoneme-to-word excitation 0.05, word-to-phoneme excitation 0.02,
//            feature decay 0.02, and processing noise SD 0.02 (stochasticitySD)
//   response: running averages (lambda 0.05) of the /l/ and /r/ units at slice
//            24 (slot 8); the larger one at cycle 90 is the response
// Each trial has its own seed, so results are the same however many workers run.
// The 9 conditions are also run once without noise, for the original
// deterministic readout (Luce choice on the running averages, as in example 01).
//
// Output (results/):
//   trials.csv         one row per noisy trial: final running averages and response
//   deterministic.csv  final running averages for the 9 conditions without noise
//
// Run:  WORKERS=8 node simulate.js [outputDir]   (4,500 trials; ~18 min on one
//       worker, ~3 min on 8). Keep WORKERS at or below ~70% of physical cores.
//       TRIALS=100 node simulate.js                (fewer trials per condition)

const os = require('os');
const path = require('path');
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');
const { TraceSim, createDefaultConfig } = require('tstrace');
const { slotOf, phonemeRow, outputDir, isSmoke, writeCsv, writeMetadata } = require('../../lib/sim-utils');

const CYCLES = 90;
const LAMBDA = 0.05;
const NOISE_SD = 0.02;
const CONTEXTS = ['s', 'p', 't'];
const TARGETS = { 'l-like': 'L', neutral: 'N', 'r-like': 'R' };
const ACUTENESS = {
  R: [0, 0, 0, 0, 0.25, 0.5, 0.75, 0, 0],
  L: [0, 0, 0, 0, 0.75, 0.5, 0.25, 0, 0],
  N: [0, 0, 0, 0, 0.5, 0.5, 0.5, 0, 0],
};
const TRIALS = isSmoke() ? 3 : Number(process.env.TRIALS) || 500;
const SEED = 1991;
const DIF = 2; // feature dimensions: diffuseness ...
const ACU = 3; // ... and acuteness

/** The three liquids: /r/'s features with acuteness (and, for N, diffuseness) changed. */
const liquids = (phonology) => {
  const r = phonology.find((p) => p.label === 'r');
  const l = phonology.find((p) => p.label === 'l');
  return Object.entries(ACUTENESS).map(([label, acu]) => {
    const dif = label === 'R' ? r : label === 'L' ? l : null;
    const features = [...r.features];
    for (let u = 0; u < 9; u++) {
      features[DIF * 9 + u] = dif ? dif.features[DIF * 9 + u] : (r.features[DIF * 9 + u] + l.features[DIF * 9 + u]) / 2;
      features[ACU * 9 + u] = acu[u];
    }
    return { ...r, label, features, durationScalar: [...r.durationScalar] };
  });
};

const makeConfig = (context, target, noiseSD, seed) => {
  const config = createDefaultConfig();
  config.spread = Array(config.continuaPerFeature).fill(3);
  config.rest = { ...config.rest, W: -0.1 };
  config.alpha = { ...config.alpha, PW: 0.05, WP: 0.02 };
  config.decay = { ...config.decay, F: 0.02 };
  config.stochasticitySD = noiseSD;
  config.seed = seed;
  config.inputPhonemes = liquids(config.phonology);
  config.modelInput = `--${context}${target}i--`;
  return config;
};

/** One trial: final running averages of the /l/ and /r/ units at the liquid's slot. */
const trial = (context, target, noiseSD, seed) => {
  const config = makeConfig(context, target, noiseSD, seed);
  const sim = new TraceSim(config);
  sim.cycle(CYCLES);
  const slot = slotOf(config, 3); // input position 3: after two silences and the context
  const l = phonemeRow(sim, 'l');
  const r = phonemeRow(sim, 'r');
  let abarL = config.rest.P;
  let abarR = config.rest.P;
  for (const layer of sim.phonLayer) {
    abarL = LAMBDA * layer[l][slot] + (1 - LAMBDA) * abarL;
    abarR = LAMBDA * layer[r][slot] + (1 - LAMBDA) * abarR;
  }
  return [abarL, abarR];
};

if (!isMainThread) {
  // worker: run the trials it was given and send back one row per trial
  parentPort.postMessage(
    workerData.map(({ context, target, n, seed }) => [context, target, n, ...trial(context, TARGETS[target], NOISE_SD, seed)])
  );
} else {
  const dir = outputDir(__dirname);
  const jobs = [];
  CONTEXTS.forEach((context, ci) =>
    Object.keys(TARGETS).forEach((target, ti) => {
      for (let n = 0; n < TRIALS; n++) jobs.push({ context, target, n, seed: SEED + (ci * 3 + ti) * 100000 + n });
    })
  );
  const workers = Math.max(1, Math.min(Number(process.env.WORKERS) || 1, jobs.length));
  console.log(`${jobs.length} trials on ${workers} worker(s) (${os.cpus().length} logical CPUs)`);
  const started = Date.now();
  const chunks = Array.from({ length: workers }, (_, w) => jobs.filter((_, i) => i % workers === w));
  Promise.all(
    chunks.map(
      (chunk) =>
        new Promise((resolve, reject) => {
          const worker = new Worker(__filename, { workerData: chunk });
          worker.on('message', resolve);
          worker.on('error', reject);
        })
    )
  ).then((results) => {
    const rows = results.flat().map((row) => [...row, row[4] > row[3] ? 'r' : 'l']);
    rows.sort((a, b) => a[0].localeCompare(b[0]) || a[1].localeCompare(b[1]) || a[2] - b[2]);
    console.log(`noisy trials done in ${((Date.now() - started) / 1000).toFixed(0)} s`);

    const deterministic = [];
    for (const context of CONTEXTS) {
      for (const [target, label] of Object.entries(TARGETS)) deterministic.push([context, target, ...trial(context, label, 0, null)]);
    }

    writeCsv(path.join(dir, 'trials.csv'), ['context', 'target', 'trial', 'abar_l', 'abar_r', 'response'], rows);
    writeCsv(path.join(dir, 'deterministic.csv'), ['context', 'target', 'abar_l', 'abar_r'], deterministic);
    writeMetadata(dir, {
      example: 'mcclelland-1991/04-stochastic-trace',
      cycles: CYCLES,
      trialsPerCondition: TRIALS,
      noiseSD: NOISE_SD,
      lambda: LAMBDA,
      acuteness: ACUTENESS,
      seed: SEED,
      parameters: 'defaults, except spread 3 (all dimensions), rest.W -0.1, alpha.PW 0.05, alpha.WP 0.02, decay.F 0.02',
    });
  });
}
