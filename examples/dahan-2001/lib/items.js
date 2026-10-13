// Stimuli and model settings shared by the Dahan et al. (2001) examples.
//
// Transcriptions are the papers' own TRACE transcriptions (read from the
// appendix tables): Dahan, Magnuson, Tanenhaus & Hogan (2001), Appendix A, and
// Dahan, Magnuson & Tanenhaus (2001), Appendices A and C, with their IPA-like
// symbols mapped to TRACE labels (ɒ -> a, ʌ -> ^, ʃ -> S, ɹ -> r).
// Frequencies are the Francis & Kučera (1982) counts the papers list.

const { createDefaultConfig } = require('tstrace');

// --- Subcategorical mismatch (Dahan et al., 2001, LCP), Appendix A -------------
// [name, W1 (target), W2 (word competitor), N3 (nonword competitor)]
const SUBCAT = [
  ['net', 'git', 'gik', 'gip'],
  ['tap', 'tap', 'tak', 'tat'],
  ['bud', 'bud', 'bug', 'bub'],
  ['butt', 'b^t', 'b^k', 'b^p'],
  ['carp', 'kup', 'kut', 'kuk'],
  ['fort', 'srt', 'srk', 'srp'],
  ['harp', 'lrp', 'lrt', 'lrk'],
  ['cat', 'kat', 'kab', 'kag'],
  ['bat', 'bat', 'bag', 'bab'],
  ['road', 'rid', 'rip', 'rik'],
  ['pit', 'pit', 'pig', 'pib'],
  ['hood', 'sud', 'suk', 'sup'],
  ['knot', 'gut', 'gub', 'gug'],
  ['beak', 'bik', 'bid', 'bib'],
  ['rod', 'rud', 'ruk', 'rup'],
];

/**
 * Model input for one splicing condition. All items are CVC, so the input is
 * silence, C, V, C, silence, with the final consonant peaking at slice 24. The
 * paper put the splice point just before that peak: slices up to 23 come from
 * the first token, slices from 24 on from W1. In tsTRACE that is a splice of the
 * final consonant, "{x6y}": phoneme x for the first 6 slices of its 12-slice
 * span (up to its peak), phoneme y from the peak on.
 */
const spliced = (pre, w1) => (pre === w1 ? `-${w1}-` : `-${w1.slice(0, 2)}{${pre[2]}6${w1[2]}}-`);

// --- Frequency (Dahan, Magnuson & Tanenhaus, 2001, Cogn Psych) ------------------
// Experiment 1, Appendix A: [name, target, f, HF cohort, f, LF cohort, f]
const FREQ_EXP1 = [
  ['band aid', 'babdad', 0, 'bank', 'babk', 110, 'banjo', 'babSu', 1],
  ['bench', 'bibS', 42, 'bed', 'bid', 139, 'bell', 'bil', 23],
  ['cane', 'kug', 13, 'cake', 'kuk', 16, 'cage', 'kuS', 11],
  ['cannon', 'kab^g', 4, 'camera', 'kab^r^', 46, 'camel', 'kab^l', 2],
  ['carpet', 'karp^t', 17, 'card', 'kard', 61, 'cart', 'kart', 9],
  ['cellist', 'S^list', 2, 'chair', 'S^ir', 89, 'chess', 'S^s', 3],
  ['chimney', 'Sibpi', 7, 'children', 'Sildr^g', 346, 'chicken', 'Sik^g', 49],
  ['clover', 'klug^r', 16, 'cloud', 'klud', 64, 'clown', 'klub', 6],
  // cone is printed /kun/, but TRACE has no /n/; /kud/ (n -> d) is used here
  ['coconut', 'kukub^t', 10, 'coat', 'kut', 52, 'cone', 'kud', 15],
  ['hanger', 'sapg^r', 1, 'hand', 'sapd', 717, 'hammer', 'sab^r', 6],
  ['mountain', 'bupt^b', 98, 'mouth', 'buS', 113, 'mouse', 'bus', 20],
  ['pizza', 'p^sa', 3, 'peanut', 'p^b^t', 11, 'peacock', 'p^kuk', 6],
  ['pepper', 'pup^r', 13, 'pencil', 'pubsil', 38, 'penguin', 'pubgib', 0],
  ['pillow', 'pilu', 11, 'picture', 'piktr', 227, 'pickle', 'pikl', 2],
  ['snowman', 'spub^b', 0, 'snake', 'spak', 70, 'snail', 'spal', 3],
  // trunk is printed /trʌ^bk/ here and /trʌbk/ in Appendix C; the latter is used
  ['trumpet', 'tr^b^t', 6, 'truck', 'tr^k', 80, 'trunk', 'tr^bk', 13],
  ['whistle', 'Sus^l', 3, 'window', 'Subdu', 172, 'windmill', 'Subdbil', 1],
];
// Experiment 2, Appendix C: [LF name, transcription, f, HF name, transcription, f].
// (The appendix's two TRACE columns are headed "HF" and "LF" but list the
// low-frequency word first, e.g. bell /bil/, bed /bid/.)
const FREQ_EXP2 = [
  ['bell', 'bil', 23, 'bed', 'bid', 139],
  ['cap', 'kap', 22, 'cat', 'kat', 42],
  ['cart', 'kart', 9, 'card', 'kard', 61],
  ['chain', 'Sib', 60, 'chair', 'Sir', 89],
  ['chicken', 'Sik^g', 49, 'children', 'Sildr^g', 346],
  ['clown', 'klub', 6, 'cloud', 'klud', 64],
  ['comb', 'kub', 6, 'coat', 'kut', 52],
  ['couch', 'k^S', 2, 'cow', 'k^^', 46],
  ['flask', 'dlask', 5, 'flag', 'dlag', 18],
  ['harp', 'larp', 1, 'heart', 'lart', 199],
  ['horn', 'lirb', 33, 'horse', 'lirs', 233],
  ['lamb', 'lab', 14, 'lamp', 'labp', 24],
  ['mouse', 'bus', 20, 'mouth', 'buS', 113],
  ['penguin', 'pubgib', 0, 'pencil', 'pubsil', 38],
  ['pitcher', 'pitSr', 29, 'picture', 'piktr', 277],
  ['plane', 'plab', 2, 'plate', 'plat', 44],
  ['snail', 'spal', 3, 'snake', 'spak', 70],
  ['trunk', 'tr^bk', 13, 'truck', 'tr^k', 80],
  ['skate', 'skit', 1, 'scale', 'skil', 62],
  ['toad', 't^d', 4, 'toe', 't^^', 14],
  ['windmill', 'Subdbil', 1, 'window', 'Subdu', 172],
];

