/**
 * Test All Words Script
 * Run comprehensive tests on all words in lexicon
 * Usage: npx ts-node tests/test-all-words.ts [limit]
 * Example: npx ts-node tests/test-all-words.ts 50
 */

import * as fs from 'fs';
import * as path from 'path';
import * as zlib from 'zlib';
import TraceSim, { createDefaultConfig } from '../src/index';

const BASELINE_DIR = path.join(__dirname, '../baseline_data');
const RESULTS_FILE = path.join(BASELINE_DIR, 'comprehensive_test_results.json');

interface TestStats {
  word: string;
  status: 'PASS' | 'FAIL';
  files: {
    name: string;
    rowCount: number;
    maxDiff: number;
    meanDiff: number;
  }[];
}

async function testAllWords(limit?: number) {
  const config = createDefaultConfig();
  const words = config.lexicon.slice(0, limit || config.lexicon.length);

  console.log(`Testing ${words.length} words from lexicon...\n`);

  const results: TestStats[] = [];
  let passCount = 0;

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    process.stdout.write(`[${i + 1}/${words.length}] ${word.phon.padEnd(20)} `);

    const simConfig = JSON.parse(JSON.stringify(config));
    simConfig.modelInput = word.phon;

    const sim = new TraceSim(simConfig);
    sim.cycle(81);

    const tempDir = path.join(__dirname, '../temp_all_words');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    sim.writeFiles(tempDir);

    const baselineWordDir = path.join(BASELINE_DIR, word.phon.replace(/[\^\/]/g, '_'));
    let wordPassed = true;

    const fileStats: TestStats['files'] = [];
    for (const file of ['input.csv.gz', 'feature.csv.gz', 'phoneme.csv.gz', 'word.csv.gz']) {
      const baselineFile = path.join(baselineWordDir, file);
      const currentFile = path.join(tempDir, file);

      if (!fs.existsSync(baselineFile)) {
        wordPassed = false;
      } else {
        const stats = compareFile(baselineFile, currentFile);
        fileStats.push({ name: file, ...stats });
        if (stats.maxDiff > 1e-4) {
          wordPassed = false;
        }
      }
    }

    // Cleanup
    fs.rmSync(tempDir, { recursive: true, force: true });

    results.push({
      word: word.phon,
      status: wordPassed ? 'PASS' : 'FAIL',
      files: fileStats,
    });

    const icon = wordPassed ? '✓' : '✗';
    console.log(icon);
    if (wordPassed) passCount++;
  }

  // Save and print results
  fs.writeFileSync(RESULTS_FILE, JSON.stringify({ timestamp: new Date().toISOString(), results }, null, 2));

  console.log(`\n${'='.repeat(60)}`);
  console.log(`COMPREHENSIVE TEST RESULTS`);
  console.log(`${'='.repeat(60)}`);
  console.log(`Words tested: ${results.length}`);
  console.log(`Passed: ${passCount}`);
  console.log(`Failed: ${results.length - passCount}`);
  console.log(`Success rate: ${((passCount / results.length) * 100).toFixed(1)}%`);
  console.log(`Report: ${RESULTS_FILE}`);
  console.log(`${'='.repeat(60)}\n`);

  process.exit(passCount === results.length ? 0 : 1);
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

function compareFile(baselineFile: string, currentFile: string) {
  const baselineData = readGzipFile(baselineFile);
  const currentData = readGzipFile(currentFile);

  const diffs: number[] = [];
  let maxDiff = 0;

  const startIdx = 1; // Skip header
  const endIdx = Math.min(baselineData.length, currentData.length);

  for (let i = startIdx; i < endIdx; i++) {
    const baselineVals = baselineData[i].split(',').map(v => parseFloat(v.trim()));
    const currentVals = currentData[i].split(',').map(v => parseFloat(v.trim()));

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

  return {
    rowCount: baselineData.length,
    maxDiff,
    meanDiff,
  };
}

const limit = process.argv[2] ? parseInt(process.argv[2]) : undefined;
testAllWords(limit).catch(console.error);
