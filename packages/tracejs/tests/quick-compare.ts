/**
 * Quick Comparison Script
 * Compare a specific simulation to baseline
 * Usage: npx ts-node tests/quick-compare.ts [word]
 * Example: npx ts-node tests/quick-compare.ts pat
 */

import * as fs from 'fs';
import * as path from 'path';
import TraceSim, { createDefaultConfig } from '../src/index';
import { compareWordOutputs, printComparisonResults } from './compare-outputs';

const BASELINE_DIR = path.join(__dirname, '../baseline_data');

async function quickCompare(word?: string) {
  if (!word) {
    console.log('Usage: npx ts-node tests/quick-compare.ts [word]');
    console.log('Example: npx ts-node tests/quick-compare.ts pat');
    process.exit(1);
  }

  console.log(`Quick comparing word: ${word}\n`);

  // Format word to match baseline directory naming
  const wordDirName = word.replace(/[\^\/]/g, '_');
  const baselineWordDir = path.join(BASELINE_DIR, wordDirName);

  if (!fs.existsSync(baselineWordDir)) {
    console.error(`❌ Baseline not found for word: ${word}`);
    console.error(`Expected: ${baselineWordDir}`);
    console.error('\nRun baseline-test.ts first to create baseline data');
    process.exit(1);
  }

  // Run simulation
  const config = createDefaultConfig();
  config.modelInput = word;

  const sim = new TraceSim(config);
  sim.cycle(81);

  const tempDir = path.join(__dirname, '../temp_quick_test');
  if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
  }

  sim.writeFiles(tempDir);

  // Compare
  const results = compareWordOutputs(baselineWordDir, tempDir, [
    'input.csv.gz',
    'feature.csv.gz',
    'phoneme.csv.gz',
    'word.csv.gz',
  ]);
  printComparisonResults(results);

  // Cleanup
  fs.rmSync(tempDir, { recursive: true, force: true });

  const allPassed = results.every(r => r.status === 'PASS');
  process.exit(allPassed ? 0 : 1);
}

const word = process.argv[2];
quickCompare(word).catch(console.error);
