# tsTRACE example simulations

Each folder replicates a published TRACE result from start to finish: it builds
the model inputs, runs the simulations, saves the data, and draws
publication-ready figures. All examples use the original TRACE parameters
(`createDefaultConfig()`), the original 14 phonemes, and the default 212-word
lexicon, unless the example says otherwise.

| Example | Replicates | Simulations | Time |
|---|---|---|---|
| [01-ganong](01-ganong/) | Lexical context shifts phoneme identification (Ganong, 1980) | 14 | ~2 s |
| [02a-allopenna-1998](02a-allopenna-1998/) | The TRACE simulations of Allopenna et al. (1998), as closely as they can be reconstructed | 8 | ~3 s |
| [02b-cohort-rhyme-minimal](02b-cohort-rhyme-minimal/) | Cohort and rhyme competition across the whole lexicon, minimal assumptions | 212 | ~30 s |
| [03-length](03-length/) | Early short-word and late long-word advantages (Magnuson et al., 2013) | 212 | ~20 s |
| [04-restoration-simple](04-restoration-simple/) | Phoneme restoration with noise vs silence, one word (Magnuson, 2015) | 18 | ~3 s |
| [05-restoration-magnuson2015](05-restoration-magnuson2015/) | All 13 figures and the main statistics of Magnuson (2015), including revised phoneme definitions | ~4,300 | ~8 min |

[original-trace-replications/](original-trace-replications/) replicates every
simulation of McClelland & Elman (1986), in 15 examples, including displays of
the whole Trace drawn as in their figures. Its README has the full inventory.
Examples 05 and 06 need an engine build that includes `config.inputPhonemes`.

## Running an example

From the repository root, after building the engine (`yarn workspace tstrace build`):

```
cd examples/01-ganong
node simulate.js        # writes results/
python3 plot.py         # reads results/, writes figures/ (PDF and PNG)
```

Both scripts take optional folder arguments (`node simulate.js <resultsDir>`,
`python3 plot.py <resultsDir> <figuresDir>`). Plotting needs Python 3 with
matplotlib and pandas (Example 5 also needs scipy).

To check that every example still runs, without writing anything into the
repository:

```
node examples/smoke-test.js
```

## How the examples are written

- **Two steps, two files.** `simulate.js` runs the model and writes tidy CSV files
  (one row per condition × item × cycle). `plot.py` reads them and makes the
  figures. Anyone can re-plot the data with another tool (R, Excel, ...) without
  rerunning the model.
- **Readable top to bottom.** Each script opens with a comment block giving the
  question, the design, the outputs, and the runtime. Any setting that differs
  from the defaults is set explicitly in the script.
- **Reproducible.** Every noisy simulation sets `config.seed`, so reruns give
  identical numbers. Each `results/` folder gets a `metadata.json` recording the
  tsTRACE version, git commit, date, and settings.
- **Shared helpers are small.** `lib/sim-utils.js` does bookkeeping only (slot
  arithmetic, phoneme row lookup, CSV and metadata writing); `lib/style.py` sets
  a common figure style (print sizes, colorblind-safe colors, vector PDF).
- **Small, single-core runs.** Nothing runs in parallel.

## Reading model output: three details

- **Slots.** Input position *k* (the leading `-` is position 0) is centered on
  feature slice 6(*k* + 1). Phoneme and word units are spaced every 3 slices, so
  the first phoneme after the leading silence lines up with slot 4.
  `slotOf(config, k)` in `lib/sim-utils.js` does this arithmetic.
- **Words: use the most active copy.** TRACE has a copy of every word at every
  slot. Word activations in these examples come from each word's most active
  copy, the one whose activation peaks highest over the run (`maxCopy(sim, row)`).
  Phoneme measures stay position-specific (the unit at the slot of interest).
- **Phoneme rows are sorted.** `sim.phonLayer[cycle][row][slot]` lists phonemes
  in the engine's sorted label order (`- ^ a b d g i k l p r s S t u`), not
  `config.phonology` order. Use `phonemeRow(sim, label)`. Word rows follow
  `config.lexicon` order.

## Results and figures

`results/` folders are not committed (rerun `simulate.js` to regenerate them).
`figures/` folders are committed as reference output, so you can compare your
run against them.
