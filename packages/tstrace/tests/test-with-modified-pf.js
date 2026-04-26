const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { TraceSim, createDefaultConfig } = require('../dist/common/index.js');

const BASELINE_DIR = path.join(__dirname, '../baseline_data');
const REPORT_FILE = path.join(BASELINE_DIR, 'baseline_report.json');
const RESULTS_FILE = path.join(BASELINE_DIR, 'pf_modification_results.json');

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
      status: 'SKIP',
      stats: { rowCount: { baseline: 0, current: 0 }, valueDiff: { maxDiff: 0, meanDiff: 0 } },
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
  const stdDiff = diffs.length > 0
    ? Math.sqrt(diffs.reduce((sum, d) => sum + Math.pow(d - meanDiff, 2), 0) / diffs.length)
    : 0;

  return {
    file: path.basename(currentFile),
    status: 'MEASURED',
    stats: {
      rowCount: { baseline: baselineData.length, current: currentData.length, match: rowMatch },
      valueDiff: { maxDiff, meanDiff, stdDiff },
    },
  };
}

async function testModifiedPF() {
  console.log('Testing model with alpha[PF] = 0.05\n');
  console.log('Configuration: Default config with alpha.PF changed from 0.0 to 0.05\n');

  if (!fs.existsSync(REPORT_FILE)) {
    console.error('❌ Baseline not found. Run yarn test:baseline first.');
    process.exit(1);
  }

  const baselineReport = JSON.parse(fs.readFileSync(REPORT_FILE, 'utf-8'));
  const baseConfig = createDefaultConfig();

  const results = {
    timestamp: new Date().toISOString(),
    modification: {
      parameter: 'alpha.PF',
      originalValue: baseConfig.alpha.PF,
      modifiedValue: 0.05,
      description: 'Phoneme-to-Feature feedback strength',
    },
    testCount: 0,
    files: {
      unchanged: 0,
      changed: 0,
    },
    words: [],
    summary: {
      maxDiffAcrossAll: 0,
      meanDiffAcrossAll: 0,
      wordsMostAffected: [],
    },
  };

  let maxDiffGlobal = 0;
  let allDiffs = [];

  for (const test of baselineReport.outputs) {
    results.testCount++;
    if (results.testCount % 10 === 0) {
      console.log(`  [${results.testCount}/${baselineReport.outputs.length}] Processing...`);
    }

    const simConfig = JSON.parse(JSON.stringify(baseConfig));
    simConfig.modelInput = test.word;
    simConfig.alpha.PF = 0.05;

    const sim = new TraceSim(simConfig);
    sim.cycle(81);

    const tempDir = path.join(__dirname, '../temp_pf_test');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    sim.writeFiles(tempDir);

    const baselineWordDir = path.join(BASELINE_DIR, test.word.replace(/[\^\/]/g, '_'));
    const wordResult = { word: test.word, files: [] };

    let wordMaxDiff = 0;
    for (const file of ['input.csv.gz', 'feature.csv.gz', 'phoneme.csv.gz', 'word.csv.gz']) {
      const fileResult = compareCSVFiles(
        path.join(baselineWordDir, file),
        path.join(tempDir, file)
      );
      wordResult.files.push(fileResult);

      if (fileResult.stats.valueDiff.maxDiff > 0) {
        results.files.changed++;
        allDiffs.push(fileResult.stats.valueDiff.meanDiff);
      } else {
        results.files.unchanged++;
      }

      wordMaxDiff = Math.max(wordMaxDiff, fileResult.stats.valueDiff.maxDiff);
      maxDiffGlobal = Math.max(maxDiffGlobal, fileResult.stats.valueDiff.maxDiff);
    }

    wordResult.maxDiff = wordMaxDiff;
    results.words.push(wordResult);

    fs.rmSync(tempDir, { recursive: true, force: true });
  }

  // Calculate summary statistics
  if (allDiffs.length > 0) {
    results.summary.maxDiffAcrossAll = maxDiffGlobal;
    results.summary.meanDiffAcrossAll = allDiffs.reduce((a, b) => a + b, 0) / allDiffs.length;
  }

  // Find most affected words
  results.summary.wordsMostAffected = results.words
    .sort((a, b) => b.maxDiff - a.maxDiff)
    .slice(0, 10)
    .map(w => ({ word: w.word, maxDiff: w.maxDiff }));

  fs.writeFileSync(RESULTS_FILE, JSON.stringify(results, null, 2));

  console.log('\n' + '='.repeat(70));
  console.log('PHONEME-TO-FEATURE FEEDBACK MODIFICATION TEST');
  console.log('='.repeat(70));
  console.log(`\nModification: alpha[PF] 0.0 → 0.05`);
  console.log(`Words tested: ${results.testCount}`);
  console.log(`\nResults:`);
  console.log(`  Files with changes: ${results.files.changed}`);
  console.log(`  Files unchanged: ${results.files.unchanged}`);
  console.log(`\nStatistics across all outputs:`);
  console.log(`  Max difference: ${results.summary.maxDiffAcrossAll.toExponential(3)}`);
  console.log(`  Mean difference: ${results.summary.meanDiffAcrossAll.toExponential(3)}`);
  console.log(`\nTop 10 most affected words:`);
  for (const w of results.summary.wordsMostAffected) {
    console.log(`  ${w.word.padEnd(20)} max_diff: ${w.maxDiff.toExponential(3)}`);
  }
  console.log(`\nReport: ${RESULTS_FILE}`);
  console.log('='.repeat(70) + '\n');
}

testModifiedPF().catch(console.error);
