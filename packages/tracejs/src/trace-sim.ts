// This file is excluded from browser builds (see trace-sim-browser.js)

import * as fs from 'fs';
import * as path from 'path';
import * as zlib from 'zlib';
import { Writable } from 'stream';
import TraceSimBase from './trace-sim-base';

function writeFile(filepath: string, data: any[][][], headers?: string) {
  const numRows = data[0]?.length || 0;
  const numCols = data[0]?.[0]?.length || 0;
  const allCycles: any[][] = [];
  for (let row = 0; row < numRows; row++) {
    for (let cycle = 0; cycle < data.length; cycle++) {
      allCycles.push([cycle, ...data[cycle][row]]);
    }
  }

  const dir = path.dirname(filepath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const csvContent = allCycles.map((row) => row.join(', ')).join('\n');
  const fileContent = headers ? `${headers}\n${csvContent}` : csvContent;

  // Write as gzip compressed file with .gz extension
  const gzPath = filepath + '.gz';
  fs.writeFileSync(gzPath, zlib.gzipSync(fileContent));
}

function write(stream: Writable, data: any) {
  return new Promise<void>((resolve) => {
    if (!stream.write(data)) {
      stream.once('drain', resolve);
    } else {
      process.nextTick(resolve);
    }
  });
}

export default class TraceSim extends TraceSimBase {
  writeFiles(dir: string, prefix = '') {
    const prefixUnderscore = prefix ? `${prefix}_` : '';

    const { input, feature, phoneme, word } = this.getSimData();

    const numTimeSlices = feature[0]?.[0]?.length - 1 || 0; // -1 to exclude the index column
    const timeHeaders = Array.from({ length: numTimeSlices }, (_, i) => `t${i}`).join(', ');

    const inputHeader = `cycle, input, feature_index, ${timeHeaders}`;
    const featureHeader = `cycle, input, feature_index, ${timeHeaders}`;
    const phonemeHeader = `cycle, input, phoneme, ${timeHeaders}`;
    const wordHeader = `cycle, input, word, ${timeHeaders}`;

    writeFile(path.join(dir, `${prefixUnderscore}input.csv`), input, inputHeader);
    writeFile(path.join(dir, `${prefixUnderscore}feature.csv`), feature, featureHeader);
    writeFile(path.join(dir, `${prefixUnderscore}phoneme.csv`), phoneme, phonemeHeader);
    writeFile(path.join(dir, `${prefixUnderscore}word.csv`), word, wordHeader);
  }

  async appendInputData(file: Writable, prefix?: string[]) {
    return write(file, this.serializeInputData(prefix));
  }

  async appendFeatureData(file: Writable, prefix?: string[]) {
    return write(file, this.serializeFeatureData(prefix));
  }

  async appendPhonemeData(file: Writable, prefix?: string[]) {
    return write(file, this.serializePhonemeData(prefix));
  }

  async appendWordData(file: Writable, prefix?: string[]) {
    return write(file, this.serializeWordData(prefix));
  }

  async appendLevelsAndFlowData(file: Writable, prefix?: string[]) {
    return write(file, this.serializeLevelsAndFlowData(prefix));
  }

  async appendFiles(files: Writable[], prefix?: string[]) {
    await Promise.all([
      this.appendInputData(files[0], prefix),
      this.appendFeatureData(files[1], prefix),
      this.appendPhonemeData(files[2], prefix),
      this.appendWordData(files[3], prefix),
      this.appendLevelsAndFlowData(files[4], prefix),
    ]);
  }
}
