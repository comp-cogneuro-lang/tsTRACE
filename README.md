# tsTRACE

A TypeScript implementation of the **TRACE model of speech perception**
(McClelland & Elman, 1986), with an interactive Vue 3 simulation GUI.
Ported from [jsTRACE](https://github.com/MagnusonLab/jsTRACE) / jTRACE
with bug fixes, modernization, and ongoing development.

## Repository structure

This is a Yarn workspaces monorepo:

- `packages/tstrace/` — Core TRACE library (TypeScript), with a CLI for
  batch simulations
- `packages/tstrace-vue/` — Vue 3 + Vite simulation GUI
- `packages/playground/` — Scratch / development workspace (not part of the
  build)
- `docs/` — Quick start, user guide, and reference images
- `examples/` — Scripts that replicate published TRACE results, from
  simulation to publication-ready figures
- `TEST_SUITE_GUIDE.md` — How the regression test suite works

## Local development

Requires Node.js and Yarn (Berry / v3+).

```bash
yarn install
yarn workspace tstrace build       # build the core library once
yarn workspace tstrace-vue dev     # start the Vite dev server
```

The dev server prints a localhost URL (typically `http://localhost:5173/`).

For a production build of both packages:

```bash
yarn build
```

## Running simulations from the CLI

```bash
yarn cli              # Node REPL with the library preloaded as `tstrace`
yarn cli script.js    # run a script; inside it, require('tstrace') resolves to the local build
```

See `packages/tstrace/README.md` for the scripting API and a batch example.

## Regression tests

The core library has a regression test suite that compares model output
against a committed baseline:

```bash
yarn workspace tstrace test:regression
```

CI runs these on every push and pull request; deployment to GitHub Pages
only happens if the regression tests pass on `main`. See
`TEST_SUITE_GUIDE.md` for details.

## Documentation

- `docs/QUICKSTART.md` — Install, build, and run locally in five minutes
- `docs/tstrace-user-guide.md` — Walkthrough of the simulation GUI
- `packages/tstrace/README.md` — Scripting the model from Node (API, batch runs, custom lexicons)
- `examples/README.md` — Worked replications (Ganong, Allopenna et al. 1998,
  length effects, phoneme restoration, and every simulation of McClelland &
  Elman 1986) with simulation and plotting scripts

## Live demo

A deployed build of the Vue GUI is available at:

**<https://comp-cogneuro-lang.github.io/tsTRACE/>**
