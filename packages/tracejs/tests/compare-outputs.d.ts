/**
 * Output Comparison Utility
 * Provides functions for comparing simulation outputs (gzip compressed)
 */
export interface ComparisonStats {
    rowCount: {
        baseline: number;
        current: number;
        match: boolean;
    };
    colCount: {
        baseline: number;
        current: number;
        match: boolean;
    };
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
 * Compare two CSV files and return detailed statistics
 */
export declare function compareCSVFiles(baselineFile: string, currentFile: string, options?: {
    threshold?: number;
    skipHeader?: boolean;
}): FileComparisonResult;
/**
 * Compare all output files for a word
 */
export declare function compareWordOutputs(baselineDir: string, currentDir: string, files?: string[]): FileComparisonResult[];
/**
 * Print comparison results in human-readable format
 */
export declare function printComparisonResults(results: FileComparisonResult[]): void;
