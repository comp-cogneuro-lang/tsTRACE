// Example 2b: time course of cohort and rhyme competition across the whole
// lexicon, with as few added assumptions as possible.
// (After Allopenna, Magnuson & Tanenhaus, 1998; 02a is the close replication.)
//
// Question: as a word unfolds, how strongly do its cohorts (same onset) and
// rhymes (same ending) compete with it, and when?
//
// Design: every word in the default lexicon is presented once as the target,
// preceded by a carrier word drawn at random from the lexicon (a different one
// per trial, seeded, so runs repeat exactly): "-" + carrier + target + "-".
// The carrier stands in for running speech, so the target's onset is not the
// start of the input. For each target we classify every other word:
//   cohort     shares the target's first two phonemes             (beaker / beetle)
//   rhyme      identical from the first vowel to the end, with a
//              different onset (the consonants before that vowel) (beaker / speaker)
//   unrelated  everything else
// Every (target, cohort) pair and every (target, rhyme) pair is a unit of
// analysis; plot.py analyzes the two kinds separately, so each analysis's
// target curve comes from exactly the targets in its pairs. Each word's
// activation is that of its most active copy (the alignment whose activation
// peaks highest over the run), among copies aligned no earlier than one
// phoneme before the target's onset (so copies lined up with the carrier are
// ignored). Original default parameters.
//
// Output (results/): pairs.csv, one row per pair x cycle, with the activation
// of the target, the competitor, and the mean of the target's unrelated words.
//
// Run:  node simulate.js [outputDir]        (~30 s)

const path = require('path');
const { TraceSim, createDefaultConfig } = require('tstrace');
const { slotOf, maxCopy, outputDir, isSmoke, writeCsv, writeMetadata } = require('../lib/sim-utils');

const CYCLES = 100;
const SEED = 1998;

/** Small seeded random number generator (mulberry32), so carriers repeat across runs. */
const random = ((seed) => () => {
  seed = (seed + 0x6d2b79f5) >>> 0;
  let t = Math.imul(seed ^ (seed >>> 15), seed | 1);
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
})(SEED);

const VOWELS = /[aiu^]/; // the vowels of the original TRACE phoneme set

/** Split a word at its first vowel: onset (consonants before it) and rhyme (the rest). */
const split = (w) => {
  const v = w.search(VOWELS);
  return v < 0 ? { onset: w, rhyme: '' } : { onset: w.slice(0, v), rhyme: w.slice(v) };
};

// "-" is the silence word, never a competitor
const isCohort = (w, target) => w !== '-' && w !== target && w.slice(0, 2) === target.slice(0, 2);
const isRhyme = (w, target) => {
  const a = split(w);
  const b = split(target);
  return w !== '-' && w !== target && a.rhyme !== '' && a.rhyme === b.rhyme && a.onset !== b.onset && !isCohort(w, target);
};

const dir = outputDir(__dirname);
const lexicon = createDefaultConfig().lexicon.map((w) => w.phon);
// the silence "word" is not a real target or competitor
const words = lexicon.filter((w) => w !== '-');
// smoke mode: a few targets that have both cohorts and rhymes
const targets = isSmoke()
  ? words.filter((t) => words.some((w) => isCohort(w, t)) && words.some((w) => isRhyme(w, t))).slice(0, 5)
  : words;

const rows = [];
const pairCount = { cohort: 0, rhyme: 0 };

targets.forEach((target, n) => {
  // carrier: any other real word
  const others = words.filter((w) => w !== target);
  const carrier = others[Math.floor(random() * others.length)];
  const config = createDefaultConfig();
  config.modelInput = `-${carrier}${target}-`;
  const sim = new TraceSim(config);
  sim.cycle(CYCLES);
  const onset = slotOf(config, 1 + carrier.length); // slot of the target's first phoneme
  // word rows follow config.lexicon order
  const act = (w) => maxCopy(sim, lexicon.indexOf(w), { from: onset - 2 });

  const cohorts = words.filter((w) => isCohort(w, target));
  const rhymes = words.filter((w) => isRhyme(w, target));
  if (cohorts.length === 0 && rhymes.length === 0) return; // nothing to compare
  const unrelated = words.filter((w) => w !== target && !cohorts.includes(w) && !rhymes.includes(w));
  const targetAct = act(target);
  const unrelatedActs = unrelated.map(act);
  const unrelatedMean = targetAct.map((_, c) => unrelatedActs.reduce((a, u) => a + u[c], 0) / unrelatedActs.length);

  for (const [type, competitors] of [['cohort', cohorts], ['rhyme', rhymes]]) {
    for (const competitor of competitors) {
      const compAct = act(competitor);
      for (let cycle = 0; cycle < CYCLES; cycle++) {
        rows.push([type, target, competitor, carrier, cycle, targetAct[cycle], compAct[cycle], unrelatedMean[cycle]]);
      }
      pairCount[type]++;
    }
  }
  if ((n + 1) % 50 === 0) console.log(`${n + 1} / ${targets.length} targets`);
});

writeCsv(
  path.join(dir, 'pairs.csv'),
  ['type', 'target', 'competitor', 'carrier', 'cycle', 'target_act', 'competitor_act', 'unrelated_act'],
  rows
);
writeMetadata(dir, { example: '02b-cohort-rhyme-minimal', cycles: CYCLES, seed: SEED, targets: targets.length, pairs: pairCount, parameters: 'defaults' });
