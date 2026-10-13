// The stripped-down model McClelland & Elman (1986, pp. 36-50) used for their
// trading-relations and categorical-perception simulations, rebuilt for tsTRACE.
//
// What M&E specify:
//   * only four phonemes: silence, /a/, /g/, /k/; no word level
//   * /g/ and /k/ identical on five feature dimensions, differing only on voice
//     onset time (VOT) and first-formant onset frequency (F1OF), which replace
//     the voicing and burst dimensions
//   * /a/ and silence share no feature units with /g/ or /k/ (here /a/ keeps
//     its default values except on diffuseness and acuteness, where they
//     overlap /g/ and /k/; there it uses unit 1)
//   * phoneme-to-feature feedback 0.05, feature decay 0.03, phoneme inhibition
//     0.05; everything else at the defaults
//   * canonical /g/ sends /k/ 75% as much bottom-up excitation as /g/
//   * input /-Xa-/, with the consonant X peaking at slice 12
// What is reconstructed here (M&E show it only in Figs. 15 and 19):
//   * the shape of the patterns on VOT and F1OF. Each is a Gaussian bump over
//     the dimension's 9 units, centered at unit 3 for /g/ and unit 6 for /k/,
//     with the outer units (0 and 8, used by /a/ and silence) left at 0. The
//     width (WIDTH) is fitted so that canonical /g/ gives /k/ 75% as much
//     excitation as /g/; it then gives 89% for M&E's Stimulus 5, against their 88%.
//   * intermediate stimuli move the bump's center along the dimension.

const { createDefaultConfig, createDefaultPhoneme } = require('tstrace');

const VOT = 5; // feature dimension (continuum) that holds voicing in the default phonemes
const F1OF = 6; // ... and burst
const DIF = 2; // diffuseness
const ACU = 3; // acuteness
const G_CENTER = 3;
const K_CENTER = 6;
const WIDTH = 1.92;

/** Values of the 9 units of one dimension for a bump centered at `center`. */
const bump = (center) =>
  Array.from({ length: 9 }, (_, u) => (u === 0 || u === 8 ? 0 : Math.exp(-((u - center) ** 2) / (2 * WIDTH ** 2))));

const setDimension = (features, dim, values) => values.forEach((v, u) => (features[dim * 9 + u] = v));

/** A consonant: /g/'s values on the five shared dimensions, bumps on VOT and F1OF. */
const consonant = (label, votCenter, f1Center) => {
  const g = createDefaultConfig().phonology.find((p) => p.label === 'g');
  const phon = { ...createDefaultPhoneme(), label, features: [...g.features], durationScalar: [...g.durationScalar] };
  setDimension(phon.features, VOT, bump(votCenter));
  setDimension(phon.features, F1OF, bump(f1Center));
  return phon;
};

/**
 * Configuration for the /-/, /a/, /g/, /k/ model. `feedback` is the
 * phoneme-to-feature excitation (M&E: 0.05); pass 0 to switch it off.
 */
const gakaConfig = ({ feedback = 0.05 } = {}) => {
  const config = createDefaultConfig();
  const silence = config.phonology.find((p) => p.label === '-');
  const g = consonant('g', G_CENTER, G_CENTER);
  const k = consonant('k', K_CENTER, K_CENTER);
  const a = config.phonology.find((p) => p.label === 'a');
  // /a/ must share no feature units with /g/ or /k/. Its default values on the
  // diffuseness and acuteness dimensions overlap theirs, so on those two
  // dimensions it gets a single unused unit instead (unit 1).
  const vowel = { ...a, features: a.features.map((v, i) => (g.features[i] > 0 || k.features[i] > 0 ? 0 : v)) };
  for (const dim of [DIF, ACU]) setDimension(vowel.features, dim, [0, 1, 0, 0, 0, 0, 0, 0, 0]);
  config.phonology = [silence, vowel, g, k];
  // no word level: a lexicon holding only silence, with no connections to it
  config.lexicon = [{ phon: '-', freq: 1, prime: 0 }];
  config.alpha = { ...config.alpha, PW: 0, WP: 0, PF: feedback };
  config.decay = { ...config.decay, F: 0.03 };
  config.gamma = { ...config.gamma, P: 0.05 };
  return config;
};

/** Center of categorical-perception stimulus n (1-11): 3 is /g/, 9 is /k/, equal steps. */
const cpCenter = (n) => G_CENTER + ((n - 3) * (K_CENTER - G_CENTER)) / 6;

/**
 * Bottom-up excitation a consonant pattern sends to the /g/ and /k/ units:
 * the dot product of its features with each phoneme's (TRACE's feature-to-
 * phoneme weights are the phoneme's own feature values, scaled the same way
 * for /g/ and /k/, so the ratio is what matters).
 */
const bottomUp = (phon, config) => {
  const dot = (label) => {
    const p = config.phonology.find((x) => x.label === label);
    return p.features.reduce((s, v, i) => s + v * phon.features[i], 0);
  };
  return { g: dot('g'), k: dot('k') };
};

/** Indices of the VOT and F1OF feature units in sim.featLayer[cycle]. */
const CUE_ROWS = [...Array(9).keys()].map((u) => VOT * 9 + u).concat([...Array(9).keys()].map((u) => F1OF * 9 + u));

module.exports = { G_CENTER, K_CENTER, WIDTH, bump, consonant, gakaConfig, cpCenter, bottomUp, CUE_ROWS };
