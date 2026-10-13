// M&E (1986) p. 62: recognizing every word in the lexicon.
// (Magnuson & Crinnion, 2022, Table 22.1, effect 9; Strauss et al., 2007,
// Table 1, validation simulation 11.)
//
// Question: presented on its own (silence before and after), is every word in
// the lexicon recognized? M&E: "TRACE made no mistakes -- that is, by a few
// slices after the end of the word, the word that spanned the entire input was
// more strongly activated than any other word."
//
// Each of the 212 words is presented as -word-. A word's activation is that of
// its most active copy; the silence "word" is not counted as a competitor.
// For each target this records:
//   the most active other word at the readout cycle, 12 cycles after the
//   target's last phoneme peaks (M&E's "a few slices after the end of the
//   word"; the trailing silence peaks 6 cycles after the last phoneme), and at
//   the last cycle;
//   the lead cycle: the first cycle from which the target is more active than
//   every other word for the rest of the run (empty if it never gets there).
// Default lexicon and parameters.
//
// Output (results/):
//   words.csv          one row per target (see header)
//   timecourse.csv.gz  target and strongest other word at every cycle
//
// Run:  node simulate.js [outputDir]        (212 simulations, ~15 s)

const path = require('path');
const { TraceSim, createDefaultConfig } = require('tstrace');
const { maxCopy, outputDir, isSmoke, writeCsv, writeMetadata } = require('../../lib/sim-utils');

const CYCLES = 100; // the longest word (9 phonemes) peaks at cycle 60
const AFTER_OFFSET = 12; // readout: cycles after the last phoneme's peak

const dir = outputDir(__dirname);
const lexicon = createDefaultConfig().lexicon;
const candidates = lexicon.map((w, row) => ({ phon: w.phon, row })).filter((w) => w.phon !== '-');
const targets = isSmoke() ? candidates.slice(0, 5) : candidates;

const summaryRows = [];
const timeRows = [];
const started = Date.now();

targets.forEach((target, n) => {
  const config = createDefaultConfig();
  config.modelInput = `-${target.phon}-`;
  const sim = new TraceSim(config);
  sim.cycle(CYCLES);

  // most active copy of every candidate word
  const acts = candidates.map((w) => ({ phon: w.phon, series: maxCopy(sim, w.row) }));
  const own = acts.find((a) => a.phon === target.phon).series;
  const others = acts.filter((a) => a.phon !== target.phon);
  const strongestAt = (cycle) => others.reduce((best, a) => (a.series[cycle] > best.series[cycle] ? a : best));

  // input positions: 0 = leading silence, 1..L = the word; position k peaks at deltaInput * (k + 1)
  const offsetPeak = config.deltaInput * (target.phon.length + 1);
  const readout = Math.min(offsetPeak + AFTER_OFFSET, CYCLES - 1);
  const atReadout = strongestAt(readout);
  const atEnd = strongestAt(CYCLES - 1);

  let lead = '';
  for (let c = CYCLES - 1; c >= 0 && own[c] > strongestAt(c).series[c]; c--) lead = c;

  summaryRows.push([
    target.phon,
    target.phon.length,
    offsetPeak,
    readout,
    own[readout],
    atReadout.phon,
    atReadout.series[readout],
    own[readout] > atReadout.series[readout] ? 1 : 0,
    own[CYCLES - 1],
    atEnd.phon,
    atEnd.series[CYCLES - 1],
    own[CYCLES - 1] > atEnd.series[CYCLES - 1] ? 1 : 0,
    lead,
  ]);
  for (let c = 0; c < CYCLES; c++) timeRows.push([target.phon, target.phon.length, offsetPeak, c, own[c], strongestAt(c).series[c]]);
  if ((n + 1) % 50 === 0) console.log(`${n + 1}/${targets.length} words, ${((Date.now() - started) / 1000).toFixed(0)} s`);
});

writeCsv(
  path.join(dir, 'words.csv'),
  [
    'word', 'length', 'offset_peak', 'readout_cycle',
    'target_readout', 'competitor_readout', 'competitor_act_readout', 'correct_readout',
    'target_final', 'competitor_final', 'competitor_act_final', 'correct_final',
    'lead_cycle',
  ],
  summaryRows
);
writeCsv(path.join(dir, 'timecourse.csv.gz'), ['word', 'length', 'offset_peak', 'cycle', 'target', 'best_other'], timeRows);
writeMetadata(dir, {
  example: 'original-trace-replications/09-all-words',
  cycles: CYCLES,
  readout: `${AFTER_OFFSET} cycles after the last phoneme's peak`,
  words: targets.length,
  parameters: 'defaults',
});
