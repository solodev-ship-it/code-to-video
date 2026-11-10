import assert from 'node:assert/strict';
import {mkdir, readFile, writeFile} from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {spawnSync} from 'node:child_process';
import {renderMedia, selectComposition} from '@remotion/renderer';
import {PNG} from 'pngjs';
import {createRenderSession, root, relative} from './render.ts';
import {validateRun, sourceHash, writeReport, qaPaths} from './visual.ts';
import {comparePng, strictComparison} from './compare.ts';
import {hash} from './baselines.ts';
import {caseKey, validateCase} from './cases.ts';
import type {CaseResult, QualityReport, Fingerprint} from './reports.ts';
import {reportError} from './errors.ts';
import type {LayoutReport} from '../../packages/ui/src/diagnostics/types.ts';
import {evaluateIsland} from '../../packages/ui/src/island.ts';
import {showcaseRegistry} from '../../apps/studio/src/showcase-themes.ts';
import {resolveTheme} from '@code-to-video/themes';
import {demoIslandTiming, demoIslandGeometry} from '../../apps/studio/src/island-props.ts';

const run = validateRun(process.argv[2] ?? `island-${Date.now()}`);
const directory = path.join(qaPaths.current, run); await mkdir(directory);
const definitions = [
  ['compact', 45, 'showcase'], ['morph', 75, 'showcase'], ['expanded', 120, 'showcase'], ['statistic', 180, 'showcase'],
  ['collapse', 249, 'showcase'], ['exit', 285, 'showcase'], ['hidden', 329, 'showcase'], ['ember', 180, 'showcase'],
  ['icons-drawing', 40, 'icons'], ['icons-settled', 90, 'icons'], ['solid', 120, 'solid'], ['reduced', 120, 'showcase'],
] as const;
const report: QualityReport & {media?: Record<string, unknown>; svgInk?: Record<string, number>; dependencies?: Record<string, string>} = {
  schemaVersion: 1, timestamp: new Date().toISOString(), run, status: 'failed', cases: [], comparisonOptions: {...strictComparison},
};
let session: Awaited<ReturnType<typeof createRenderSession>> | undefined;
function command(binary: string, args: string[]) {
  const r = spawnSync(binary, args, {encoding: 'utf8', timeout: 120000});
  if (r.error || r.status !== 0) throw new Error(`${binary} verification failed: ${r.error?.message ?? r.stderr}`);
  return r.stdout;
}
try {
  const source = await sourceHash(); session = await createRenderSession(directory);
  const pkg = JSON.parse(await readFile(path.join(root, 'apps/studio/package.json'), 'utf8'));
  report.dependencies = {remotion: pkg.dependencies.remotion, lucide: pkg.dependencies['lucide-react'], phosphor: pkg.dependencies['@phosphor-icons/react']};
  const environment: Fingerprint = {os: {platform: os.platform(), release: os.release()}, arch: os.arch(), node: process.version, remotion: pkg.dependencies.remotion,
    browser: session.browserVersion, viewport: {width: 1920, height: 1080}, deviceScaleFactor: 1, render: {gl: 'swangle', scale: 1, imageFormat: 'png', fps: 30}};
  for (const [id, frame, fixture] of definitions) {
    const props = {schemaVersion: 1, brandId: id === 'ember' ? 'ember-studio' : 'aurora-finance', styleId: id === 'ember' ? 'minimal' : 'cinematic',
      motionId: 'elegant', reducedMotion: id === 'reduced', fixture, diagnostics: true};
    const c = validateCase({schemaVersion: 1, id: `island-${id}`, compositionId: 'DynamicIslandShowcase', width: 1920, height: 1080, fps: 30,
      frame, brandId: props.brandId, styleId: props.styleId, props, fontPolicy: 'system-compatible'});
    const image = path.join(directory, `${id}.png`); const repeated = path.join(directory, `${id}.repeat.png`);
    const row: CaseResult = {case: c, key: caseKey(c), status: 'captured', sourceHash: source, environment,
      fontDiagnostics: [{code: 'SYSTEM_FONT_COMPATIBILITY', severity: 'warning', message: 'Original theme font stacks retained; cross-machine glyph identity is not asserted.'}],
      layoutDiagnostics: [], artifacts: {image: relative(image)}};
    report.cases.push(row);
    try {
      const capture = await session.capture({compositionId: c.compositionId, frame, props, output: image});
      const layout = capture.artifacts.find((a) => a.filename === 'layout.json');
      if (layout) {row.layoutDiagnostics = (JSON.parse(layout.content) as LayoutReport).diagnostics; assert(!row.layoutDiagnostics.some((d) => d.severity === 'error'), 'Critical new showcase layout.');}
      const evidence = capture.artifacts.find((a) => a.filename === 'island-qa.json'); assert(evidence, 'Browser SVG/island evidence missing.');
      const probe = JSON.parse(evidence.content) as {icons: {id: string; pathCount: number; viewBox: string; x: number; y: number; width: number; height: number}[];
        island: null | {phase: string; width: number; height: number; backdropFilter: string}};
      await writeFile(path.join(directory, `${id}.evidence.json`), evidence.content, {flag: 'wx'});
      for (const icon of probe.icons) {assert(icon.pathCount > 0, `${icon.id} contains no SVG path`); assert(icon.viewBox, 'Missing SVG viewBox.');}
      if (fixture !== 'icons') {
        const theme = resolveTheme(showcaseRegistry, {schemaVersion: 1, brandId: props.brandId, styleId: props.styleId, motionId: 'elegant'});
        const expected = evaluateIsland(frame, 30, theme.motion, demoIslandTiming, demoIslandGeometry, props.reducedMotion);
        if (expected.state === 'hidden') assert.equal(probe.island, null);
        else {assert(probe.island); assert.equal(probe.island.phase, expected.phase);
          assert(Math.abs(probe.island.width - expected.width) < 0.1 && Math.abs(probe.island.height - expected.height) < 0.1, 'Rendered island geometry disagrees with pure state.');
          if (fixture !== 'solid') assert.match(probe.island.backdropFilter, /blur\(/, 'Glass adapter missing browser backdrop filter.');}
      }
      if (id === 'icons-settled') {
        const png = PNG.sync.read(await readFile(image)); const ink: Record<string, number> = {};
        for (const icon of probe.icons) {
          let count = 0;
          for (let y = Math.max(0, Math.ceil(icon.y)); y < Math.min(png.height, Math.floor(icon.y + icon.height)); y++) for (let x = Math.max(0, Math.ceil(icon.x)); x < Math.min(png.width, Math.floor(icon.x + icon.width)); x++) {
            const offset = (y * png.width + x) * 4;
            if ([242, 246, 255].every((v, channel) => Math.abs(png.data[offset + channel]! - v) < 12)) count++;
          }
          assert(count > 15, `${icon.id} produced no measurable foreground SVG ink.`); ink[icon.id] = count;
        }
        report.svgInk = ink;
      }
      await session.capture({compositionId: c.compositionId, frame, props, output: repeated});
      const comparison = comparePng(await readFile(image), await readFile(repeated), strictComparison);
      row.comparison = comparison.metrics; assert.equal(comparison.metrics.differingPixels, 0, 'Exact independent PNG repeat failed.');
      row.hashes = {png: hash(await readFile(image)), repeatPng: hash(await readFile(repeated))}; row.artifacts.repeat = relative(repeated); row.status = 'passed';
      console.log(`PASS ${id}: frame ${frame}, exact PNG repeat, SVG/geometry evidence`);
    } catch (error) {row.status = 'failed'; row.error = reportError('ISLAND_CASE_FAILED', error, root); throw error;}
  }
  // Render a previously captured frame after unrelated states to prove order independence.
  const selected = report.cases.find((r) => r.case.id === 'island-morph')!; const again = path.join(directory, 'morph.out-of-order.png');
  await session.capture({compositionId: 'DynamicIslandShowcase', frame: 75, props: selected.case.props, output: again});
  assert.equal(comparePng(await readFile(path.join(root, selected.artifacts.image)), await readFile(again), strictComparison).metrics.differingPixels, 0);
  const props = {...report.cases[0]!.case.props, diagnostics: false};
  const composition = await selectComposition({serveUrl: session.serveUrl, id: 'DynamicIslandShowcase', inputProps: props, puppeteerInstance: session.browser});
  const video = path.join(directory, 'DynamicIslandShowcase.mp4');
  await renderMedia({serveUrl: session.serveUrl, composition, inputProps: props, codec: 'h264', pixelFormat: 'yuv420p', outputLocation: video,
    puppeteerInstance: session.browser, overwrite: false, concurrency: 1, disallowParallelEncoding: true, chromiumOptions: {gl: 'swangle'}, logLevel: 'error'});
  const metadata = JSON.parse(command('ffprobe', ['-v', 'error', '-count_frames', '-select_streams', 'v:0', '-show_entries', 'stream=codec_name,width,height,r_frame_rate,nb_read_frames', '-show_entries', 'format=duration,size', '-of', 'json', video]));
  const stream = metadata.streams[0]; assert.equal(stream.codec_name, 'h264'); assert.equal(stream.width, 1920); assert.equal(stream.height, 1080);
  assert.equal(stream.r_frame_rate, '30/1'); assert.equal(stream.nb_read_frames, '330'); assert.equal(Number(metadata.format.duration), 11);
  command('ffmpeg', ['-v', 'error', '-i', video, '-f', 'null', '-']);
  report.media = {path: relative(video), metadata, fullDecode: true, outOfOrderExact: true};
  assert.equal(await sourceHash(), source, 'Source changed during targeted rendering.'); report.status = 'passed';
} catch (error) {report.status = 'failed'; report.error = reportError('ISLAND_QA_FAILED', error, root); process.exitCode = 1;}
finally {if (session) await session.close(); console.log(`QA ${report.status}: ${relative(await writeReport(report, 'island'))}`);}
