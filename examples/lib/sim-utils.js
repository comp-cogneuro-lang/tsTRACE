// Small helpers shared by the example simulations. Everything model-related
// (configs, inputs, which units to read) stays in each example's simulate.js;
// this file only does bookkeeping: slot arithmetic, CSV output, and metadata.

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { execSync } = require('child_process');

/**
 * Phoneme- (and word-) layer slot aligned with a position in the model input.
 * Input position k (the leading '-' is position 0) is centered on feature
 * slice deltaInput * (k + 1); phoneme and word units are spaced every
 * slicesPerPhon feature slices. With the defaults (6 and 3), position k -> slot 2(k + 1),
 * so the first phoneme after the leading silence is at slot 4.
 */
const slotOf = (config, inputPosition) =>
  Math.round((config.deltaInput * (inputPosition + 1)) / config.slicesPerPhon);

/**
 * Row of a phoneme in sim.phonLayer. The engine sorts phoneme units by label
 * (- ^ a b d g i k l p r s S t u), so this is NOT the index in config.phonology.
 */
const phonemeRow = (sim, label) => {
  const row = sim.phonemes.sorted().findIndex((p) => p.label === label);
  if (row < 0) throw new Error(`no phoneme unit labeled ${label}`);
  return row;
};

/**
 * Time course of a word's most active copy. TRACE has one copy of every word
 * at each slot; this picks the copy whose activation peaks highest over the
 * whole run (a "post-hoc max") and returns its activation at every cycle.
 * `row` is the word's index in config.lexicon. Optionally only copies at
 * slots from..to are considered (e.g. to ignore copies lined up with a carrier
 * word that precedes the target).
 */
const maxCopy = (sim, row, { from = 0, to = Infinity } = {}) => {
  const cycles = sim.wordLayer.length;
  let best = from;
  let bestPeak = -Infinity;
  for (let slot = from; slot < Math.min(to + 1, sim.wordLayer[0][row].length); slot++) {
    for (let c = 0; c < cycles; c++) {
      if (sim.wordLayer[c][row][slot] > bestPeak) {
        bestPeak = sim.wordLayer[c][row][slot];
        best = slot;
      }
    }
  }
  return sim.wordLayer.map((layer) => layer[row][best]);
};

/** Labels of the phoneme units, in sim.phonLayer row order. */
const phonemeLabels = (sim) => sim.phonemes.sorted().map((p) => p.label);

/**
 * Every phoneme unit at one slot, over the whole run, as rows
 * [cycle, phoneme, activation]. Response probabilities (Luce choice over the
 * phonemes at the slot) are computed from these in plot.py.
 */
const phonemeSlotRows = (sim, slot) => {
  const labels = phonemeLabels(sim);
  const rows = [];
  sim.phonLayer.forEach((layer, cycle) => labels.forEach((label, r) => rows.push([cycle, label, layer[r][slot]])));
  return rows;
};

/**
 * The state of the whole Trace at chosen cycles, for drawing it the way
 * McClelland & Elman (1986) do (lib/trace_display.py). Rows are
 * [cycle, level, unit, slot, length, activation] for every phoneme and word
 * unit whose activation is at least minAct; `length` is the unit's number of
 * phonemes (1 for phoneme units), which sets how much of the input it spans.
 */
const traceSnapshot = (sim, config, cycles, minAct = 0.01) => {
  const labels = phonemeLabels(sim);
  const rows = [];
  for (const cycle of cycles.filter((c) => c < sim.phonLayer.length)) {
    sim.phonLayer[cycle].forEach((acts, r) =>
      acts.forEach((a, slot) => a >= minAct && rows.push([cycle, 'phoneme', labels[r], slot, 1, a]))
    );
    sim.wordLayer[cycle].forEach((acts, r) => {
      const word = config.lexicon[r].phon;
      acts.forEach((a, slot) => a >= minAct && rows.push([cycle, 'word', word, slot, word.length, a]));
    });
  }
  return rows;
};

/** Output directory: first command-line argument, or ./results next to the script. */
const outputDir = (scriptDir) => {
  const dir = process.argv[2] || path.join(scriptDir, 'results');
  fs.mkdirSync(dir, { recursive: true });
  return dir;
};

/** True when run with SMOKE=1: examples then run a tiny design to check they work. */
const isSmoke = () => process.env.SMOKE === '1';

/**
 * Write rows (arrays) as CSV, gzipped when the file name ends in .gz.
 * Values are written as-is, so labels must not contain commas or quotes.
 */
const writeCsv = (file, header, rows) => {
  const text = [header.join(','), ...rows.map((r) => r.join(','))].join('\n') + '\n';
  fs.writeFileSync(file, file.endsWith('.gz') ? zlib.gzipSync(text) : text);
  console.log(`wrote ${rows.length} rows to ${file}`);
};

/** Record what produced the results: tsTRACE version and commit, date, and any settings. */
const writeMetadata = (dir, settings) => {
  let commit = 'unknown';
  try {
    commit = execSync('git rev-parse --short HEAD', { cwd: __dirname, stdio: ['ignore', 'pipe', 'ignore'] })
      .toString()
      .trim();
  } catch (e) {
    // not a git checkout; leave as unknown
  }
  const meta = {
    tstraceVersion: require('tstrace/package.json').version,
    commit,
    date: new Date().toISOString(),
    smoke: isSmoke(),
    ...settings,
  };
  fs.writeFileSync(path.join(dir, 'metadata.json'), JSON.stringify(meta, null, 2) + '\n');
};

module.exports = {
  slotOf,
  phonemeRow,
  phonemeLabels,
  phonemeSlotRows,
  traceSnapshot,
  maxCopy,
  outputDir,
  isSmoke,
  writeCsv,
  writeMetadata,
};
