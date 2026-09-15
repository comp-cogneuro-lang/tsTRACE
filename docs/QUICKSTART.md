# tsTRACE Quick Start

Get tsTRACE installed and running locally in about five minutes. This covers
the GUI, the command-line REPL, scripting the model from Node, and the
regression test that confirms your install is good.

If you only want to *use* the simulator, you don't need to install anything:
the current build is always live at
<https://comp-cogneuro-lang.github.io/tsTRACE/>. See
[`tstrace-user-guide.md`](tstrace-user-guide.md) for a walkthrough of the GUI.

## 1. Prerequisites

- **Node.js 18 or newer** (20+ recommended). Check with `node --version`.
- **Yarn.** The repo pins Yarn 3.6.0 and ships it in `.yarn/releases/`, so any
  Yarn 1.22+ or a Corepack-enabled Node will automatically use the pinned
  version. If you have no Yarn at all: `corepack enable` (ships with Node 16+).
- **Git.**

Platform notes:

- macOS / Linux: nothing special.
- Windows: use Git Bash or WSL; the commands below assume a POSIX shell.
- If the repo lives in a Dropbox-synced folder, `yarn install` can fail with
  `EPERM` while Dropbox locks files. Exclude `node_modules/` from sync
  (Dropbox → Preferences → Sync → Selective sync) or clone somewhere outside
  Dropbox.

## 2. Install and build

```bash
git clone https://github.com/comp-cogneuro-lang/tsTRACE.git
cd tsTRACE
yarn install
yarn workspace tstrace build
```

`yarn install` takes a minute or two the first time. `yarn workspace tstrace
build` compiles the core library to `packages/tstrace/dist/` — every other
step below depends on that build, so rerun it whenever you change anything in
`packages/tstrace/src/`.

## 3. Run the GUI

**Development server** (hot reload, best for editing the Vue code):

```bash
yarn vue-dev
```

Open the URL it prints (normally <http://localhost:5173/>).

**Production build** (what gets deployed to GitHub Pages):

```bash
yarn vue-build
yarn workspace tstrace-vue serve
```

Open <http://localhost:4173/tsTRACE/> — note the `/tsTRACE/` path. The
production build is compiled with `base: '/tsTRACE/'` for GitHub Pages, so it
won't load at the bare root URL. `serve` (Vite's preview server) handles this
for you; if you'd rather use another static server, serve
`packages/tstrace-vue/dist/` at the `/tsTRACE/` path.

Either way you land on the **Config** tab with the default input `-^br^pt-`
("abrupt"). Click the **Simulation** tab, then **Simulate**, then **start
animation**. The user guide takes it from there.

## 4. Run the model from the command line

The `tstrace` package has a small CLI wrapper:

```bash
yarn cli              # interactive Node REPL with `tstrace` preloaded
yarn cli my-script.js # run a script in which require('tstrace') resolves to the local build
```

In the REPL:

```js
> const sim = new tstrace.TraceSim(tstrace.createDefaultConfig())
> sim.cycle(80)
> sim.getStepsRun()
80
```

## 5. Script the model from Node

Save this as `example.js` and run it with `yarn cli example.js`. It simulates
"abrupt" for 80 cycles and prints the five most active words with the cycle and
slot at which each peaked.

```js
const { TraceSim, createDefaultConfig } = require('tstrace');

const config = createDefaultConfig();
config.modelInput = '-^br^pt-';   // "abrupt", padded with silence

const sim = new TraceSim(config);
sim.cycle(80);

// wordLayer[cycle][wordIndex][slot] -- find each word's peak over all cycles/slots
const peaks = config.lexicon.map((w, i) => {
  let best = { act: -Infinity, cycle: -1, slot: -1 };
  sim.wordLayer.forEach((cyc, c) =>
    cyc[i].forEach((a, s) => { if (a > best.act) best = { act: a, cycle: c, slot: s }; }));
  return { word: w.phon, ...best };
});
peaks.sort((a, b) => b.act - a.act).slice(0, 5)
  .forEach(p => console.log(`${p.word.padEnd(8)} peak ${p.act.toFixed(3)} at cycle ${p.cycle}, slot ${p.slot}`));
```

Expected output (values may shift slightly if default parameters change):

```
^br^pt   peak 0.791 at cycle 79, slot 4
-        peak 0.434 at cycle 50, slot 2
^        peak 0.203 at cycle 40, slot 4
^p       peak 0.176 at cycle 33, slot 4
r^b      peak 0.155 at cycle 36, slot 2
```

To use the library from an ordinary Node script or another project instead of
through `yarn cli`, require it by path (it is a **named** export, not a
default):

```js
const { TraceSim, createDefaultConfig } = require('/path/to/tsTRACE/packages/tstrace/dist/common/index.js');
```

The full API (config fields, loaders for jTRACE `.jt` files, response
probabilities, analysis helpers) is described in
[`packages/tstrace/README.md`](../packages/tstrace/README.md).

## 6. Verify the install

The core library ships with a 100-word regression baseline. Running the
regression test proves the engine on your machine produces the same numbers as
the committed reference:

```bash
yarn workspace tstrace test:regression
```

Takes about a minute. The last lines should read:

```
Status: PASS
Tests: 100/100 passed
```

See [`TEST_SUITE_GUIDE.md`](../TEST_SUITE_GUIDE.md) for the other test modes
(creating a new baseline, single-word quick compare, parameter-impact tests).

## Troubleshooting

| Symptom | Cause / fix |
|---|---|
| `Cannot find module '../dist/common/index.js'` | You skipped `yarn workspace tstrace build`. |
| Blank page at <http://localhost:4173/> | Production build is served at `/tsTRACE/`, not `/`. Use <http://localhost:4173/tsTRACE/>. |
| `yarn install` fails with `EPERM` | Dropbox (or another sync client) is locking files under `node_modules/`. Exclude it from sync. |
| `const { default: TraceSim } = require(...)` is `undefined` | `TraceSim` is a named export: `const { TraceSim } = require(...)`. |
| GUI edits don't show up | You're looking at the production build. Use `yarn vue-dev` for hot reload, or rerun `yarn vue-build`. |
