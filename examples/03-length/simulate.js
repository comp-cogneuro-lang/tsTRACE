// Example 3: the two length effects (Magnuson et al., 2013; Pitt & Samuel, 2006).
//
// Question: do short words become active sooner, and long words more strongly?
// In TRACE a longer word overlaps more competitors in time, so early on it
// receives more lateral inhibition (a short-word advantage); later its larger
// bottom-up input wins out (a long-word advantage).
//
// Design: every word in the default lexicon is presented once ("-" + word + "-")
// and the activation of the target's most active copy (the alignment whose
// activation peaks highest) is recorded at every cycle. plot.py compares the
// shortest and longest words. Original default parameters.
//
// Output (results/): targets.csv, one row per word x cycle.
//
// Run:  node simulate.js [outputDir]        (~20 s)

const path = require('path');
const { TraceSim, createDefaultConfig } = require('tstrace');
const { maxCopy, outputDir, isSmoke, writeCsv, writeMetadata } = require('../lib/sim-utils');

const CYCLES = 100;

const dir = outputDir(__dirname);
const lexicon = createDefaultConfig().lexicon.map((w) => w.phon);
// skip the silence "word"; in smoke mode take a few short and a few long words
let words = lexicon.filter((w) => w !== '-');
if (isSmoke()) words = [...words.filter((w) => w.length <= 2).slice(0, 2), ...words.filter((w) => w.length >= 7).slice(0, 2)];

const rows = [];
words.forEach((word, n) => {
  const config = createDefaultConfig();
  config.modelInput = `-${word}-`;
  const sim = new TraceSim(config);
  sim.cycle(CYCLES);

  const series = maxCopy(sim, lexicon.indexOf(word)); // word rows follow config.lexicon order
  series.forEach((activation, cycle) => rows.push([word, word.length, cycle, activation]));
  if ((n + 1) % 50 === 0) console.log(`${n + 1} / ${words.length} words`);
});

writeCsv(path.join(dir, 'targets.csv'), ['word', 'length', 'cycle', 'activation'], rows);
writeMetadata(dir, { example: '03-length', cycles: CYCLES, words: words.length, parameters: 'defaults' });
