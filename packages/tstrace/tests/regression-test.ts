/**
 * Regression Test Suite
 * Compares current output to baseline data
 * Run: npx ts-node tests/regression-test.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import * as zlib from 'zlib';
import TraceSim, { createDefaultConfig } from '../src/index';

const BASELINE_DIR = path.join(__dirname, '../baseline_data');
const REPORT_FILE = path.join(BASELINE_DIR, 'baseline_report.json');
const RESULTS_FILE = path.join(BASELINE_DIR, 'regression_results.json');

interface RegressionResult {
  timestamp: string;
  status: 'PASS' | 'FAIL';
  testCount: number;
  passCount: number;
  failCount: number;
  tests: {
    word: string;
    files: {
      name: string;
      status: 'PASS' | 'FAIL';
      stats: {
        rowCount: { baseline: number; current: number; match: boolean };
        colCount: { baseline: number; current: number; match: boolean };
        valueDiff: { maxDiff: number; meanDiff: number; stdDiff: number };
      };
      message?: string;
    }[];
  }[];
}

async function runRegressionTests() {
  console.log('Running regression tests...\n');

  if (!fs.existsSync(REPORT_FILE)) {
    console.error('❌ Baseline not found. Run baseline-test.ts first.');
    process.exit(1);
  }

  const baselineReport = JSON.parse(fs.readFileSync(REPORT_FILE, 'utf-8'));
  const results: RegressionResult = {
    timestamp: new Date().toISOString(),
    status: 'PASS',
    testCount: 0,
    passCount: 0,
    failCount: 0,
    tests: [],
  };

  const config = createDefaultConfig();

  for (const test of baselineReport.outputs.slice(0, 5)) {
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
    const testResult = {
      word: test.word,
      files: [] as RegressionResult['tests'][0]['files'],
    };

    let wordPassed = true;
    for (const file of ['input.csv.gz', 'feature.csv.gz', 'phoneme.csv.gz', 'word.csv.gz']) {
      const baselineFile = path.join(baselineWordDir, file);
      const currentFile = path.join(tempDir, file);

      if (!fs.existsSync(baselineFile)) {
        testResult.files.push({
          name: file,
          status: 'FAIL',
          stats: {
            rowCount: { baseline: 0, current: 0, match: false },
            colCount: { baseline: 0, current: 0, match: false },
            valueDiff: { maxDiff: 0, meanDiff: 0, stdDiff: 0 },
          },
          message: 'Baseline file not found',
        });
        wordPassed = false;
        continue;
      }

      const fileResult = compareCSVFiles(baselineFile, currentFile);
      testResult.files.push(fileResult);

      if (fileResult.status === 'FAIL') {
        wordPassed = false;
      }
    }

    // Clean up temp files
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

  // Save results
  fs.writeFileSync(RESULTS_FILE, JSON.stringify(results, null, 2));

  console.log(`\n${'='.repeat(60)}`);
  console.log(`REGRESSION TEST RESULTS`);
  console.log(`${'='.repeat(60)}`);
  console.log(`Status: ${results.status}`);
  console.log(`Tests: ${results.passCount}/${results.testCount} passed`);
  console.log(`Report: ${RESULTS_FILE}`);
  console.log(`${'='.repeat(60)}\n`);

  process.exit(results.status === 'PASS' ? 0 : 1);
}

function readGzipFile(filepath: string): string[] {
  const gzPath = filepath.endsWith('.gz') ? filepath : filepath + '.gz';
  const uncompressedPath = filepath.endsWith('.gz') ? filepath.slice(0, -3) : filepath;

  if (fs.existsSync(gzPath)) {
    const buffer = fs.readFileSync(gzPath);
    return zlib.gunzipSync(buffer).toString('utf-8').split('\n').filter(l => l.trim());
  } else if (fs.existsSync(uncompressedPath)) {
    return fs.readFileSync(uncompressedPath, 'utf-8').split('\n').filter(l => l.trim());
  } else {
    return [];
  }
}

function compareCSVFiles(baselineFile: string, currentFile: string) {
  const baselineData = readGzipFile(baselineFile);
  const currentData = readGzipFile(currentFile);

  const baselineRows = baselineData.length;
  const currentRows = currentData.length;
  const rowMatch = baselineRows === currentRows;

  if (!rowMatch) {
    return {
      name: path.basename(baselineFile),
      status: 'FAIL' as const,
      stats: {
        rowCount: { baseline: baselineRows, current: currentRows, match: false },
        colCount: { baseline: 0, current: 0, match: false },
        valueDiff: { maxDiff: 0, meanDiff: 0, stdDiff: 0 },
      },
      message: `Row count mismatch: baseline=${baselineRows}, current=${currentRows}`,
    };
  }

  // Parse and compare numeric values (skip header)
  const diffs: number[] = [];
  let maxDiff = 0;
  let status: 'PASS' | 'FAIL' = 'PASS';
  const threshold = 1e-4; // Allow small floating point differences

  for (let i = 1; i < Math.min(baselineRows, currentRows); i++) {
    const baselineVals = baselineData[i].split(',').map(v => {
      const n = parseFloat(v.trim());
      return isNaN(n) ? null : n;
    });
    const currentVals = currentData[i].split(',').map(v => {
      const n = parseFloat(v.trim());
      return isNaN(n) ? null : n;
    });

    for (let j = 0; j < Math.min(baselineVals.length, currentVals.length); j++) {
      const bv = baselineVals[j];
      const cv = currentVals[j];

      if (bv !== null && cv !== null) {
        const diff = Math.abs(bv - cv);
        diffs.push(diff);
        maxDiff = Math.max(maxDiff, diff);

        if (diff > threshold) {
          status = 'FAIL';
        }
      }
    }
  }

  const meanDiff = diffs.length > 0 ? diffs.reduce((a, b) => a + b, 0) / diffs.length : 0;
  const stdDiff = diffs.length > 0
    ? Math.sqrt(diffs.reduce((sum, d) => sum + Math.pow(d - meanDiff, 2), 0) / diffs.length)
    : 0;

  return {
    name: path.basename(baselineFile),
    status,
    stats: {
      rowCount: { baseline: baselineRows, current: currentRows, match: true },
      colCount: { baseline: 0, current: 0, match: true },
      valueDiff: { maxDiff, meanDiff, stdDiff },
    },
  };
}

runRegressionTests().catch(console.error);