/**
 * Default lexicon plus the given words (phon -> Kučera-Francis frequency). Words
 * already in the lexicon get the papers' frequencies. As in the papers,
 * frequencies above 1000 count as 1000.
 */
const buildLexicon = (words) => {
  const lexicon = createDefaultConfig().lexicon.map((w) => ({ ...w }));
  const index = new Map(lexicon.map((w, i) => [w.phon, i]));
  for (const [phon, freq] of words) {
    if (index.has(phon)) lexicon[index.get(phon)].freq = freq;
    else {
      index.set(phon, lexicon.length);
      lexicon.push({ phon, freq, prime: 0 });
    }
  }
  return lexicon;
};

/** The frequency simulations' lexicon: default + every Experiment 1 and 2 stimulus. */
const frequencyLexicon = () =>
  buildLexicon([
    ...FREQ_EXP1.flatMap((r) => [[r[1], r[2]], [r[4], r[5]], [r[7], r[8]]]),
    ...FREQ_EXP2.flatMap((r) => [[r[1], r[2]], [r[4], r[5]]]),
  ]);

/**
 * Configuration for one of the papers' frequency implementations (Appendix B).
 * All use word resting level -0.3 (the papers' change from -0.01).
 *   'none'  no frequency
 *   'rest'  resting levels: rest_i = R + s log10(1 + f_i), s = 0.06
 *   'wt'    phoneme-to-word connections scaled by frequency, s = 0.13
 *   'post'  no frequency in the network (it is applied in the choice rule; see plot.py)
 * tsTRACE computes s log10(c f) with c = 1, so each word's freq is set to 1 + f
 * (f capped at 1000) to give the papers' log10(1 + f). The weight method is
 * tsTRACE's (from jTRACE): input scaled by 1 + s log10(f), applied to
 * word-to-phoneme feedback as well. The paper's Eq. 4 scales only
 * phoneme-to-word input, and by 1 + a s log10(1 + f); see the README.
 */
const frequencyConfig = (method, lexicon) => {
  const config = createDefaultConfig();
  config.rest = { ...config.rest, W: -0.3 };
  config.lexicon = lexicon.map((w) => ({ ...w, freq: 1 + Math.min(w.freq, 1000) }));
  if (method === 'rest') config.freqNode = { ...config.freqNode, RDL_rest_s: 0.06, RDL_rest_c: 1 };
  if (method === 'wt') config.freqNode = { ...config.freqNode, RDL_wt_s: 0.13, RDL_wt_c: 1 };
  return config;
};

/** Seeded uniform generator (mulberry32). */
const mulberry32 = (seed) => () => {
  seed |= 0;
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

/**
 * Phonologically unrelated distractors, as the papers chose them "from
 * unrelated items in the lexicon": n default-lexicon words of 3-5 phonemes that
 * begin with a different phoneme from every word in `avoid`, optionally within
 * a frequency range. The papers do not list their picks, so these are drawn
 * with a seeded generator.
 */
const pickDistractors = (random, n, avoid, { minFreq = 0, maxFreq = Infinity } = {}) => {
  const firsts = new Set(avoid.map((w) => w[0]));
  const pool = createDefaultConfig().lexicon.filter(
    (w) => w.phon.length >= 3 && w.phon.length <= 5 && !firsts.has(w.phon[0]) && w.freq >= minFreq && w.freq <= maxFreq
  );
  const picks = [];
  while (picks.length < n) {
    const w = pool[Math.floor(random() * pool.length)];
    if (!picks.includes(w.phon)) picks.push(w.phon);
  }
  return picks;
};

module.exports = {
  SUBCAT,
  spliced,
  FREQ_EXP1,
  FREQ_EXP2,
  buildLexicon,
  frequencyLexicon,
  frequencyConfig,
  mulberry32,
  pickDistractors,
};
