// M&E (1986) Fig. 32: segmenting a short sentence.
// (Magnuson & Crinnion, 2022, Table 22.1, effect 11, lexical segmentation.)
//
// Question: with no syntax, semantics, stress or juncture cues, how far can
// lexical competition alone go in parsing a stream into words? M&E (p. 69):
// for /SiS^t^baks/ the words of "she shut a box", which cover the input with
// no overlap, end up dominating all others -- though the short, unstressed
// "a" has a hard time, as listeners do with function words (Grosjean & Gee,
// 1984).
//
// Input: /SiS^t^baks/ (the jTRACE gallery's "short sentences" set also uses
// it). Default lexicon and parameters, 110 cycles.
//
// Output (results/):
//   words.csv     activation of the most active copy of she, shut, a, box,
//                 and every other word that exceeds 0.1 at some point (silence
//                 excluded), one row per word x cycle. "a" (/^/) is read only
//                 from copies at the slot of the article (input position 6,
//                 slot 14), since /^/ also occurs inside "shut".
//   snapshot.csv  the whole Trace every 3 cycles (Fig. 32)
//
// Run:  node simulate.js [outputDir]        (1 simulation, ~1 s)

const path = require('path');
const { TraceSim, createDefaultConfig } = require('tstrace');
const { slotOf, maxCopy, traceSnapshot, outputDir, isSmoke, writeCsv, writeMetadata } = require('../../lib/sim-utils');

const CYCLES = isSmoke() ? 60 : 110;
const INPUT = '-SiS^t^baks-';
const PARSE = ['Si', 'S^t', '^', 'baks']; // she shut a box: saved even if they stay low
const ARTICLE_POSITION = 6; // input position of "a"
const MIN_PEAK = 0.1;

const dir = outputDir(__dirname);
const config = createDefaultConfig();
config.modelInput = INPUT;
const sim = new TraceSim(config);
sim.cycle(CYCLES);

const wordRows = [];
const article = slotOf(config, ARTICLE_POSITION);
config.lexicon.forEach(({ phon }, row) => {
  if (phon === '-') return;
  const series = phon === '^' ? maxCopy(sim, row, { from: article - 1, to: article + 1 }) : maxCopy(sim, row);
  if (!PARSE.includes(phon) && Math.max(...series) < MIN_PEAK) return;
  series.forEach((a, cycle) => wordRows.push([phon, cycle, a]));
});
const every3 = Array.from({ length: Math.ceil(CYCLES / 3) }, (_, i) => 3 * i);
const snapshotRows = traceSnapshot(sim, config, every3);

writeCsv(path.join(dir, 'words.csv'), ['word', 'cycle', 'activation'], wordRows);
writeCsv(path.join(dir, 'snapshot.csv'), ['cycle', 'level', 'unit', 'slot', 'length', 'activation'], snapshotRows);
writeMetadata(dir, {
  example: 'original-trace-replications/14-short-sentence',
  cycles: CYCLES,
  input: INPUT,
  minPeak: MIN_PEAK,
  parameters: 'defaults',
});
