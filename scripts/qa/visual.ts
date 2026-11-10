import {mkdir, readFile, readdir, writeFile, access} from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';
import {createHash} from 'node:crypto';
import {createRenderSession, relative, root} from './render.ts';
import {caseKey, validateCase} from './cases.ts';
import type {VisualCase} from './cases.ts';
import {compareFiles, comparePng, strictComparison, validateComparisonOptions} from './compare.ts';
import type {ComparisonOptions} from './compare.ts';
import {approveBaseline, hash, within} from './baselines.ts';
import type {CaseResult, Fingerprint, QualityReport} from './reports.ts';
import {environmentDrift, serializeReport} from './reports.ts';
import type {LayoutReport} from '../../packages/ui/src/diagnostics/types.ts';
import {checkFontAssets} from './font-check.ts';
import {CriticalLayoutError, reportError} from './errors.ts';

export const qaPaths = {current: path.join(root, 'tests/visual/current'), baselines: path.join(root, 'tests/visual/baselines'),
  diffs: path.join(root, 'tests/visual/diffs'), reports: path.join(root, 'tests/visual/reports')};
export function validateRun(run: string): string {
  if (!/^[a-zA-Z0-9][a-zA-Z0-9-]{0,100}$/.test(run)) throw new Error('QA run must be a simple alphanumeric/hyphen label.');
  return run;
}
export async function sourceHash(): Promise<string> {
  const digest = createHash('sha256');
  async function walk(folder: string) {
    for (const entry of (await readdir(folder, {withFileTypes: true})).sort((a, b) => a.name.localeCompare(b.name))) {
      const file = path.join(folder, entry.name);
      if (entry.isDirectory()) await walk(file);
      else if (entry.isFile()) {digest.update(relative(file)); digest.update(await readFile(file));}
    }
  }
  for (const directory of ['apps/studio/src', 'apps/studio/public', 'packages/ui/src', 'packages/themes/src']) await walk(path.join(root, directory));
  return digest.digest('hex');
}
export async function writeReport(report: QualityReport, suffix: string): Promise<string> {
  await mkdir(qaPaths.reports, {recursive: true});
  const filename = path.join(qaPaths.reports, `${validateRun(report.run)}-${suffix}.json`);
  await writeFile(filename, serializeReport(report), {flag: 'wx'});
  return filename;
}

export async function captureCases(inputs: readonly VisualCase[], run: string, repeat = false): Promise<QualityReport> {
  validateRun(run);
  const cases = inputs.map(validateCase); const keys = cases.map(caseKey);
  if (!cases.length || new Set(keys).size !== keys.length || new Set(cases.map((c) => c.id)).size !== cases.length) throw new Error('Visual cases must be nonempty with unique IDs.');
  await checkFontAssets();
  await mkdir(qaPaths.current, {recursive: true});
  const directory = path.join(qaPaths.current, run); await mkdir(directory); // Never overwrite a previous run.
  const report: QualityReport = {schemaVersion: 1, timestamp: new Date().toISOString(), run, status: 'captured', cases: []};
  if (repeat) report.comparisonOptions = {...strictComparison};
  const before = await sourceHash();
  let session: Awaited<ReturnType<typeof createRenderSession>> | undefined;
  try {
    session = await createRenderSession(directory);
    for (const c of cases) {
      const key = caseKey(c); const image = path.join(directory, `${key}.png`);
      const row: CaseResult = {key, case: c, status: 'captured', sourceHash: before, fontDiagnostics: [], layoutDiagnostics: [], artifacts: {image: relative(image)}};
      report.cases.push(row);
      try {
        const result = await session.capture({compositionId: c.compositionId, frame: c.frame, props: c.props, width: c.width, height: c.height, fps: c.fps, output: image});
        const rendererPackage = JSON.parse(await readFile(path.join(root, 'node_modules/@remotion/renderer/package.json'), 'utf8')) as {version: string};
        const browser = session.browserVersion;
        const fingerprint: Fingerprint = {os: {platform: os.platform(), release: os.release()}, arch: os.arch(), node: process.version, remotion: rendererPackage.version,
          browser: {product: browser.product, revision: browser.revision, userAgent: browser.userAgent}, viewport: {width: c.width, height: c.height}, deviceScaleFactor: 1,
          render: {gl: 'swangle', scale: 1, imageFormat: 'png', fps: c.fps}};
        row.environment = fingerprint;
        const layout = result.artifacts.find((a) => a.filename === 'layout.json');
        if (layout) {
          const parsed = JSON.parse(layout.content) as LayoutReport;
          row.layoutDiagnostics = parsed.diagnostics;
          // Actual browser viewport/DSF supplement the requested capture configuration.
          fingerprint.viewport = parsed.environment.viewport; fingerprint.deviceScaleFactor = parsed.environment.deviceScaleFactor;
          const file = path.join(directory, `${key}.layout.json`); await writeFile(file, layout.content, {flag: 'wx'}); row.artifacts.layout = relative(file);
        }
        const fonts = result.artifacts.find((a) => a.filename === 'font-readiness.json');
        if (c.fontPolicy === 'required-local') {
          if (!fonts || !(JSON.parse(fonts.content) as {ready: boolean}).ready) throw new Error('FONT_NOT_READY: required font proof missing.');
          if (!layout) throw new Error('Required local-font QA cases must emit browser layout measurements.');
          row.fontDiagnostics.push({code: 'LOCAL_FONTS_READY', severity: 'info', message: 'Explicit required local family/weight/style loaded and verified.'});
        } else row.fontDiagnostics.push({code: 'SYSTEM_FONT_COMPATIBILITY', severity: 'warning', message: 'Original system-font tokens preserved; glyph coverage/portable font identity is not asserted.'});
        row.hashes = {png: hash(await readFile(image))};
        if (row.layoutDiagnostics.some((f) => f.severity === 'error')) throw new CriticalLayoutError(row.layoutDiagnostics.filter((f) => f.severity === 'error').map((f) => f.code));
        if (repeat) {
          const again = path.join(directory, `${key}.repeat.png`);
          await session.capture({compositionId: c.compositionId, frame: c.frame, props: c.props, width: c.width, height: c.height, fps: c.fps, output: again});
          const comparison = comparePng(await readFile(image), await readFile(again), strictComparison);
          row.comparison = comparison.metrics; row.artifacts.repeat = relative(again); row.hashes.repeatPng = hash(await readFile(again));
          if (comparison.metrics.status !== 'passed' || comparison.metrics.differingPixels !== 0) throw new Error('Independent render pixels changed.');
          row.status = 'passed';
        }
        console.log(`PASS ${c.id}: ${c.compositionId} frame ${c.frame}${repeat ? ' (exact repeat pixels)' : ' (candidate only)'}`);
      } catch (error) {row.status = 'failed'; row.error = reportError('CAPTURE_FAILED', error, root); throw error;}
    }
    if (await sourceHash() !== before) throw new Error('Source/assets changed during the render run.');
    report.status = repeat ? 'passed' : 'captured';
  } catch (error) {
    report.status = 'failed'; report.error = reportError('QA_CAPTURE_FAILED', error, root);
  } finally {
    if (session) await session.close();
    const file = await writeReport(report, 'capture');
    console.log(`QA ${report.status}: ${relative(file)}`);
  }
  return report;
}

