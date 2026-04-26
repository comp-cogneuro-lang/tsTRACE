const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { TraceSim, createDefaultConfig } = require('../dist/common/index.js');

const BASELINE_DIR = path.join(__dirname, '../baseline_data');
const REPORT_FILE = path.join(BASELINE_DIR, 'baseline_report.json');
const RESULTS_FILE = path.join(BASELINE_DIR, 'regression_results.json');

function readGzipFile(filepath) {
  const gzPath = filepath.endsWith('.gz') ? filepath : filepath + '.gz';
  const uncompressedPath = filepath.endsWith('.gz') ? filepath.slice(0, -3) : filepath;

  if (fs.existsSync(gzPath)) {
    const buffer = fs.readFileSync(gzPath);
    return zlib.gunzipSync(buffer).toString('utf-8').split('\n').filter(l => l.trim());
  } else if (fs.existsSync(uncompressedPath)) {
    return fs.readFileSync(uncompressedPath, 'utf-8').split('\n').filter(l => l.trim());
  } else {
    return null;
  }
}

function compareCSVFiles(baselineFile, currentFile) {
  const baselineData = readGzipFile(baselineFile);
  const currentData = readGzipFile(currentFile);

  if (baselineData === null || currentData === null) {
    return {
      file: path.basename(currentFile),
      status: 'FAIL',
      stats: {
        rowCount: { baseline: 0, current: 0, match: false },
        valueDiff: { maxDiff: 0, meanDiff: 0 },
      },
      errors: ['File not found'],
    };
  }

  const rowMatch = baselineData.length === currentData.length;
  const diffs = [];
  let maxDiff = 0;

  const startIdx = 1;
  const endIdx = Math.min(baselineData.length, currentData.length);

  for (let i = startIdx; i < endIdx; i++) {
    const baselineVals = baselineData[i].split(/[,\t]/).map(v => parseFloat(v.trim()));
    const currentVals = currentData[i].split(/[,\t]/).map(v => parseFloat(v.trim()));

    for (let j = 0; j < Math.min(baselineVals.length, currentVals.length); j++) {
      const bv = baselineVals[j];
      const cv = currentVals[j];

      if (!isNaN(bv) && !isNaN(cv)) {
        const diff = Math.abs(bv - cv);
        diffs.push(diff);
        maxDiff = Math.max(maxDiff, diff);
      }
    }
  }

  const meanDiff = diffs.length > 0 ? diffs.reduce((a, b) => a + b, 0) / diffs.length : 0;
  const threshold = 1e-4;
  const status = rowMatch && maxDiff <= threshold ? 'PASS' : 'FAIL';

  return {
    file: path.basename(currentFile),
    status,
    stats: {
      rowCount: { baseline: baselineData.length, current: currentData.length, match: rowMatch },
      valueDiff: { maxDiff, meanDiff },
    },
    errors: status === 'FAIL' ? [`max_diff=${maxDiff.toExponential(3)}`] : [],
  };
}

async function runRegressionTests() {
  console.log('Running regression tests...\n');

  if (!fs.existsSync(REPORT_FILE)) {
    console.error('❌ Baseline not found. Run yarn test:baseline first.');
    process.exit(1);
  }

  const baselineReport = JSON.parse(fs.readFileSync(REPORT_FILE, 'utf-8'));
  const config = createDefaultConfig();

  const results = {
    timestamp: new Date().toISOString(),
    status: 'PASS',
    testCount: 0,
    passCount: 0,
    failCount: 0,
    tests: [],
  };

  for (const test of baselineReport.outputs.slice(0, 100)) {
    console.log(`Testing: ${test.word}`);

    const simConfig = JSON.parse(JSON.stringify(config));
    simConfig.modelInput = test.word;

    const sim = new TraceSim(simConfig);
    sim.cycle(81);

    const tempDir = path.join(__dirname, '../temp_test_output');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    sim.writeFiles(tempDir);

    const baselineWordDir = path.join(BASELINE_DIR, test.word.replace(/[\^\/]/g, '_'));
    const testResult = { word: test.word, files: [] };

    let wordPassed = true;
    for (const file of ['input.csv.gz', 'feature.csv.gz', 'phoneme.csv.gz', 'word.csv.gz']) {
      const fileResult = compareCSVFiles(
        path.join(baselineWordDir, file),
        path.join(tempDir, file)
      );
      testResult.files.push(fileResult);
      if (fileResult.status === 'FAIL') wordPassed = false;
    }

    fs.rmSync(tempDir, { recursive: true, force: true });

    results.tests.push(testResult);
    results.testCount++;
    if (wordPassed) {
      results.passCount++;
      console.log(`  ✓ PASS\n`);
    } else {
      results.failCount++;
      results.status = 'FAIL';
      console.log(`  ✗ FAIL\n`);
    }
  }

  fs.writeFileSync(RESULTS_FILE, JSON.stringify(results, null, 2));

  console.log('='.repeat(60));
  console.log('REGRESSION TEST RESULTS');
  console.log('='.repeat(60));
  console.log(`Status: ${results.status}`);
  console.log(`Tests: ${results.passCount}/${results.testCount} passed`);
  console.log(`Report: ${RESULTS_FILE}`);
  console.log('='.repeat(60) + '\n');

  process.exit(results.status === 'PASS' ? 0 : 1);
}

runRegressionTests().catch(console.error);
