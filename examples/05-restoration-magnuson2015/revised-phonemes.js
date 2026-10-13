// Revised phoneme definitions from Magnuson (2015, Fig. 6, bottom), and a
// worked example of changing phoneme features in tsTRACE.
//
// How TRACE phonemes are defined: each phoneme is a vector of 63 values,
// 7 features (POW, VOC, DIF, ACU, GRD, VOI, BUR) x 9 levels. Value
// features[f * 9 + (level - 1)] is that phoneme's input on level `level` of
// feature f. Level 9 of every feature is reserved for silence ("-").
//
// The original definitions (createDefaultConfig().phonology) use 7 to 12 of
// the 63 values, some with partial values (0.1-0.5). /k/ and /g/ have the most
// values on, so they resemble broadband noise most. Magnuson (2015) gave every
// phoneme exactly one level per feature (7 values, all 1.0), keeping the
// original similarity structure: the strongest original level is kept, BUR
// levels are added where a phoneme had none (7 for /s S/, 8 for liquids and
// vowels), and a few vowel levels move.
//
// Read from the published figure. Its VOI row does not show /b d g/ in either
// panel; they keep their original voiced level (2), which gives each phoneme
// the seven features the caption describes.

const FEATURES = ['POW', 'VOC', 'DIF', 'ACU', 'GRD', 'VOI', 'BUR'];

// one level (1-9) per feature, in FEATURES order
const REVISED_LEVELS = {
  p: [5, 8, 2, 7, 8, 8, 1],
  b: [5, 8, 2, 7, 8, 2, 2],
  t: [5, 8, 2, 2, 8, 8, 3],
  d: [5, 8, 2, 2, 8, 2, 4],
  k: [5, 8, 7, 6, 8, 8, 5],
  g: [5, 8, 7, 6, 8, 2, 6],
  s: [3, 5, 2, 1, 4, 8, 7],
  S: [3, 5, 3, 5, 4, 8, 7],
  r: [2, 2, 8, 7, 5, 1, 8],
  l: [2, 2, 7, 5, 5, 1, 8],
  a: [1, 1, 6, 8, 2, 1, 8],
  i: [1, 1, 1, 3, 2, 1, 8],
  u: [1, 1, 5, 4, 2, 1, 8],
  '^': [2, 1, 4, 8, 2, 1, 8],
  '-': [9, 9, 9, 9, 9, 9, 9],
};

/** 63-value feature vector with a 1.0 at each listed level. */
const featureVector = (levels) => {
  const v = Array(FEATURES.length * 9).fill(0);
  levels.forEach((level, f) => {
    v[f * 9 + (level - 1)] = 1;
  });
  return v;
};

/**
 * Replace the features of every phoneme in config.phonology with the revised
 * definitions. Everything else about each phoneme (label, duration) is kept.
 */
const useRevisedPhonemes = (config) => {
  config.phonology = config.phonology.map((phoneme) => ({
    ...phoneme,
    features: featureVector(REVISED_LEVELS[phoneme.label]),
  }));
  return config;
};

module.exports = { FEATURES, REVISED_LEVELS, featureVector, useRevisedPhonemes };
