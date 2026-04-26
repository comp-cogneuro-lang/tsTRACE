const fs = require('fs');
const path = require('path');
const { TraceSim, createDefaultConfig } = require('../dist/common/index.js');

const BASELINE_DIR = path.join(__dirname, '../baseline_data');
const REPORT_FILE = path.join(BASELINE_DIR, 'baseline_report.json');

async function createBaseline() {
  console.log('Creating baseline test data...\n');

  if (!fs.existsSync(BASELINE_DIR)) {
    fs.mkdirSync(BASELINE_DIR, { recursive: true });
  }

  const config = createDefaultConfig();
  const reportData = {
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

  const numWords = Math.min(100, config.lexicon.length);
  const words = config.lexicon.slice(0, numWords);

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

  fs.writeFileSync(REPORT_FILE, JSON.stringify(reportData, null, 2));
  console.log(`\n✓ Baseline created: ${reportData.simulationCount} simulations`);
  console.log(`  Report: ${REPORT_FILE}`);
}

function hashConfig(config) {
  const { alpha, gamma, decay, rest } = config;
  const str = JSON.stringify({ alpha, gamma, decay, rest });
  return hashSum(str);
}

function hashSum(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return Math.abs(hash).toString(16);
}

createBaseline().catch(console.error);
