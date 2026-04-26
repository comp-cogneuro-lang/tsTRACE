# tsTRACE Test Suite

## Overview

The tsTRACE test suite provides automated validation of the TRACE model implementation. Tests cover:
- **Baseline creation** — Generate reference data for regression testing
- **Regression testing** — Detect unintended changes to model behavior
- **Quick comparison** — Fast single-word validation
- **Parameter testing** — Quantify effects of parameter modifications

## Test Files

| File | Purpose | Runtime |
|------|---------|---------|
| `baseline-test.js` | Create 100-word baseline for regression testing | 5-10 min |
| `regression-test.js` | Compare current output to baseline (5-word sample) | 30 sec |
| `quick-compare.js` | Single-word comparison for rapid validation | 5 sec |
| `test-with-modified-pf.js` | Test PF feedback parameter impact (100 words) | 5-10 min |
| `PARAMETER_MODIFICATION_TEST.md` | Guide for creating new parameter tests | — |

## Running Tests

### Baseline Creation
```bash
yarn test:baseline
```
Creates 100-word reference data in `baseline_data/`. Must run before regression tests.

**Options:**
- `DEBUG=1 yarn test:baseline` — Show detailed logging for each word

### Regression Testing
```bash
yarn test:regression
```
Compares first 5 words against baseline. Fails if max difference > 1e-4 (0.01%).

**Options:**
- `DEBUG=1 yarn test:regression` — Show detailed comparison statistics
- Full test: Modify test file to test all 100 words instead of 5

### Quick Comparison
```bash
yarn test:quick ark
```
Compares single word "ark" against baseline. Fast validation after code changes.

**Options:**
- `DEBUG=1 yarn test:quick ark` — Show detailed activation values

### Parameter Testing
```bash
yarn test:pf-modified
```
Tests PF feedback parameter (alpha[PF]: 0.0 → 0.05) across 100 words.

**Output:**
- `baseline_data/pf_modification_results.json` — Full results with statistics

## Debug Mode

Enable verbose logging by setting `DEBUG=1`:

```bash
DEBUG=1 yarn test:baseline
DEBUG=1 yarn test:regression
DEBUG=1 yarn test:quick ark
```

In debug mode:
- ✓ Shows successful operations with status emoji
- 🔍 Shows detailed debug information (simulation details, comparisons)
- ✗ Shows errors with stack traces
- ℹ️ Shows informational messages

## Directory Structure

```
packages/tstrace/
├── tests/
│   ├── baseline-test.js              # Create baseline
│   ├── regression-test.js            # Compare to baseline
│   ├── quick-compare.js              # Single-word test
│   ├── test-with-modified-pf.js      # PF feedback test (template)
│   ├── PARAMETER_MODIFICATION_TEST.md # Parameter test guide
│   └── README.md                      # This file
└── baseline_data/
    ├── baseline_report.json           # Metadata: words tested, config
    ├── word1/                         # Per-word directory
    │   ├── input.csv.gz               # Acoustic input
    │   ├── feature.csv.gz             # Feature layer activations
    │   ├── phoneme.csv.gz             # Phoneme layer activations
    │   └── word.csv.gz                # Word layer activations
    ├── word2/
    └── ...
    ├── regression_results.json        # Results: pass/fail, max diff
    └── pf_modification_results.json   # Parameter test results
```

## Test Configuration

All tests use hardcoded configuration:
- **Cycles:** 81 (standard TRACE simulation length)
- **Tolerance:** 1e-4 (0.01% max difference allowed in regression)
- **Words:** First 100 from default lexicon
- **Output types:** input, feature, phoneme, word, levels-and-flow

To test with different parameters, create a new parameter test script (see `PARAMETER_MODIFICATION_TEST.md`).

## Output Files

Each test generates CSV files with tab-separated headers:

**Feature/Phoneme/Word data:**
```
cycle	[index]	t0	t1	...	tN
0	0	0.1	0.05	...	0.0
...
```

**Compression:**
All files use gzip compression (`.gz` extension). Test utilities automatically decompress.

**Size:**
- Single word: ~25KB compressed (4MB uncompressed)
- 100 words: ~2.5MB compressed (~400MB uncompressed)

## Creating New Parameter Tests

To test a different parameter (e.g., `alpha.FF`):

1. Copy `test-with-modified-pf.js` to `test-with-modified-ff.js`
2. Change line ~119: `simConfig.alpha.FF = 0.2;`
3. Add script to `package.json`: `"test:ff-modified": "node tests/test-with-modified-ff.js"`
4. Run: `yarn test:ff-modified`

See `PARAMETER_MODIFICATION_TEST.md` for detailed instructions.

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Baseline not found" | Run `yarn test:baseline` first |
| "Module not found" | Run `yarn build` to compile TypeScript |
| Large differences detected | Expected if code changed. Review diff carefully. |
| Slow test execution | Normal: 100 words takes 5-10 minutes. Use quick-compare for rapid feedback. |
| Gzip errors | Ensure `zlib` module is available (included in Node.js) |

## Performance Baselines

On typical hardware (2024 MacBook Pro):
- **100-word baseline:** 5-10 minutes
- **100-word parameter test:** 5-10 minutes
- **5-word regression:** 30 seconds
- **1-word quick test:** 5 seconds

## Common Workflows

### After Code Changes
```bash
# Quick validation
yarn test:quick ark

# Full regression test
yarn test:regression

# Update baseline if changes are expected
yarn test:baseline
```

### After Parameter Changes
```bash
# Create parameter test (see PARAMETER_MODIFICATION_TEST.md)
yarn test:pf-modified

# View results
cat baseline_data/pf_modification_results.json | jq '.summary'
```

## Future Improvements

- [ ] Parallel word processing (if sandbox allows)
- [ ] Test result visualization (charts of max_diff by word)
- [ ] CI/CD integration (run tests automatically on PR)
- [ ] Unit tests for individual functions
- [ ] GUI integration tests
