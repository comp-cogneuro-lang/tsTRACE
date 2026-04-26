# tsTRACE Regression Test Suite

Automated testing framework for detecting changes in model behavior.

## Overview

The test suite consists of:

1. **baseline-test.ts** - Creates reference output files (baseline)
2. **regression-test.ts** - Compares current output to baseline
3. **compare-outputs.ts** - Utility functions for output comparison

## Setup

### 1. Create Baseline (First Time)

```bash
cd packages/tracejs
npx ts-node tests/baseline-test.ts
```

This will:
- Simulate the first 10 words in the lexicon with default parameters
- Save output files to `packages/tracejs/baseline_data/`
- Create a `baseline_report.json` documenting the baseline configuration

### 2. Run Regression Tests

After making code changes, run:

```bash
npx ts-node tests/regression-test.ts
```

This will:
- Re-run the same simulations with current code
- Compare outputs to baseline files
- Generate `regression_results.json` with detailed statistics

## Output Format

### baseline_report.json
```json
{
  "timestamp": "2026-04-25T21:50:00.000Z",
  "configHash": "a1b2c3d4",
  "simulationCount": 10,
  "parameters": {
    "modelInput": "^pat",
    "cycles": 81,
    "alpha": { "IF": 1.0, "FP": 0.02, ... },
    "gamma": { "F": 0.04, ... }
  },
  "outputs": [
    {
      "word": "^pat",
      "cycles": 81,
      "files": ["input.csv.gz", "feature.csv.gz", "phoneme.csv.gz", "word.csv.gz"]
    }
  ]
}
```

### regression_results.json
```json
{
  "timestamp": "2026-04-25T21:55:00.000Z",
  "status": "PASS",
  "testCount": 10,
  "passCount": 10,
  "failCount": 0,
  "tests": [
    {
      "word": "^pat",
      "files": [
        {
          "name": "input.csv",
          "status": "PASS",
          "stats": {
            "rowCount": { "baseline": 810, "current": 810, "match": true },
            "colCount": { "baseline": 100, "current": 100, "match": true },
            "valueDiff": {
              "maxDiff": 0.0,
              "meanDiff": 0.0,
              "stdDiff": 0.0
            }
          }
        }
      ]
    }
  ]
}
```

## Interpreting Results

### PASS
- Row and column counts match
- All numeric values match within threshold (default: 1e-4)
- No changes to model behavior

### FAIL
- Row/column mismatch (structural change)
- Values exceed threshold (numerical change)
- Missing baseline files

## Common Workflows

### After Bug Fix
```bash
# Verify fix didn't break anything
npx ts-node tests/regression-test.ts

# If results are acceptable, create new baseline
npx ts-node tests/baseline-test.ts
```

### After Parameter Change
```bash
# Check how parameters affect model output
npx ts-node tests/regression-test.ts

# View detailed comparison
cat baseline_data/regression_results.json
```

### Testing Custom Configuration

Edit `baseline-test.ts` to modify:
- Number of test words (change slice in line ~48)
- Simulation cycles (change `sim.cycle()` parameter)
- Model configuration (modify `simConfig` before `new TraceSim()`)

Then regenerate baseline and run tests.

## File Structure

```
packages/tracejs/
├── tests/
│   ├── baseline-test.ts        # Create baseline
│   ├── regression-test.ts       # Run tests
│   ├── compare-outputs.ts       # Comparison utilities
│   └── README.md               # This file
├── baseline_data/
│   ├── baseline_report.json     # Baseline metadata
│   ├── regression_results.json  # Test results
│   ├── ^pat/                    # Word outputs
│   │   ├── input.csv
│   │   ├── feature.csv
│   │   ├── phoneme.csv
│   │   └── word.csv
│   └── ...more words
└── src/
    └── index.ts
```

## Notes

- Tests use tab-separated values (TSV) with headers
- Floating-point values use 4 decimal places for comparison
- Default threshold allows ~1e-4 relative difference
- Tests skip header row when comparing values
- Baseline data is committed to version control for CI/CD
