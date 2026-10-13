// M&E (1986) Fig. 30: a word's end marks where the next word begins; a
// nonword's end does not. (Magnuson & Crinnion, 2022, Table 22.1, effect 11.)
//
// Question: listeners detect a word-initial target phoneme faster after a word
// ("government decided") than after a nonword ("gatabont decided"; Foss &
// Blank, 1980). M&E (pp. 65-67): once a word is identified, TRACE knows where
// it ends, so competitors that straddle the boundary are crushed by the time
// the next word's first phoneme arrives. After a nonword, words beginning and
// ending at many places, including some that overlap the boundary, stay partly
// active, so the boundary is not clear until well into the next word.
//
// Inputs: "possible target" /pas^b^ltarg^t/ and two nonword + "target"
// streams: M&E's "pagusle target" /pag^s^ltarg^t/ and the jTRACE gallery's
// /piSd^rptarg^t/. In all three the first part has 7 phonemes, so "target"
// starts at input position 8 (slot 18). Default lexicon and parameters.
//
// Measures, per cycle (word activations from units, not just aligned copies):
//   target     the most active copy of "target" aligned within one slot of
//              its true position (slots 17-19)
//   first      the same for "possible" at slots 3-5 (word stream only)
//   straddler  the most active unit of any other word (silence excluded)
//              whose span crosses the boundary before the /t/: a word at slot
//              s with L phonemes covers slots s .. s + 2(L-1), and straddles
//              if it covers both the last phoneme of the first part (slot 16)
//              and the /t/ (slot 18). (Copies half a phoneme off, e.g.
//              "possible" at slot 5, covering 5..17, do not count.)
//   straddler_word  which word that is
//
// Output (results/):
//   boundary.csv  one row per run x cycle with the measures above
//   snapshot.csv  the whole Trace every 3 cycles for each run (Fig. 30)
//
// Run:  node simulate.js [outputDir]        (3 simulations, ~1 s)

const path = require('path');
const { TraceSim, createDefaultConfig } = require('tstrace');
const { slotOf, maxCopy, traceSnapshot, outputDir, isSmoke, writeCsv, writeMetadata } = require('../../lib/sim-utils');

const CYCLES = isSmoke() ? 60 : 100;
const RUNS = {
  'pas^b^ltarg^t': '-pas^b^ltarg^t-',
  'pag^s^ltarg^t': '-pag^s^ltarg^t-',
  'piSd^rptarg^t': '-piSd^rptarg^t-',
};
const TARGET_POSITION = 8; // input position of the /t/ that begins "target"

const dir = outputDir(__dirname);
const rows = [];
const snapshotRows = [];
const every3 = Array.from({ length: Math.ceil(CYCLES / 3) }, (_, i) => 3 * i);

for (const [run, input] of Object.entries(RUNS)) {
  const config = createDefaultConfig();
  config.modelInput = input;
  const sim = new TraceSim(config);
  sim.cycle(CYCLES);

  const rowOf = (phon) => config.lexicon.findIndex((w) => w.phon === phon);
  const tSlot = slotOf(config, TARGET_POSITION); // 18
  const target = maxCopy(sim, rowOf('targ^t'), { from: tSlot - 1, to: tSlot + 1 });
  const first = run === 'pas^b^ltarg^t' ? maxCopy(sim, rowOf('pas^b^l'), { from: 3, to: 5 }) : null;

  for (let cycle = 0; cycle < CYCLES; cycle++) {
    let best = -Infinity;
    let bestWord = '';
    config.lexicon.forEach(({ phon }, r) => {
      if (phon === '-' || phon === 'targ^t') return;
      const span = 2 * (phon.length - 1);
      sim.wordLayer[cycle][r].forEach((a, s) => {
        if (s <= tSlot - 2 && s + span >= tSlot && a > best) {
          best = a;
          bestWord = phon;
        }
      });
    });
    rows.push([run, cycle, target[cycle], first ? first[cycle] : '', best, bestWord]);
  }
  for (const row of traceSnapshot(sim, config, every3)) snapshotRows.push([run, ...row]);
}

writeCsv(path.join(dir, 'boundary.csv'), ['run', 'cycle', 'target', 'first', 'straddler', 'straddler_word'], rows);
writeCsv(path.join(dir, 'snapshot.csv'), ['run', 'cycle', 'level', 'unit', 'slot', 'length', 'activation'], snapshotRows);
writeMetadata(dir, {
  example: 'original-trace-replications/12-nonword-boundaries',
  cycles: CYCLES,
  runs: RUNS,
  targetPosition: TARGET_POSITION,
  parameters: 'defaults',
});
