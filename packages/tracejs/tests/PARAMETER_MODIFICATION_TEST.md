# Parameter Modification Test Guide

## Overview

This guide explains how to run parameter modification tests using the tsTRACE test suite. These tests allow you to:

1. **Modify a single parameter** (e.g., `alpha[PF]` from 0.0 to 0.05)
2. **Run simulations** with 100 words from the lexicon
3. **Compare outputs** to the baseline data
4. **Quantify the impact** of the parameter change on model behavior

## Example: Testing Phoneme-to-Feature Feedback

The primary example test is `test-with-modified-pf.js`, which changes the phoneme-to-feature feedback strength:

### Running the Test

```bash
cd packages/tracejs
yarn test:pf-modified
```

### What It Does

1. Loads the default configuration
2. **Modifies** `alpha.PF` from 0.0 → 0.05
3. Runs simulations for all 100 baseline words
4. Compares output files to baseline versions
5. Generates a detailed report

### Expected Output

```
PHONEME-TO-FEATURE FEEDBACK MODIFICATION TEST
======================================================================

Modification: alpha[PF] 0.0 → 0.05
Words tested: 100

Results:
  Files with changes: 300
  Files unchanged: 100

Statistics across all outputs:
  Max difference: 9.445e-1
  Mean difference: 9.352e-3

Top 10 most affected words:
  it                   max_diff: 9.445e-1
  ad                   max_diff: 9.380e-1
  but                  max_diff: 9.315e-1
  [... 7 more ...]

Report: baseline_data/pf_modification_results.json
```

### Understanding the Results

**Files with changes (300/400):**
- 4 output files per word (input, feature, phoneme, word)
- Input files never change (they're the acoustic signal)
- Feature, phoneme, word files changed (75% of outputs affected)

**Max difference (0.945):**
- Maximum activation difference in any single cell
- 0.945 = 94.5% change from baseline
- Indicates **large effect** on model behavior

**Mean difference (0.00935):**
- Average difference across all changed values
- 0.00935 = 0.935% average change
- Indicates the effect is **concentrated in specific cells**

**Most affected words:**
- Short words like "it", "ad", "but" show largest changes
- Longer words show slightly smaller effects
- Feedback mechanism has strongest effect early in simulation

## Creating Your Own Parameter Tests

To test a different parameter, follow this pattern:

### Step 1: Create a Test Script

Create a new file `tests/test-with-modified-[PARAM].js`:

```javascript
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { TraceSim, createDefaultConfig } = require('../dist/common/index.js');

const BASELINE_DIR = path.join(__dirname, '../baseline_data');
const REPORT_FILE = path.join(BASELINE_DIR, 'baseline_report.json');

// ... (copy comparison functions from test-with-modified-pf.js)

async function testModified() {
  const baselineReport = JSON.parse(fs.readFileSync(REPORT_FILE, 'utf-8'));
  const baseConfig = createDefaultConfig();

  // Modify your parameter here:
  // baseConfig.alpha.FF = 0.2;  // Example: modify lateral inhibition strength
  // OR
  // baseConfig.decay.F = 0.05;  // Example: modify feature decay rate

  // ... rest of test logic ...
}

testModified().catch(console.error);
```

### Step 2: Update package.json

Add a script to `packages/tracejs/package.json`:

```json
{
  "scripts": {
    "test:pf-modified": "node tests/test-with-modified-pf.js",
    "test:ff-modified": "node tests/test-with-modified-ff.js"
  }
}
```

### Step 3: Run the Test

```bash
cd packages/tracejs
yarn test:ff-modified
```

## Key Parameters to Test

Common parameters worth testing:

### Alpha (Interaction Strengths)
- `alpha.IF` - Input to Feature strength
- `alpha.FP` - Feature to Phoneme strength
- `alpha.PP` - Phoneme lateral inhibition
- `alpha.PW` - Phoneme to Word strength
- `alpha.WP` - Word to Phoneme feedback
- `alpha.PF` - Phoneme to Feature feedback (**primary example**)

### Gamma (Lateral Inhibition)
- `gamma.F` - Feature layer inhibition
- `gamma.P` - Phoneme layer inhibition
- `gamma.W` - Word layer inhibition

### Decay Rates
- `decay.F` - Feature layer decay
- `decay.P` - Phoneme layer decay
- `decay.W` - Word layer decay

### Resting Levels
- `rest.F` - Feature resting activation
- `rest.P` - Phoneme resting activation
- `rest.W` - Word resting activation

## Interpreting Results

### Large Max Difference (> 0.5)
Indicates the parameter has **strong effects** on model behavior. The modified parameter significantly changes activation patterns.

### Small Mean Difference (< 0.01)
Indicates the changes are **localized** to specific activations, not uniformly affecting all cells. This is typical—feedback effects concentrate on relevant features/phonemes.

### High File Change Rate (> 70%)
Shows the parameter affects **multiple layers**. A parameter affecting only one layer would show lower change rates.

### Consistent Word Ranking
If the same words consistently rank as "most affected," the parameter specifically impacts **those phonological contexts**. Example: short words are most affected by PF feedback because they have shorter duration.

## Comparing Multiple Parameters

To understand relative parameter importance:

```bash
# Run all parameter modification tests
yarn test:pf-modified   # PF feedback
yarn test:ff-modified   # Feature inhibition
yarn test:decay-modified # Decay rates

# Compare results
cat baseline_data/pf_modification_results.json | jq '.summary'
cat baseline_data/ff_modification_results.json | jq '.summary'
cat baseline_data/decay_modification_results.json | jq '.summary'
```

Then compare the `maxDiffAcrossAll` values to see which parameter has the strongest impact.

## Workflow: Testing Code Changes

After modifying model code (not just parameters), compare baseline to new behavior:

```bash
# 1. Ensure baseline exists with 100 words
yarn test:baseline

# 2. Make code changes...
# (e.g., fix a bug in phonToFeat implementation)

# 3. Run regression test on all 100 words
yarn test:regression

# 4. Check detailed results
cat baseline_data/regression_results.json | jq '.summary'
```

If max_diff > 1e-3 after a bug fix, the fix changed model behavior. Review the results to confirm the changes are expected.

## Files Generated

Each test creates:

- **`pf_modification_results.json`** - Full results including per-word statistics
- **`regression_results.json`** - Standard regression test results (5 words sample)

## Performance Notes

- **100 words test**: ~5-10 minutes on typical hardware
- **5 words sample** (regression test): ~30 seconds
- **Single word test**: ~5 seconds

Scale based on your needs:
- **Quick validation**: Use `yarn test:quick ark` (~5s)
- **Feature verification**: Use `yarn test:regression` (~30s)
- **Comprehensive analysis**: Use `yarn test:pf-modified` (~5-10 min)

## Troubleshooting

**"Baseline not found"**
```bash
yarn test:baseline  # Create baseline with 100 words
```

**Results show no changes**
- Verify parameter was actually modified in the test script
- Check that modification is large enough to be detected
- Some parameters may have minimal visible effects

**Timeout errors**
- The test is taking longer than the timeout (default 600s)
- Consider testing fewer words or a single word first
- Run in the background: `yarn test:pf-modified &`

## Scientific Notes

Phoneme-to-feature feedback (alpha[PF]):
- **Default value**: 0.0 (disabled per McClelland & Elman 1986)
- **Effect when enabled**: ~94% activation difference in worst case
- **Mechanism**: Top-down constraint from phoneme layer to feature layer
- **Use case**: Models categorical perception and lexical effects

Reference: McClelland & Elman (1986), TRACE: A connectionist model of speech perception
