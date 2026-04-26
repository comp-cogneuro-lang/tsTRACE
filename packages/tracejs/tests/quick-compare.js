const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { TraceSim, createDefaultConfig } = require('../dist/common/index.js');

const BASELINE_DIR = path.join(__dirname, '../baseline_data');

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

function compareFiles(baselineDir, currentDir) {
  const files = ['input.csv.gz', 'feature.csv.gz', 'phoneme.csv.gz', 'word.csv.gz'];
  const results = [];

  for (const file of files) {
    const baselineFile = path.join(baselineDir, file);
    const currentFile = path.join(currentDir, file);

    const baselineData = readGzipFile(baselineFile);
    const currentData = readGzipFile(currentFile);

    if (baselineData === null || currentData === null) {
      results.push({
        name: file,
        status: 'FAIL',
        error: 'File not found',
      });
      continue;
    }

    const rowMatch = baselineData.length === currentData.length;
    const diffs = [];
    let maxDiff = 0;

    for (let i = 1; i < Math.min(baselineData.length, currentData.length); i++) {
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
    const status = (rowMatch && maxDiff <= 1e-4) ? 'PASS' : 'FAIL';

    results.push({
      name: file,
      status,
      maxDiff,
      meanDiff,
    });
  }

  return results;
}

async function quickCompare(word) {
  if (!word) {
    console.log('Usage: node tests/quick-compare.js [word]');
    console.log('Example: node tests/quick-compare.js br');
    process.exit(1);
  }

  console.log(`Quick comparing word: ${word}\n`);

  const wordDirName = word.replace(/[\^\/]/g, '_');
  const baselineWordDir = path.join(BASELINE_DIR, wordDirName);

  if (!fs.existsSync(baselineWordDir)) {
    console.error(`❌ Baseline not found for word: ${word}`);
    process.exit(1);
  }

  const config = createDefaultConfig();
  config.modelInput = word;

  const sim = new TraceSim(config);
  sim.cycle(81);

  const tempDir = path.join(__dirname, '../temp_quick_test');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  sim.writeFiles(tempDir);

  const results = compareFiles(baselineWordDir, tempDir);

  console.log('─'.repeat(70));
  console.log('Comparison Results');
  console.log('─'.repeat(70));

  let passCount = 0;
  for (const result of results) {
    const icon = result.status === 'PASS' ? '✓' : '✗';
    console.log(`${icon} ${result.name.padEnd(25)} ${result.status}`);

    if (result.maxDiff !== undefined) {
      console.log(`   max_diff: ${result.maxDiff.toExponential(3)}  mean_diff: ${result.meanDiff.toExponential(3)}`);
      if (result.status === 'PASS') passCount++;
    }

    if (result.error) {
      console.log(`   ⚠ ${result.error}`);
    }
  }

  console.log('─'.repeat(70));
  console.log(`Summary: ${passCount}/${results.length} files passed`);
  console.log('─'.repeat(70) + '\n');

  fs.rmSync(tempDir, { recursive: true, force: true });
  process.exit(passCount === results.length ? 0 : 1);
}

const word = process.argv[2];
quickCompare(word).catch(console.error);
