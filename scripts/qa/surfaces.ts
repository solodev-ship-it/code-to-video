import assert from 'node:assert/strict';
import {readFile, mkdir, writeFile} from 'node:fs/promises';
import {spawnSync} from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
import {performance} from 'node:perf_hooks';
import {PNG} from 'pngjs';
import {renderMedia, selectComposition} from '@remotion/renderer';
import {captureCases, qaPaths, validateRun} from './visual.ts';
import {createRenderSession, relative} from './render.ts';
import type {VisualCase} from './cases.ts';
import type {QualityReport} from './reports.ts';
import {assertEffectiveBlur, regionDifference} from './surface-metrics.ts';
import {comparePng, strictComparison} from './compare.ts';
import {checkGlassContrast} from './glass-contrast.ts';

const run = validateRun(process.argv[2] ?? `surfaces-${Date.now()}`);
const cases: VisualCase[] = [];
function add(id: string, fixture: string, brandId = 'aurora-finance', styleId = 'cinematic', background = 'frequency', frame = 180, reducedMotion = false) {
  cases.push({schemaVersion: 1, id, compositionId: 'GlassmorphismShowcase', width: 1920, height: 1080, fps: 30, frame,
    brandId, styleId, fontPolicy: 'system-compatible', props: {schemaVersion: 1, brandId, styleId, motionId: 'elegant', reducedMotion, fixture, background, diagnostics: true}});
}
for (const brand of ['aurora-finance', 'ember-studio']) {
  for (const style of ['cinematic', 'minimal']) for (const frame of [15, 90, 180, 299]) add(`${brand}-${style}-glass-f${frame}`, 'showcase', brand, style, 'dark', frame);
  for (const background of ['dark', 'light', 'grid', 'frequency']) for (const fixture of ['glass', 'fallback', 'layered']) add(`${brand}-${background}-${fixture}`, fixture, brand, 'cinematic', background);
}
for (const fixture of ['no-blur', 'solid', 'alpha', 'border-off', 'shadow-off']) add(`material-${fixture}`, fixture);
add('glass-reduced', 'showcase', 'aurora-finance', 'cinematic', 'dark', 180, true);
const summary: Record<string, unknown> = {schemaVersion: 1, run, status: 'failed', humanApproval: 'pending', warnings: ['System fonts retained; no formal accessibility or cross-platform pixel guarantee.', 'Timing includes composition selection and PNG encoding; single-host benchmark, not universal GPU performance.']};
async function png(report: QualityReport, id: string) {
  const row = report.cases.find((r) => r.case.id === id); assert(row, id);
  return PNG.sync.read(await readFile(path.resolve(qaPaths.current, '../../..', row.artifacts.image)));
}
function command(binary: string, args: string[]) {
  const result = spawnSync(binary, args, {encoding: 'utf8', timeout: 120000});
  if (result.error || result.status !== 0) throw new Error(`${binary} failed: ${result.error?.message ?? result.stderr}`);
  return result.stdout;
}
async function main() {
  const report = await captureCases(cases, run, true);
  if (report.status !== 'passed') throw new Error('Surface capture/layout/exact repeat check failed.');
  const glass = await png(report, 'aurora-finance-frequency-glass'); const sharp = await png(report, 'material-no-blur');
  const interior = {x: 650, y: 400, width: 500, height: 200};
  summary.blur = assertEffectiveBlur(glass, sharp, interior);
  // A no-filter frame must fail this same causal test; not merely have a failed status.
  assert.throws(() => assertEffectiveBlur(sharp, sharp, interior), /BACKDROP_BLUR_INEFFECTIVE/);
  const border = await png(report, 'material-border-off'); const shadow = await png(report, 'material-shadow-off');
  const borderDelta = regionDifference(glass, border, {x: 600, y: 280, width: 600, height: 3});
  const shadowDelta = regionDifference(glass, shadow, {x: 600, y: 765, width: 600, height: 24});
  assert(borderDelta > 1, `Border invisible: ${borderDelta}`); assert(shadowDelta > 0.2, `Shadow invisible: ${shadowDelta}`);
  summary.borderAndShadow = {borderMeanRgbDelta: borderDelta, shadowMeanRgbDelta: shadowDelta};
  const alpha = await png(report, 'material-alpha');
  const insideAlpha = alpha.data[(500 * alpha.width + 800) * 4 + 3]!; const outsideAlpha = alpha.data[(40 * alpha.width + 40) * 4 + 3]!;
  assert(insideAlpha > 130 && insideAlpha < 230, `Unexpected surface alpha ${insideAlpha}`); assert.equal(outsideAlpha, 0);
  summary.alpha = {insideAlpha, outsideAlpha};
  const fallback = await png(report, 'aurora-finance-frequency-fallback');
  assert(regionDifference(glass, fallback, interior) > 1, 'Fallback must differ from true backdrop blur.');
  const ember = await png(report, 'ember-studio-frequency-glass');
  assert(regionDifference(glass, ember, interior) > 1, 'Theme switching did not change material.');
  const layered = await png(report, 'aurora-finance-frequency-layered');
  assert(regionDifference(glass, layered, {x: 400, y: 220, width: 600, height: 500}) > 1, 'Layered surfaces absent.');
  const directory = path.join(qaPaths.current, `${run}-media`); await mkdir(directory);
  const session = await createRenderSession(directory);
  try {
    summary.environment = {os: os.platform(), release: os.release(), arch: os.arch(), cpu: os.cpus()[0]?.model ?? 'unknown', logicalCpus: os.cpus().length,
      node: process.version, browser: session.browserVersion, gl: 'swangle', scale: 1, width: 1920, height: 1080, fps: 30, concurrency: 1};
    const benchmark: Record<string, unknown> = {};
    for (const fixture of ['solid', 'glass', 'layered']) {
      const props = {...cases[0]!.props, fixture, background: 'frequency'}; const samples: number[] = [];
      for (let i = 0; i < 4; i++) {
        const start = performance.now();
        await session.capture({compositionId: 'GlassmorphismShowcase', frame: 180, props, output: path.join(directory, `benchmark-${fixture}-${i}.png`)});
        if (i > 0) samples.push(performance.now() - start);
      }
      benchmark[fixture] = {warmupCaptures: 1, sampleMilliseconds: samples, medianMilliseconds: [...samples].sort((a, b) => a - b)[1]};
    }
    summary.benchmark = benchmark;
    const props = {...cases.find((c) => c.id === 'aurora-finance-cinematic-glass-f180')!.props, diagnostics: false};
    const parallelFiles = [path.join(directory, 'parallel-a.png'), path.join(directory, 'parallel-b.png')];
    await Promise.all(parallelFiles.map((output) => session.capture({compositionId: 'GlassmorphismShowcase', frame: 180, props, output})));
    const parallelComparison = comparePng(await readFile(parallelFiles[0]!), await readFile(parallelFiles[1]!), strictComparison);
    assert.equal(parallelComparison.metrics.differingPixels, 0, 'Parallel independent captures diverged.');
    const settledRow = report.cases.find((c) => c.case.id === 'aurora-finance-cinematic-glass-f180')!;
    const outOfOrder = comparePng(await readFile(parallelFiles[0]!), await readFile(path.resolve(qaPaths.current, '../../..', settledRow.artifacts.image)), strictComparison);
    assert.equal(outOfOrder.metrics.differingPixels, 0, 'Out-of-order capture diverged.');
    summary.parallelAndOutOfOrder = {status: 'passed', captures: 2, differingPixels: 0};
    summary.labelContrast = await checkGlassContrast(session, directory);
    const composition = await selectComposition({serveUrl: session.serveUrl, id: 'GlassmorphismShowcase', inputProps: props, puppeteerInstance: session.browser});
    const output = path.join(directory, 'GlassmorphismShowcase.mp4');
    await renderMedia({serveUrl: session.serveUrl, composition, inputProps: props, codec: 'h264', pixelFormat: 'yuv420p', outputLocation: output,
      puppeteerInstance: session.browser, overwrite: false, concurrency: 1, disallowParallelEncoding: true, chromiumOptions: {gl: 'swangle'}, logLevel: 'error'});
    const metadata = JSON.parse(command('ffprobe', ['-v', 'error', '-count_frames', '-select_streams', 'v:0', '-show_entries', 'stream=codec_name,width,height,r_frame_rate,nb_read_frames', '-show_entries', 'format=duration,size', '-of', 'json', output]));
    assert.equal(metadata.streams[0].width, 1920); assert.equal(metadata.streams[0].height, 1080); assert.equal(metadata.streams[0].codec_name, 'h264');
    assert.equal(metadata.streams[0].nb_read_frames, '300'); assert.equal(metadata.streams[0].r_frame_rate, '30/1'); assert.equal(Number(metadata.format.duration), 10);
    command('ffmpeg', ['-v', 'error', '-i', output, '-f', 'null', '-']);
    summary.mp4 = {artifact: relative(output), metadata, fullDecode: true};
  } finally {await session.close();}
  summary.status = 'passed'; summary.exactRepeatPairs = report.cases.length;
}
try {await main();} catch (error) {summary.error = {message: String(error), stack: error instanceof Error ? error.stack ?? '' : ''}; process.exitCode = 1;}
await mkdir(qaPaths.reports, {recursive: true});
await writeFile(path.join(qaPaths.reports, `${run}-surfaces.json`), JSON.stringify(summary, null, 2) + '\n', {flag: 'wx'});
console.log(JSON.stringify(summary, null, 2));
