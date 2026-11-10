import pixelmatch from 'pixelmatch';
import {PNG} from 'pngjs';
import {existsSync, readFileSync, writeFileSync} from 'node:fs';
export interface ComparisonOptions {mode: 'exact' | 'perceptual'; pixelThreshold: number; maxDiffPercent: number}
export interface ComparisonMetrics {
  status: 'passed' | 'different' | 'dimension-mismatch' | 'missing-baseline' | 'invalid-image';
  differingPixels: number | null;
  differencePercent: number | null;
  totalPixels: number | null;
  error?: string;
}
export const strictComparison: ComparisonOptions = {mode: 'exact', pixelThreshold: 0, maxDiffPercent: 0};
export function validateComparisonOptions(options: ComparisonOptions): void {
  if (!['exact', 'perceptual'].includes(options.mode) || !Number.isFinite(options.pixelThreshold) || options.pixelThreshold < 0 || options.pixelThreshold > 1 ||
    !Number.isFinite(options.maxDiffPercent) || options.maxDiffPercent < 0 || options.maxDiffPercent > 100) throw new Error('Invalid visual comparison threshold.');
  if (options.mode === 'exact' && options.pixelThreshold !== 0) throw new Error('Pixel threshold applies only to perceptual mode. Exact mode compares every RGBA channel.');
}
export function comparePng(current: Buffer, baseline: Buffer, options: ComparisonOptions = strictComparison): {metrics: ComparisonMetrics; diff?: Buffer} {
  validateComparisonOptions(options);
  let a: PNG; let b: PNG;
  try {a = PNG.sync.read(current); b = PNG.sync.read(baseline);}
  catch (error) {return {metrics: {status: 'invalid-image', differingPixels: null, differencePercent: null, totalPixels: null, error: String(error)}};}
  if (a.width !== b.width || a.height !== b.height) return {metrics: {status: 'dimension-mismatch', differingPixels: null, differencePercent: null, totalPixels: null}};
  const diff = new PNG({width: a.width, height: a.height}); let count = 0;
  if (options.mode === 'perceptual') count = pixelmatch(a.data, b.data, diff.data, a.width, a.height, {threshold: options.pixelThreshold, includeAA: true});
  else for (let i = 0; i < a.data.length; i += 4) {
    const changed = a.data.subarray(i, i + 4).compare(b.data.subarray(i, i + 4)) !== 0;
    if (changed) count++;
    diff.data[i] = changed ? 255 : a.data[i]!; diff.data[i + 1] = changed ? 0 : a.data[i + 1]!;
    diff.data[i + 2] = changed ? 255 : a.data[i + 2]!; diff.data[i + 3] = 255;
  }
  const differencePercent = count / (a.width * a.height) * 100;
  return {metrics: {status: differencePercent <= options.maxDiffPercent ? 'passed' : 'different', differingPixels: count, differencePercent, totalPixels: a.width * a.height}, diff: PNG.sync.write(diff)};
}
export function compareFiles(current: string, baseline: string, diff: string, options = strictComparison): ComparisonMetrics {
  validateComparisonOptions(options);
  if (!existsSync(baseline)) return {status: 'missing-baseline', differingPixels: null, differencePercent: null, totalPixels: null};
  const result = comparePng(readFileSync(current), readFileSync(baseline), options);
  if (result.diff) writeFileSync(diff, result.diff, {flag: 'wx'});
  return result.metrics;
}
