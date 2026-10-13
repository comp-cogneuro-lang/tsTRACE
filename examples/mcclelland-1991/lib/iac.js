// The small interactive activation network of McClelland (1991, Fig. 5), used
// for his Figs. 4, 6 and 8. It is not TRACE: there is no time and no feature
// level, just three sets of units with inputs switched on until activations settle.
//
//   context units  /s/ /p/ /t/    (mutually inhibitory)
//   target units   /l/ /r/        (mutually inhibitory)
//   "word" units   /sl/ /pl/ /pr/ /tr/   (all mutually inhibitory)
//   each word unit is excitatorily connected (both ways) to its two phonemes,
//   so /s/ favors /l/, /t/ favors /r/, and /p/ is neutral.
//
// Processing (pp. 11-12), synchronous over units, for a number of cycles:
//   net_i = 0.1 * (sum_j w_ij * max(0, a_j) + ext_i)  (+ intrinsic noise, see below)
//   if net_i > 0:  da_i = (M - a_i) net_i - D (a_i - r)
//   otherwise:     da_i = (a_i - m) net_i - D (a_i - r)
// with weights +1 (excitatory) and -1 (inhibitory), M = 1, m = -0.2, r = -0.1,
// D = 0.1, and the excitatory, inhibitory and external inputs all scaled by 0.1
// (footnote 1; the I of Eq. 1). Running averages abar = lambda a + (1 - lambda) abar,
// lambda = 0.05, start at rest.
//
// Intrinsic noise (p. 21) adds a normal sample with SD sigma to each unit's
// net input on every cycle. The paper writes it into the unscaled net input
// (net_i = sum w o + e); here it is added after the 0.1 scaling, which is the
// reading under which sigma = 0.14 gives choice probabilities in the paper's
// range (about .02 to .98). See the README.

const UNITS = ['s', 'p', 't', 'l', 'r', 'sl', 'pl', 'pr', 'tr'];
const CONTEXT = [0, 1, 2];
const TARGET = [3, 4];
const WORDS = [5, 6, 7, 8];
const L = 3;
const R = 4;
const PARAMS = { max: 1, min: -0.2, rest: -0.1, decay: 0.1, scale: 0.1, lambda: 0.05 };

/** Weight matrix; isolated = true severs the target-word connections (the "x" condition). */
const weights = ({ isolated = false } = {}) => {
  const n = UNITS.length;
  const w = Array.from({ length: n }, () => Array(n).fill(0));
  const link = (a, b, v) => {
    w[a][b] = v;
    w[b][a] = v;
  };
  for (const group of [CONTEXT, TARGET, WORDS]) {
    for (const a of group) for (const b of group) if (a !== b) w[a][b] = -1;
  }
  for (const word of WORDS) {
    const [ctx, tgt] = UNITS[word].split('').map((u) => UNITS.indexOf(u));
    link(word, ctx, 1);
    if (!isolated) link(word, tgt, 1);
  }
  return w;
};

/** Standard normal sample (Box-Muller) from a uniform generator. */
const gauss = (random) => Math.sqrt(-2 * Math.log(1 - random())) * Math.cos(2 * Math.PI * random());

/**
 * Run one trial. ext: external input per unit (array of 9). Returns the
 * activations and running averages after `cycles` updates; onCycle, if given,
 * is called after every update with (cycle, a, abar).
 */
const run = (w, ext, { cycles = 60, noiseSD = 0, random = Math.random, onCycle = null } = {}) => {
  const { max, min, rest, decay, scale, lambda } = PARAMS;
  const n = UNITS.length;
  let a = Array(n).fill(rest);
  const abar = Array(n).fill(rest);
  const net = Array(n).fill(0);
  for (let c = 0; c < cycles; c++) {
    for (let i = 0; i < n; i++) {
      let sum = ext[i];
      for (let j = 0; j < n; j++) if (w[i][j] && a[j] > 0) sum += w[i][j] * a[j];
      net[i] = scale * sum + (noiseSD ? noiseSD * gauss(random) : 0);
    }
    a = a.map((ai, i) =>
      Math.min(max, Math.max(min, ai + (net[i] > 0 ? (max - ai) * net[i] : (ai - min) * net[i]) - decay * (ai - rest)))
    );
    for (let i = 0; i < n; i++) abar[i] = lambda * a[i] + (1 - lambda) * abar[i];
    if (onCycle) onCycle(c + 1, a, abar);
  }
  return { a, abar };
};

/**
 * External inputs for one condition. input: the value on the /l/-/r/ continuum
 * (input to /r/; /l/ gets 1 - input, p. 15). context: 's', 'p', 't', or null
 * (no context input); contextStrength: input to that context unit.
 */
const externalInput = (input, context, contextStrength) => {
  const ext = Array(UNITS.length).fill(0);
  ext[R] = input;
  ext[L] = 1 - input;
  if (context) ext[UNITS.indexOf(context)] = contextStrength;
  return ext;
};

/** Seeded uniform generator (mulberry32), so runs are repeatable. */
const mulberry32 = (seed) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

module.exports = { UNITS, L, R, PARAMS, weights, run, externalInput, gauss, mulberry32 };
