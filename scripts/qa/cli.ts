import {mkdir, readFile, writeFile} from 'node:fs/promises';
import path from 'node:path';
import {fontCheck} from './font-check.ts';
import {layoutCheck} from './layout-check.ts';
import {approveCase, captureCases, compareRun, qaPaths, validateRun} from './visual.ts';
import {visualCases} from '../../tests/visual/cases.ts';
import {themeCheck} from './theme-check.ts';
import {renderSmoke} from './smoke.ts';
import {relative, root} from './render.ts';
import {failureCheck} from './failure-check.ts';
import {errorEvidence} from './errors.ts';

const [operation, ...args] = process.argv.slice(2);
function argument(name: string): string | undefined {
  const index = args.indexOf(`--${name}`);
  if (index === -1) return undefined;
  const value = args[index + 1]; if (!value || value.startsWith('--')) throw new Error(`--${name} requires a value.`);
  return value;
}
const optionsWithValues = ['run', 'case', 'reviewer', 'reason', 'mode', 'pixel-threshold', 'max-diff-percent', 'cases'];
async function main() {
  for (let i = 0; i < args.length; i++) {
    const key = args[i]!.replace(/^--/, '');
    if (optionsWithValues.includes(key)) {if (!args[++i] || args[i]!.startsWith('--')) throw new Error(`Missing --${key} value.`);}
    else if (key !== 'replace') throw new Error(`Unknown QA argument: ${args[i]}`);
  }
  const run = validateRun(argument('run') ?? `${operation}-${Date.now()}`);
  const casesPath = argument('cases');
  const cases = casesPath ? JSON.parse(await readFile(path.resolve(casesPath), 'utf8')) as unknown : visualCases;
  if (!Array.isArray(cases)) throw new Error('--cases must contain a JSON array of versioned visual cases.');
  if (operation === 'render' || operation === 'all') console.log('INFO: negative fixtures intentionally produce failed capture reports. Only PASS — expected rejection confirms the required causal match. Target.closeTarget cleanup warnings do not excuse unexpected failures.');
  if (operation === 'fonts') await fontCheck();
  else if (operation === 'layout') await layoutCheck();
  else if (operation === 'capture') {
    if ((await captureCases(cases, run)).status === 'failed') throw new Error('Visual capture failed; inspect the structured report.');
    console.log(`Candidates only. Human approval pending. Compare using: npm run qa:visual:compare -- --run ${run}`);
  } else if (operation === 'compare') {
    if (!argument('run')) throw new Error('Compare requires the explicit capture --run.');
    const mode = argument('mode') ?? 'exact'; if (!['exact', 'perceptual'].includes(mode)) throw new Error('Comparison mode must be exact or perceptual.');
    const result = await compareRun(run, {mode: mode as 'exact' | 'perceptual', pixelThreshold: Number(argument('pixel-threshold') ?? 0), maxDiffPercent: Number(argument('max-diff-percent') ?? 0)});
    if (result.status !== 'passed') throw new Error('Visual quality gate failed: missing approval, environment drift, or unexpected pixel differences.');
  } else if (operation === 'approve') {
    if (!argument('run') || !argument('case') || !argument('reviewer') || !argument('reason')) throw new Error('Approval requires --run, --case, --reviewer and --reason after human image review.');
    await approveCase(run, argument('case')!, argument('reviewer')!, argument('reason')!, args.includes('--replace'));
  } else if (operation === 'themes') await themeCheck(run);
  else if (operation === 'render') {await renderSmoke(run); await failureCheck(`${run}-negative`);}
  else if (operation === 'all') {
    await fontCheck(); await layoutCheck(); await themeCheck(`${run}-themes`); await renderSmoke(`${run}-render`); await failureCheck(`${run}-negative`);
    console.log('PASS — technical tests and expected-rejection checks completed. Visual baseline comparison is still required.');
    const captured = await captureCases(cases, `${run}-visual`); if (captured.status === 'failed') throw new Error('Full-gate candidate capture failed.');
    if ((await compareRun(`${run}-visual`)).status !== 'passed') throw new Error('Technical stages passed; visual quality gate failed. Inspect comparison results for pending baseline approval, environment drift or genuine pixel/metadata failures.');
  } else throw new Error(`Unknown QA operation: ${operation}`);
}

const timestamp = new Date().toISOString();
try {
  await main();
  await mkdir(qaPaths.reports, {recursive: true});
  await writeFile(path.join(qaPaths.reports, `operation-${operation}-${Date.now()}.json`), JSON.stringify({schemaVersion: 1, timestamp, operation,
    status: operation === 'capture' ? 'captured-unapproved' : 'passed', approvalImplicit: false}, null, 2));
} catch (error) {
  await mkdir(qaPaths.reports, {recursive: true});
  const file = path.join(qaPaths.reports, `operation-failed-${Date.now()}.json`);
  await writeFile(file, JSON.stringify({schemaVersion: 1, timestamp, operation, status: 'failed', error: {message: String(error), cause: errorEvidence(error, root)}, approvalImplicit: false}, null, 2));
  console.error(`FAIL: ${String(error)}\nReport: ${relative(file)}`); process.exitCode = 1;
}
