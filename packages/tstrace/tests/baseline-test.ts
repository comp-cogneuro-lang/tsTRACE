/**
 * Baseline Test Suite
 * Creates reference output files for regression testing
 * Run: npx ts-node tests/baseline-test.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import TraceSim, { createDefaultConfig } from '../src/index';

const BASELINE_DIR = path.join(__dirname, '../baseline_data');
const REPORT_FILE = path.join(BASELINE_DIR, 'baseline_report.json');

interface BaselineReport {
  timestamp: string;
  configHash: string;
  simulationCount: number;
  parameters: {
    modelInput: string;
    cycles: number;
    alpha: Record<string, number>;
    gamma: Record<string, number>;
  };
  outputs: {
    word: string;
    cycles: number;
    files: string[];
  }[];
}

async function createBaseline() {
  console.log('Creating baseline test data...\n');

  // Ensure baseline directory exists
  if (!fs.existsSync(BASELINE_DIR)) {
    fs.mkdirSync(BASELINE_DIR, { recursive: true });
  }

  const config = createDefaultConfig();
  const reportData: BaselineReport = {
    timestamp: new Date().toISOString(),
    configHash: hashConfig(config),
    simulationCount: 0,
    parameters: {
      modelInput: config.modelInput,
      cycles: 81,
      alpha: config.alpha,
      gamma: config.gamma,
    },
    outputs: [],
  };

  // Test with each word in lexicon
  const words = config.lexicon.slice(0, Math.min(10, config.lexicon.length)); // Start with first 10 for speed

  for (const word of words) {
    console.log(`Simulating: ${word.phon}`);

    const simConfig = JSON.parse(JSON.stringify(config));
    simConfig.modelInput = word.phon;

    const sim = new TraceSim(simConfig);
    sim.cycle(81);

    const wordDir = path.join(BASELINE_DIR, word.phon.replace(/[\^\/]/g, '_'));
    sim.writeFiles(wordDir);

    reportData.outputs.push({
      word: word.phon,
      cycles: 81,
      files: ['input.csv.gz', 'feature.csv.gz', 'phoneme.csv.gz', 'word.csv.gz'],
    });

    reportData.simulationCount++;
    console.log(`  ✓ Saved to ${wordDir}\n`);
  }

  // Save report
  fs.writeFileSync(REPORT_FILE, JSON.stringify(reportData, null, 2));
  console.log(`\n✓ Baseline created: ${reportData.simulationCount} simulations`);
  console.log(`  Report: ${REPORT_FILE}`);
}

function hashConfig(config: any): string {
  const { alpha, gamma, decay, rest } = config;
  const str = JSON.stringify({ alpha, gamma, decay, rest });
  return hashSum(str);
}

function hashSum(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16);
}

createBaseline().catch(console.error);
