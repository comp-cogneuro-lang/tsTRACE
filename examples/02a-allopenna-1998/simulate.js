// Example 2a: as-close-as-possible replication of the TRACE simulations in
// Allopenna, Magnuson & Tanenhaus (1998), Experiment 1.
//
// Question: does TRACE predict the eye-tracking pattern -- early, strong
// fixations to onset cohorts (beaker / beetle) and later, weaker fixations to
// rhymes (beaker / speaker), both above unrelated items?
//
// What the paper specifies, and we follow:
//   * the eight referent / cohort / rhyme / unrelated sets of their Table 1
//   * input: "the" followed by the referent, run for 90 cycles
//   * lexicon: the TRACE lexicon plus the experimental items and their neighbors
//   * default parameters
// What we had to reconstruct (see items/index.js and README.md):
//   * TRACE transcriptions of the items (TRACE lacks /n f h w/)
//   * the neighbor lists (from jTRACE's 901-word lexicon)
// Word activations come from each word's most active copy, among copies aligned
// no earlier than one phoneme before the referent (so copies lined up with
// "the" are ignored). The linking hypothesis (Luce choice rule, scaling, delay)
// is applied in plot.py.
//
// Each set is run twice: forward (the referent is presented, as in the paper)
// and reverse (the rhyme is presented, so the referent becomes its rhyme), to
// check rhyme activation in both directions.
//
// Output (results/):
//   activations.csv  one row per set x direction x display item x cycle. In the
//                    reverse direction the roles are relabeled: the presented
//                    word is the "referent" and the original referent is the "rhyme".
// It also (re)writes two stimulus files in items/ for exploring them in the GUI:
//   items/lexicon.xml  the 268-word lexicon (Lexicon tab, Load from XML)
//   items/config.json  default parameters with that lexicon and "the beaker" as
//                      model input (Parameters tab, Load from JSON)
//
// Run:  node simulate.js [outputDir]        (16 simulations, ~5 s)

const fs = require('fs');
const path = require('path');
const { TraceSim, createDefaultConfig, serializeJtLexicon } = require('tstrace');
const { slotOf, maxCopy, outputDir, writeCsv, writeMetadata } = require('../lib/sim-utils');
const { TRANSCRIPTIONS, CARRIER, SETS, ROLES, NEIGHBORS } = require('./items');

const CYCLES = 90;

/** Default lexicon plus every item and neighbor it lacks. */
const buildLexicon = () => {
  const lexicon = createDefaultConfig().lexicon;
  const have = new Set(lexicon.map((w) => w.phon));
  for (const phon of [...Object.values(TRANSCRIPTIONS), ...NEIGHBORS]) {
    if (!have.has(phon)) {
      lexicon.push({ phon, freq: 1, prime: 0 }); // frequency has no effect with default settings
      have.add(phon);
    }
  }
  return lexicon;
};

const dir = outputDir(__dirname);
const lexicon = buildLexicon();
const rows = [];

SETS.forEach(([referent, cohort, rhyme, unrelated], n) => {
  const directions = {
    forward: [referent, cohort, rhyme, unrelated], // the paper's displays
    reverse: [rhyme, cohort, referent, unrelated], // rhyme presented; referent is its rhyme
  };
  for (const [direction, display] of Object.entries(directions)) {
    const config = createDefaultConfig();
    config.lexicon = lexicon;
    config.modelInput = `-${CARRIER}${TRANSCRIPTIONS[display[0]]}-`;
    const sim = new TraceSim(config);
    sim.cycle(CYCLES);

    // the presented word starts at input position 1 + length of the carrier
    const onset = slotOf(config, 1 + CARRIER.length);
    display.forEach((word, r) => {
      const row = lexicon.findIndex((w) => w.phon === TRANSCRIPTIONS[word]);
      const series = maxCopy(sim, row, { from: onset - 2 });
      series.forEach((activation, cycle) => rows.push([n + 1, direction, ROLES[r], word, cycle, activation]));
    });
  }
});

writeCsv(path.join(dir, 'activations.csv'), ['set', 'direction', 'role', 'word', 'cycle', 'activation'], rows);
// stimulus files for exploring the items in the GUI (kept with the items, not results)
const itemsDir = path.join(__dirname, 'items');
fs.writeFileSync(path.join(itemsDir, 'lexicon.xml'), serializeJtLexicon(lexicon));
const guiConfig = createDefaultConfig();
guiConfig.lexicon = lexicon;
guiConfig.modelInput = `-${CARRIER}${TRANSCRIPTIONS[SETS[0][0]]}-`;
fs.writeFileSync(path.join(itemsDir, 'config.json'), JSON.stringify(guiConfig, null, 2) + '\n');
console.log(`wrote lexicon.xml and config.json to ${itemsDir}`);

writeMetadata(dir, {
  example: '02a-allopenna-1998',
  cycles: CYCLES,
  lexiconSize: lexicon.length,
  carrier: CARRIER,
  transcriptions: TRANSCRIPTIONS,
  parameters: 'defaults',
});