export async function readCapture(run: string): Promise<QualityReport> {
  const report = JSON.parse(await readFile(path.join(qaPaths.reports, `${validateRun(run)}-capture.json`), 'utf8')) as QualityReport;
  if (report.schemaVersion !== 1 || report.run !== run || !Array.isArray(report.cases) || report.status === 'failed') throw new Error('Invalid/failed capture report.');
  return report;
}
export async function compareRun(run: string, options: ComparisonOptions = strictComparison): Promise<QualityReport> {
  validateComparisonOptions(options);
  const original = await readCapture(run); const report = structuredClone(original); report.timestamp = new Date().toISOString(); report.status = 'passed';
  report.comparisonOptions = {...options};
  const attempt = Date.now().toString();
  const diffs = path.join(qaPaths.diffs, `${run}-${attempt}`); await mkdir(diffs, {recursive: true});
  for (const row of report.cases) {
    const key = caseKey(validateCase(row.case)); if (row.key !== key) throw new Error('Capture case key changed.');
    const image = within(qaPaths.current, path.relative(qaPaths.current, within(root, row.artifacts.image)));
    if (hash(await readFile(image)) !== row.hashes?.png) throw new Error('Capture image changed after the report was generated.');
    const baseline = path.join(qaPaths.baselines, `${key}.png`); const diff = path.join(diffs, `${key}.png`);
    try {
      row.comparison = compareFiles(image, baseline, diff, options);
      const metadata = JSON.parse(await readFile(path.join(qaPaths.baselines, `${key}.json`), 'utf8')) as {environment: Fingerprint; sha256: string; key: string; approval: {reviewer: string; reason: string}};
      if (!metadata.approval?.reviewer || !metadata.approval.reason || metadata.key !== key || hash(await readFile(baseline)) !== metadata.sha256) throw new Error('Baseline approval metadata/hash is invalid.');
      row.environmentDrift = environmentDrift(metadata.environment, row.environment!);
      if (await access(diff).then(() => true).catch(() => false)) row.artifacts.diff = relative(diff);
      row.status = row.comparison.status === 'passed' && !row.environmentDrift ? 'passed' : 'failed';
      if (row.environmentDrift) row.error = {code: 'ENVIRONMENT_DRIFT', message: 'Baseline and current environment differ; pixel metrics are reported separately.'};
    } catch (error) {
      row.status = 'failed';
      if (row.comparison?.status === 'missing-baseline') row.error = {code: 'MISSING_BASELINE', message: 'Unapproved case: explicitly review and approve a candidate first.'};
      else row.error = {code: 'BASELINE_ERROR', message: String(error)};
    }
    if (row.status === 'failed') report.status = 'failed';
    const label = row.error?.code === 'MISSING_BASELINE' ? 'BASELINE APPROVAL PENDING' : row.status.toUpperCase();
    console.log(`${label} ${row.case.id}: ${row.error?.code ?? row.comparison?.status}`);
  }
  await writeReport(report, `compare-${attempt}`); return report;
}
export async function approveCase(run: string, id: string, reviewer: string, reason: string, replace: boolean): Promise<void> {
  const report = await readCapture(run); const row = report.cases.find((c) => c.case.id === id);
  if (!row) throw new Error('Select exactly one captured case ID for explicit approval.');
  await approveBaseline(root, row, reviewer, reason, replace);
  console.log(`Approved ${id} by ${reviewer}. Commit the limited baseline PNG/JSON only after human review.`);
}
