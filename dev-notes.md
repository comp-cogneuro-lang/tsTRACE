# tsTRACE developer notes

How to rebuild everything, run the GUI locally, type-check, test, and deploy.
For a first-time install aimed at users, see
[`docs/QUICKSTART.md`](docs/QUICKSTART.md).

## Layout

| Package | What it is | Build output |
|---|---|---|
| `packages/tstrace/` | Simulation engine (TypeScript), CLI, tests | `dist/common/` (CommonJS, used by Node/CLI) and `dist/esm/` (ES modules, used by the GUI) |
| `packages/tstrace-vue/` | Vue 3 + Vite GUI | `dist/` (static site deployed to GitHub Pages) |

The GUI imports the engine as `tstrace`, which resolves through the workspace
symlink to **`packages/tstrace/dist/`, not `src/`**. Any change to the engine
is invisible to the GUI (and to the CLI) until the engine is rebuilt.

Toolchain: Node (currently v24; 18+ works), Yarn 3.6.0 (pinned via
`packageManager` in `package.json`; `corepack enable` if `yarn -v` is not 3.6.0).

## Rebuild everything

From the repo root:

```bash
yarn install        # only needed after pulling dependency changes or editing package.json
yarn build          # builds tstrace, then tstrace-vue (topological order)
```

`yarn build` runs `yarn workspaces foreach -pit run build`, which builds the
engine (both `dist/common` and `dist/esm`) before the GUI. Takes roughly
half a minute.

To build one package at a time:

```bash
yarn workspace tstrace build        # engine only (a few seconds)
yarn workspace tstrace-vue build    # GUI only (needs the engine built first)
```

## Launch the local Vite dev server

```bash
yarn workspace tstrace build        # if the engine has changed since the last build
yarn vue-dev                        # same as: yarn workspace tstrace-vue dev
```

Open the URL it prints, normally <http://localhost:5173/>. The dev server
serves at `/`, not `/tsTRACE/`. Stop it with Ctrl-C.

- **Vue changes** (`packages/tstrace-vue/src/`) hot-reload automatically.
- **Engine changes** (`packages/tstrace/src/`) need an engine rebuild, then a
  browser reload. If the page still shows old engine behavior, restart the dev
  server with `yarn workspace tstrace-vue dev --force` to clear Vite's
  dependency cache.
- **Faster engine loop:** the GUI only uses the ES-module build, so in a
  second terminal you can keep it rebuilding on save:

  ```bash
  yarn workspace tstrace build:esm --watch
  ```

  (The CLI uses `dist/common`; run a full `yarn workspace tstrace build`
  before using `yarn cli`.)

## Preview the production build locally

```bash
yarn build
yarn workspace tstrace-vue serve    # vite preview
```

Open the URL it prints, normally <http://localhost:4173/tsTRACE/>. Production
builds use the base path `/tsTRACE/` (for GitHub Pages), so the bare root URL
shows a blank page. Do not serve `packages/tstrace-vue/dist/` with
`python3 -m http.server` unless you build with a root base path:

```bash
BASE_PATH=/ yarn workspace tstrace-vue build
```

`BASE_PATH` overrides the base in `packages/tstrace-vue/vite.config.ts` and is
also what a root-hosted deploy (Netlify, a custom domain) would use.

## Type-check

```bash
yarn workspace tstrace build                       # GUI types come from dist/esm/*.d.ts
cd packages/tstrace && npx tsc --noEmit -p .       # engine
cd ../tstrace-vue && npx vue-tsc --noEmit          # GUI, including .vue templates
```

`vue-tsc` (1.8.x) is a dev dependency of `tstrace-vue`. Vite does **not**
type-check during `dev` or `build`, so run `vue-tsc` before committing GUI
changes. As of 2026-10-11 the engine check is clean; the only `vue-tsc` error
(the lexicon save in `LexiconTab.vue`) was fixed in `jtrace-output.ts`, so
the GUI check should be clean after an engine rebuild.

## Tests

```bash
yarn workspace tstrace test:regression   # what CI runs; compares against baseline_data/
yarn workspace tstrace test              # jest unit tests (see caveat)
```

**Caveat: stale `.js` files in `packages/tstrace/src/`.** Old compiled copies
(`src/*.js`, last updated 2026-04-26) are tracked in git next to the `.ts`
sources. Jest resolves `.js` before `.ts`, so plain `yarn workspace tstrace
test` runs the stale code. To test the current TypeScript sources:

```bash
cd packages/tstrace
npx jest --moduleFileExtensions ts js json
npx jest --moduleFileExtensions ts js json --testPathPattern exclude-adjacent   # one file
```

Run that way, `regression.test.ts` currently fails one snapshot (levels/flow
data); the snapshot predates the current engine. Likely fix: delete the stale
`src/*.js` files and refresh the snapshot with `-u`, after confirming the new
values are intended.

## Command-line use

```bash
yarn workspace tstrace build
yarn cli              # Node REPL with the library preloaded as `tstrace`
yarn cli script.js    # run a script; require('tstrace') resolves to the local build
```

## Deploy

Pushing to `main` deploys automatically (`.github/workflows/ci.yml`):

1. `yarn install --immutable`, build the engine, run `test:regression`.
2. If that passes: `yarn build` and publish `packages/tstrace-vue/dist` to the
   `gh-pages` branch, served at
   <https://comp-cogneuro-lang.github.io/tsTRACE/>.

Because of `--immutable`, commit `yarn.lock` whenever dependencies change, or
CI fails at install. Do not push `gh-pages` by hand; the workflow owns it.

## Quick reference

| Task | Command (from repo root) |
|---|---|
| Install dependencies | `yarn install` |
| Rebuild everything | `yarn build` |
| Rebuild engine only | `yarn workspace tstrace build` |
| Engine rebuild on save (GUI) | `yarn workspace tstrace build:esm --watch` |
| Dev server | `yarn vue-dev` → <http://localhost:5173/> |
| Preview production build | `yarn workspace tstrace-vue serve` → <http://localhost:4173/tsTRACE/> |
| Type-check GUI | `cd packages/tstrace-vue && npx vue-tsc --noEmit` |
| Regression tests | `yarn workspace tstrace test:regression` |
