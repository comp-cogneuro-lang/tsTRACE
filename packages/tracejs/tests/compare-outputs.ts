/**
 * Output Comparison Utility
 * Provides functions for comparing simulation outputs (gzip compressed)
 */

import * as fs from 'fs';
import * as path from 'path';
import * as zlib from 'zlib';

export interface ComparisonStats {
  rowCount: { baseline: number; current: number; match: boolean };
  colCount: { baseline: number; current: number; match: boolean };
  numericStats: {
    totalValues: number;
    identicalValues: number;
    numericDiffs: {
      maxDiff: number;
      meanDiff: number;
      stdDiff: number;
    };
  };
}

export interface FileComparisonResult {
  file: string;
  status: 'PASS' | 'FAIL';
  stats: ComparisonStats;
  errors: string[];
}

/**
 * Read gzip compressed CSV file
 */
function readGzipFile(filepath: string): string[] {
  // Try .gz first, then fall back to uncompressed
  const gzPath = filepath.endsWith('.gz') ? filepath : filepath + '.gz';
  const uncompressedPath = filepath.endsWith('.gz') ? filepath.slice(0, -3) : filepath;

  let content: string;
  if (fs.existsSync(gzPath)) {
    const buffer = fs.readFileSync(gzPath);
    content = zlib.gunzipSync(buffer).toString('utf-8');
  } else if (fs.existsSync(uncompressedPath)) {
    content = fs.readFileSync(uncompressedPath, 'utf-8');
  } else {
    throw new Error(`File not found: ${gzPath} or ${uncompressedPath}`);
  }

  return content.split('\n').filter(l => l.trim());
}

/**
 * Compare two CSV files and return detailed statistics
 */
export function compareCSVFiles(
  baselineFile: string,
  currentFile: string,
  options: { threshold?: number; skipHeader?: boolean } = {}
): FileComparisonResult {
  const { threshold = 1e-4, skipHeader = true } = options;

  const errors: string[] = [];
  let stats: ComparisonStats = {
    rowCount: { baseline: 0, current: 0, match: false },
    colCount: { baseline: 0, current: 0, match: false },
    numericStats: {
      totalValues: 0,
      identicalValues: 0,
      numericDiffs: { maxDiff: 0, meanDiff: 0, stdDiff: 0 },
    },
  };

  let baselineLines: string[];
  let currentLines: string[];

  try {
    baselineLines = readGzipFile(baselineFile);
  } catch (e) {
    return {
      file: path.basename(currentFile),
      status: 'FAIL',
      stats,
      errors: [`Baseline file not found: ${baselineFile}`],
    };
  }

  try {
    currentLines = readGzipFile(currentFile);
  } catch (e) {
    return {
      file: path.basename(currentFile),
      status: 'FAIL',
      stats,
      errors: [`Current file not found: ${currentFile}`],
    };
  }

  stats.rowCount = {
    baseline: baselineLines.length,
    current: currentLines.length,
    match: baselineLines.length === currentLines.length,
  };

  if (!stats.rowCount.match) {
    errors.push(
      `Row count mismatch: baseline=${baselineLines.length}, current=${currentLines.length}`
    );
  }

  // Parse and compare values
  const diffs: number[] = [];
  let maxDiff = 0;
  let totalValues = 0;
  let identicalValues = 0;

  const startIdx = skipHeader ? 1 : 0;
  const endIdx = Math.min(baselineLines.length, currentLines.length);

  for (let i = startIdx; i < endIdx; i++) {
    const baselineVals = baselineLines[i].split(/[,\t]/).map(v => parseFloat(v.trim()));
    const currentVals = currentLines[i].split(/[,\t]/).map(v => parseFloat(v.trim()));

    if (i === startIdx) {
      stats.colCount = {
        baseline: baselineVals.length,
        current: currentVals.length,
        match: baselineVals.length === currentVals.length,
      };
    }

    const minLen = Math.min(baselineVals.length, currentVals.length);
    for (let j = 0; j < minLen; j++) {
      const bv = baselineVals[j];
      const cv = currentVals[j];

      if (!isNaN(bv) && !isNaN(cv)) {
        totalValues++;
        const diff = Math.abs(bv - cv);
        diffs.push(diff);
        maxDiff = Math.max(maxDiff, diff);

        if (diff === 0) {
          identicalValues++;
        }
      }
    }
  }

  const meanDiff = totalValues > 0 ? diffs.reduce((a, b) => a + b, 0) / totalValues : 0;
  const stdDiff =
    totalValues > 0
      ? Math.sqrt(diffs.reduce((sum, d) => sum + Math.pow(d - meanDiff, 2), 0) / totalValues)
      : 0;

  stats.numericStats = {
    totalValues,
    identicalValues,
    numericDiffs: { maxDiff, meanDiff, stdDiff },
  };

  const status = errors.length === 0 && maxDiff <= threshold ? 'PASS' : 'FAIL';
  if (maxDiff > threshold) {
    errors.push(
      `Values exceed threshold: max_diff=${maxDiff.toExponential(3)}, threshold=${threshold.toExponential(3)}`
    );
  }

  return {
    file: path.basename(currentFile),
    status,
    stats,
    errors,
  };
}

/**
 * Compare all output files for a word
 */
export function compareWordOutputs(
  baselineDir: string,
  currentDir: string,
  files: string[] = ['input.csv', 'feature.csv', 'phoneme.csv', 'word.csv']
): FileComparisonResult[] {
  return files.map(file =>
    compareCSVFiles(path.join(baselineDir, file), path.join(currentDir, file))
  );
}

/**
 * Print comparison results in human-readable format
 */
export function printComparisonResults(results: FileComparisonResult[]) {
  console.log(`\n${'─'.repeat(70)}`);
  console.log(`Comparison Results`);
  console.log(`${'─'.repeat(70)}`);

  let passCount = 0;
  for (const result of results) {
    const icon = result.status === 'PASS' ? '✓' : '✗';
    console.log(`${icon} ${result.file.padEnd(25)} ${result.status}`);

    if (result.stats.numericStats.totalValues > 0) {
      const maxDiff = result.stats.numericStats.numericDiffs.maxDiff;
      const meanDiff = result.stats.numericStats.numericDiffs.meanDiff;
      console.log(
        `   max_diff: ${maxDiff.toExponential(3)}  mean_diff: ${meanDiff.toExponential(3)}`
      );
    }

    if (result.errors.length > 0) {
      for (const error of result.errors) {
        console.log(`   ⚠ ${error}`);
      }
    }

    if (result.status === 'PASS') passCount++;
  }

  console.log(`${'─'.repeat(70)}`);
  console.log(`Summary: ${passCount}/${results.length} files passed`);
  console.log(`${'─'.repeat(70)}\n`);
}
