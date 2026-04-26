# tsTRACE Test Suite Guide

## Overview

A comprehensive regression testing framework for detecting unintended changes in model behavior. After making code changes, run tests to quantify how the model output changes.

All output files are automatically compressed with gzip (.gz format) to save disk space while maintaining full accuracy for comparison.

## Quick Start

### 1. Create Baseline (First Time Only)
```bash
cd packages/tracejs
yarn test:baseline
```
Creates reference outputs in `baseline_data/` for the first 10 words in the lexicon.

### 2. Run Regression Tests
After making code changes:
```bash
yarn test:regression
```
Compares current outputs to baseline and generates a detailed report.

### 3. Check Individual Word
```bash
yarn test:quick pat
```
Quick comparison of a specific word's output.

### 4. Test All Words (Comprehensive)
```bash
yarn test:all-words 100  # Test first 100 words (omit number for all)
```
Comprehensive test across many words, produces summary statistics.

## Test Scripts

| Script | Command | Purpose | Output |
|--------|---------|---------|--------|
| baseline-test | `yarn test:baseline` | Create reference data | `baseline_data/` |
| regression-test | `yarn test:regression` | Full regression suite | `regression_results.json` |
| quick-compare | `yarn test:quick <word>` | Single word check | Console report |
| test-all-words | `yarn test:all-words [limit]` | Comprehensive test | `comprehensive_test_results.json` |

## Typical Workflows

### After Implementing a Bug Fix
```bash
# Verify the fix didn't break anything
yarn test:regression

# If tests pass, update baseline for future comparisons
yarn test:baseline
```

### After Tweaking Parameters
```bash
# See how parameters affect model output
yarn test:quick pat
yarn test:quick bat
yarn test:quick sat

# Check overall impact
yarn test:all-words 20
```

### Before and After Comparison
```bash
# Save baseline before changes
yarn test:baseline

# Make code changes...

# Compare to before
yarn test:regression

# Analyze differences in regression_results.json
cat baseline_data/regression_results.json | jq '.tests[].stats.valueDiff'
```

### When Debugging Unexpected Changes
```bash
# Test specific word that's problematic
yarn test:quick problematic_word

# View detailed diff stats
cat baseline_data/comprehensive_test_results.json | jq '.results[] | select(.status=="FAIL")'
```

## Output Files

### baseline_data/
```
baseline_data/
├── baseline_report.json              # Metadata about baseline
├── regression_results.json           # Latest regression test results
├── comprehensive_test_results.json   # Full lexicon test results
├── ^pat/                             # Word outputs
│   ├── input.csv                     # Feature layer activations
│   ├── feature.csv                   # Feature layer data
│   ├── phoneme.csv                   # Phoneme layer data
│   └── word.csv                      # Word layer data
└── ...more words
```

### regression_results.json Structure
```json
{
  "timestamp": "2026-04-25T21:50:00.000Z",
  "status": "PASS" | "FAIL",
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
            "valueDiff": {
              "maxDiff": 0.0,           # Maximum absolute difference
              "meanDiff": 0.0,          # Average difference across all values
              "stdDiff": 0.0            # Standard deviation of differences
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
- All values match within threshold (1e-4)
- No structural changes (rows/columns)
- Model behavior is unchanged

### FAIL with Small Differences
- `maxDiff` < 0.01 and `meanDiff` < 0.001: Likely floating-point rounding
- Review changes—probably acceptable
- Consider updating baseline if changes are intentional

### FAIL with Large Differences
- `maxDiff` > 0.1 or `meanDiff` > 0.01: Significant change
- Investigate code changes
- Verify this is expected behavior

## Threshold Configuration

Default threshold: `1e-4` (0.0001)

To modify, edit the comparison functions:
```typescript
// In regression-test.ts
const threshold = 1e-4;  // Change this value
```

## Running Tests in CI/CD

Add to GitHub Actions:
```yaml
- name: Run regression tests
  run: |
    cd packages/tracejs
    yarn test:regression
    cat baseline_data/regression_results.json
```

Fail the build if tests don't pass:
```bash
# At end of test script
if [[ $status != "PASS" ]]; then
  exit 1
fi
```

## Troubleshooting

### "Baseline not found"
Run `yarn test:baseline` first to create initial baseline data.

### Tests fail after code changes
Check if changes are intentional:
1. Review regression_results.json for actual differences
2. If changes are correct, run `yarn test:baseline` to update baseline
3. If changes are incorrect, revert code changes

### Floating-point precision issues
Differences < 1e-4 are usually acceptable—they're floating-point rounding artifacts. Current threshold is designed to catch these.

### Want to test more/fewer words
Edit baseline-test.ts:
```typescript
// Test first N words
const words = config.lexicon.slice(0, 50);  // Change 50 to desired count
```

## Advanced Usage

### Compare Two Arbitrary Outputs
```typescript
import { compareCSVFiles, printComparisonResults } from './compare-outputs';

const result = compareCSVFiles(
  'baseline_data/^pat/input.csv',
  'new_output/input.csv'
);
console.log(result);
```

### Custom Comparison Threshold
```typescript
const result = compareCSVFiles(
  baselineFile,
  currentFile,
  { threshold: 1e-5, skipHeader: true }  // Stricter threshold
);
```

### Batch Compare Multiple Outputs
```typescript
import { compareWordOutputs } from './compare-outputs';

const results = compareWordOutputs(
  'baseline_data/pat',
  'new_output/pat'
);
```

## Notes

- Tests use tab-separated values (TSV) format with headers
- Numeric comparisons use 4 decimal places
- Header rows are skipped during comparison
- Baseline data should be committed to version control
- Tests take ~5-30 seconds depending on word count
