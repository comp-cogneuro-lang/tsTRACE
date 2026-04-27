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
- `docs/` — User guide and reference images
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
yarn cli --help
```

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

- `docs/tstrace-user-guide.md` — Walkthrough of the simulation GUI

## Live demo

A deployed build of the Vue GUI is available at:

**<https://comp-cogneuro-lang.github.io/tsTRACE/>**
