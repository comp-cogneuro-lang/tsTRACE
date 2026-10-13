# tstrace — core TRACE library

TypeScript implementation of the TRACE model of speech perception (McClelland
& Elman, 1986), ported from jTRACE (Strauss, Harris & Magnuson, 2007) and
cTRACE. This package is the simulation engine only; the Vue GUI lives in
`../tstrace-vue/`.

For a five-minute install-and-run walkthrough see
[`docs/QUICKSTART.md`](../../docs/QUICKSTART.md). This file is the reference
for scripting the model from Node.

## Contents

- [Install and build](#install-and-build)
- [Importing the library](#importing-the-library)
- [A single simulation](#a-single-simulation)
- [The data model](#the-data-model)
- [Batch scripting](#batch-scripting)
- [Custom lexicons and phonologies](#custom-lexicons-and-phonologies)
- [Phoneme continua](#phoneme-continua)
- [Input replacement (noise or silence)](#input-replacement-noise-or-silence)
- [Analysis helpers](#analysis-helpers)
- [Substep integration (`nreps < 0`)](#substep-integration-nreps--0)
- [The `tstrace` CLI](#the-tstrace-cli)
- [Tests](#tests)

## Install and build

From the repository root:

```bash
yarn install
yarn workspace tstrace build     # compiles src/ -> dist/common (CommonJS) and dist/esm
```

Rerun the build after any change under `src/`. The tests and the CLI all load
`dist/common/index.js`, not the TypeScript sources.

## Importing the library

Everything is a **named** export from `dist/common/index.js`. There is no
default export.

```js
// From a script run with `yarn cli my-script.js` (see "The tstrace CLI"):
const { TraceSim, createDefaultConfig } = require('tstrace');

// From any other Node script, by path:
const { TraceSim, createDefaultConfig } = require('/path/to/tsTRACE/packages/tstrace/dist/common/index.js');
```

Exports:

| Group | Names |
|---|---|
| Simulation | `TraceSim`, `TraceNet`, `createDefaultConfig`, `createDefaultPhoneme`, `TracePhoneRole` |
| Errors | `TraceError`, `ModelInputError` |
| jTRACE file I/O | `loadJtLexicon`, `loadJtPhonology`, `parseJtLexicon`, `parseJtPhonology`, `serializeJtLexicon`, `serializeJtPhonology` |
| JSON I/O | `parseJsonLexicon`, `parseJsonPhonology` |
| Streamed CSV output | `openFileHandle`, `openFileHandles`, `closeFileHandles` |
| Analysis | `doSimAnalysis`, `getAnalysisData`, `formatAnalysis`, and the enums `TraceDomain`, `TraceContentType`, `TraceCalculationType`, `TraceChoice`, `TraceCompetitionType`, `TraceFlowSumType` |

## A single simulation

```js
const { TraceSim, createDefaultConfig } = require('tstrace');

const config = createDefaultConfig();     // original M&E 1986 phonology, 213-word lexicon, default parameters
config.modelInput = '-^br^pt-';           // "abrupt"; '-' is silence, pad both ends

const sim = new TraceSim(config);
sim.cycle(80);                            // run 80 cycles (GUI default is 81)

// wordLayer[cycle][wordIndex][slot]
const i = config.lexicon.findIndex(w => w.phon === '^br^pt');
const peakAtEnd = Math.max(...sim.wordLayer[79][i]);
console.log('abrupt at cycle 79, best slot:', peakAtEnd.toFixed(3));   // ~0.79
```

`cycle(n)` can be called repeatedly; each call appends `n` more cycles. A
single call is capped at `max(6 × modelInput.length × deltaInput, fSlices)`
cycles (288 for the default input).

## The data model

### Configuration (`TraceConfig`)

`createDefaultConfig()` returns a plain object you can mutate before
constructing a `TraceSim`. The fields you'll touch most:

| Field | Default | Meaning |
|---|---|---|
| `modelInput` | `'-^br^pt-'` | Phoneme string to present. Use `-` for silence; optional per-token `[strength,rate]` (see below). |
| `lexicon` | 213 words | `TraceWord[]`: `{ phon, freq, prime, label? }` |
| `phonology` | 15 phonemes | `TracePhone[]`: `{ label, features, durationScalar, phonologicalRole }` |
| `alpha.IF / FP / PW / WP / PF` | 1.0 / 0.02 / 0.05 / 0.03 / 0.0 | Excitatory rates: input→feature, feature→phoneme, phoneme→word, word→phoneme (feedback), phoneme→feature |
| `gamma.F / P / W` | 0.04 / 0.04 / 0.03 | Lateral inhibition at each layer |
| `decay.F / P / W` | 0.01 / 0.03 / 0.05 | Decay toward rest at each layer |
| `rest.F / P / W` | −0.1 / −0.1 / −0.01 | Resting activations |
| `min`, `max` | −0.3, 1.0 | Activation clamp |
| `deltaInput` | 6 | Feature slices per phoneme of input |
| `slicesPerPhon` | 3 | Phoneme/word unit spacing in slices |
| `fSlices` | 99 | Width of the feature layer (time axis) |
| `spread`, `spreadScale` | 7 × 6, 7 × 1 | Temporal ramp of each feature continuum |
| `nreps` | 1 | Input slices advanced per cycle; negative = substep mode (see below) |
| `noiseSD`, `stochasticitySD` | 0, 0 | Input noise / McClelland (1991) activation noise |
| `stochasticity` (F, P, W) | 0, 0, 0 | Extra per-layer activation noise (SD), combined with `stochasticitySD` as √(global² + layer²) |
| `seed` | `null` | Integer seed for all noise (input noise and stochasticity); `null` = unseeded, different every run |
| `replaceStart`, `replaceEnd`, `replaceMean`, `replaceSD` | `null`, `null`, 0, 0 | Replace input slices with noise or silence (see below) |
| `freqNode`, `primeNode` | off | Frequency and priming (rest / weight / post-activation variants) |
| `continuumSpec` | `''` | Build an ambiguous phoneme continuum (see below) |
| `inputPhonemes` | absent | Extra input-only phonemes with any feature pattern (see below) |
| `lengthNormalization` | 0 | Scale word-to-word inhibition by word length |
| `wordInhBuProtect` | 0 | Experimental: cap net inhibition on a word at k × its current activation. 0 = original TRACE. |

Phoneme labels are single, case-sensitive characters (`^` is /ʌ/, `S` is /ʃ/,
etc.). Anything in `modelInput` that is not a defined label throws
`ModelInputError`.

### Layers

After `cycle()`, `sim` holds one snapshot per cycle:

| Array | Shape | Notes |
|---|---|---|
| `sim.inputLayer` | `[cycle][feature][slice]` | Constant across cycles |
| `sim.featLayer` | `[cycle][feature][slice]` | 63 features × `fSlices` |
| `sim.phonLayer` | `[cycle][phoneme][slot]` | Phoneme index order is the engine's sorted order (`- ^ a b d g …`), **not** `config.phonology` order — use `sim.phonemes.byIndex(i).label` |
| `sim.wordLayer` | `[cycle][word][slot]` | Word index order = `config.lexicon` |

`sim.getStepsRun()` is the number of cycles simulated. Row-labeled versions
(strings, 4-decimal) are available per cycle: `getInputData(c)`,
`getFeatureData(c)`, `getPhonemeData(c)`, `getWordData(c)`,
`getLevelsAndFlowData(c)`, and for all cycles via the `getAll*Data()` variants.

A dozen per-cycle scalars are also kept for the Flow Indices display:
`globalLexicalCompetition`, `globalPhonToWordSum`, `globalWordSumPos`, etc.
(see `src/trace-sim-base.ts`).

## Batch scripting

The pattern is: copy the base config, set `modelInput`, construct a fresh
`TraceSim`, cycle, harvest what you need, repeat. Two ways to persist results:

- **`sim.writeFiles(dir, prefix?)`** — one gzipped CSV per layer
  (`input`, `feature`, `phoneme`, `word`) for this simulation. Creates `dir`
  if needed. Simple; one directory per simulation.
- **`openFileHandles(dir, prefix?)` + `sim.appendFiles(handles, extraCols?)` + `closeFileHandles(handles)`** —
  five append-mode gzip streams (`input`, `feature`, `phoneme`, `word`,
  `levels_and_flow`); every simulation appends its rows to the same files.
  Best for sweeps. `openFileHandles` does **not** create the directory.

The following runs the first three lexicon words with modified feedback,
streams all layers into one file set, and prints a recognition check. Run it
with `yarn cli batch.js out-dir`.

```js
// batch.js
const fs = require('fs');
const { TraceSim, createDefaultConfig, openFileHandles, closeFileHandles } = require('tstrace');

// Under `yarn cli script.js ARGS`, argv[2] is the script path; your args start at argv[3].
const OUT_DIR = process.argv[3] || 'batch-out';
const CYCLES = 80;

async function main() {
  const base = createDefaultConfig();
  base.alpha.WP = 0.03;                        // change any parameter here
  const words = base.lexicon.slice(0, 3);      // or base.lexicon for all 213

  fs.mkdirSync(OUT_DIR, { recursive: true }); // openFileHandles does not create the directory
  const handles = openFileHandles(OUT_DIR, 'demo');

  for (const w of words) {
    const config = JSON.parse(JSON.stringify(base));   // fresh copy per simulation
    config.modelInput = `-${w.phon}-`;                  // pad with silence
    const sim = new TraceSim(config);
    sim.cycle(CYCLES);

    // Recognition check: peak activation of the target vs. best other real word
    const peak = (i) => Math.max(...sim.wordLayer.flatMap(cyc => cyc[i]));
    const targetIdx = config.lexicon.findIndex(x => x.phon === w.phon);
    const target = peak(targetIdx);
    const rival = Math.max(...config.lexicon.map((x, i) =>
      i === targetIdx || x.phon === '-' ? -Infinity : peak(i)));
    console.log(`${w.phon.padEnd(8)} target ${target.toFixed(3)}  best other ${rival.toFixed(3)}  ${target > rival ? 'PASS' : 'FAIL'}`);

    // Extra columns tag each simulation's rows (here: the alpha.WP used)
    await sim.appendFiles(handles, [String(config.alpha.WP)]);
  }
  closeFileHandles(handles);
  console.log(`wrote ${OUT_DIR}/demo-{input,feature,phoneme,word,levels_and_flow}.csv.gz`);
}
main();
```

Output:

```
^        target 0.304  best other 0.149  PASS
^br^pt   target 0.791  best other 0.203  PASS
^dapt    target 0.738  best other 0.215  PASS
wrote out-dir/demo-{input,feature,phoneme,word,levels_and_flow}.csv.gz
```

### CSV layout and gotchas

Each layer file has one row per (cycle, unit): `cycle, input, <unit label>,
t0, t1, …` where `t*` are the time slices/slots. The `word` file for one
80-cycle simulation of the 213-word lexicon is 80 × 213 = 17,040 rows.

Things to know when you load these files:

1. **Header repeats.** Every `appendFiles` call writes a header line, so a
   file with N simulations has N header lines. Drop rows whose first field is
   the literal `cycle`.
2. **Extra columns are not in the header.** Columns passed as the second
   argument to `appendFiles` are inserted after `input`, but the header line
   is not widened. Supply your own column names when parsing.
3. **Mixed delimiters.** Headers and label columns use `", "`; numeric cells
   use `","`. Split on `/,\s*/`.
4. Memory: `TraceSim` keeps every cycle of every layer in memory. For long
   sweeps, harvest what you need from each `sim` and let it go out of scope
   before the next one.
5. CPU: each simulation is single-threaded. If you parallelize with worker
   processes, keep the total at or below ~70% of physical cores.

The regression suite in `tests/` (`baseline-test.js`, `regression-test.js`,
`quick-compare.js`) is a working example of the `writeFiles` variant.

## Custom lexicons and phonologies

```js
const { loadJtLexicon, loadJtPhonology, parseJsonLexicon, parseJsonPhonology } = require('tstrace');

// From jTRACE XML (.jt) files on disk:
config.lexicon   = loadJtLexicon('path/to/lexicon.jt');
config.phonology = loadJtPhonology('path/to/phonology.jt');

// From already-parsed JSON (same shapes as the GUI's Save buttons produce):
config.lexicon   = parseJsonLexicon(JSON.parse(fs.readFileSync('lexicon.json', 'utf8')));
config.phonology = parseJsonPhonology(JSON.parse(fs.readFileSync('phonology.json', 'utf8')));
```

`parseJtLexicon(xmlString)` / `parseJtPhonology(xmlString)` do the same from
a string; `serializeJtLexicon(lexicon)` / `serializeJtPhonology(phonology)`
go the other way. The jTRACE gallery files in the
`gallery/` folder of the jTRACE distribution (if you have it) are
`<lexicon>` blocks you can load directly.

Every phoneme in every lexicon word must exist in `config.phonology`; every
phoneme's `features.length` must equal `numFeatures × continuaPerFeature`
(63 for the original 7 × 9 scheme). A flat single-level scheme is
`numFeatures: 1, continuaPerFeature: N`.

## Phoneme continua

Set `config.continuumSpec` to a three-character string `<from><to><steps>`
(steps 2–9), e.g. `'bp5'`. The engine adds phonemes labeled `0` … `steps-1`
that interpolate every feature linearly from `b` to `p`, plus `?` for the
midpoint. Use those digits in `modelInput`:

```js
config.continuumSpec = 'bp7';
config.modelInput = '-3l^g-';   // step 3 of 7 between /b/ and /p/, i.e. ambiguous blug/plug
```

Continuum phonemes are **input-only**: they define feature patterns for
`modelInput` but are not units in the phoneme layer, so `sim.phonLayer` keeps
its usual 15 rows. Read the outcome at the phoneme layer by comparing the
endpoint phonemes (`b` vs. `p`) at the slot aligned with the ambiguous
segment.

### Input-only phonemes with any feature pattern

A continuum moves every feature together along a straight line between two
phonemes. To present any other pattern (for example a segment that is
/g/-like on one feature dimension and /k/-like on another), list it in
`config.inputPhonemes`. Each entry is a phoneme definition like those in
`config.phonology`, with a single-character label that the phonology and any
continuum don't use. Like continuum steps, these phonemes can appear in
`modelInput` but get no phoneme units:

```js
const g = config.phonology.find((p) => p.label === 'g');
const x = { ...g, label: 'X', features: [...g.features] };
x.features[5 * 9 + 1] = 0.5; // e.g. weaken /g/'s voicing value
config.inputPhonemes = [x];
config.modelInput = '-Xa-';
```

`examples/lib/ga-ka.js` uses this to rebuild the trading-relations and
categorical-perception stimuli of McClelland & Elman (1986).

## Input strength and rate (per phoneme and per token)

As in the original C TRACE, each phoneme in the input can have its own
**strength** (how strongly its features are input) and **rate** (how
stretched in time it is). Both default to 1, which gives the usual input.

Per token, add `[strength]`, `[strength,rate]` or `[,rate]` right after a
phoneme (or a splice) in `modelInput`:

```js
config.modelInput = '-b[0.5]at-';    // a weak /b/: its features at half strength
config.modelInput = '-b[,2]at-';     // a slow /b/: its feature ramps twice as wide
config.modelInput = '-b[0.5,2]at-';  // both
```

- **Strength** multiplies the token's feature input (before input noise and clamping).
- **Rate** multiplies the width of the token's feature ramps. Peaks are spaced as
  in C TRACE: the gap between two successive tokens is `deltaInput ×
  durationScalar × (rate₁ + rate₂) / 2`, so a slow token pushes both
  neighbors away. A splice cannot have its own rate.
- Each token still counts as one input position, so slot arithmetic and
  `getInputPhonemeSpans()` work as before.

Per phoneme, set `strength` on its definition in `config.phonology` (in the GUI,
Config → Phonology → *Strength*). It applies to every token of that phoneme
and multiplies any per-token strength. `parseModelInput()` returns the parsed
tokens if you need them.

## Input replacement (noise or silence)

Replace input slices `replaceStart` … `replaceEnd` (inclusive, every feature
row) with Gaussian noise of mean `replaceMean` and SD `replaceSD`. With
`replaceSD: 0` every replaced value is `replaceMean`, so the defaults (0, 0)
give true silence. Replacement is off while either end is `null`. It is
applied after `noiseSD`, then the input is clamped to `[min, max]`, and it
uses `seed`.

To replace exactly the slices one phoneme of the input covers (including the
slices it shares with its neighbors), read the spans from a `TraceNet`:

```js
const { TraceNet } = require('tstrace');
config.modelInput = '-l^kSri-';
const spans = new TraceNet(config).getInputPhonemeSpans();
// [{ label: '-', start, end }, { label: 'l', start, end }, ...]
config.replaceStart = spans[1].start;   // replace /l/
config.replaceEnd = spans[1].end;
config.replaceMean = 0.6;
config.replaceSD = 0.15;
```

## Analysis helpers

`doSimAnalysis` reproduces the GUI's Chart tab computations (top-N items,
response probabilities, alignment strategies):

```js
const { doSimAnalysis, formatAnalysis, TraceDomain, TraceCalculationType } = require('tstrace');

const data = doSimAnalysis({
  sim,
  domain: TraceDomain.WORDS,                    // or PHONEMES
  itemsToWatch: 5,                              // top-N by activation
  calculationType: TraceCalculationType.STATIC, // STATIC | AVERAGE | MAX_POSTHOC | MAX_ADHOC | FRAUENFELDER | ...
  alignment: 4,                                 // slot for STATIC
});
// data: [{ label: '^br^pt [4]', data: [{x: 0, y: ...}, ...] }, ...]
console.log(formatAnalysis(data));              // tab-separated table, one column per item
```

Other options: `choice` (`TraceChoice.NORMAL | FORCED`), `kValue` (Luce
choice exponent, default 4), `competType`, `competSlope`. See
`src/trace-sim-analysis.ts` for the full `TraceSimAnalysisConfig`.

## Substep integration (`nreps < 0`)

`nreps = -k` (k ≥ 2) runs k network updates per input-slice advance. Used
with all nine rate parameters (`alpha.FP/PW/WP/PF`, `gamma.P/W`,
`decay.F/P/W`) divided by k, this gives an effective time step of 1/k and
removes the period-2 explicit-Euler oscillation that appears with large
lexicons. Cycle counts and plots keep their usual meaning; only the
integration is finer. Positive `nreps` keeps the legacy meaning (advance
that many input slices per cycle).

## The `tstrace` CLI

`bin/cli.js` (exposed as `yarn cli` from the repo root) is a thin wrapper:

```bash
yarn cli               # Node REPL with the library preloaded as `tstrace`
yarn cli script.js     # run script.js; inside it, require('tstrace') resolves to the local build
```

There are no flags. When running a script, its own path is `process.argv[2]`
and any further arguments start at `process.argv[3]`.

## Tests

```bash
yarn workspace tstrace test:regression   # 100-word comparison against baseline_data/ (~1 min)
yarn workspace tstrace test:quick ark    # one word, ~5 s
yarn workspace tstrace test:baseline     # regenerate the baseline (only after an intentional model change)
```

See [`tests/README.md`](tests/README.md) and the root
[`TEST_SUITE_GUIDE.md`](../../TEST_SUITE_GUIDE.md).
