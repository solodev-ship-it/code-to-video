import {test} from 'node:test';
import assert from 'node:assert/strict';
import {runtimeReport, npmFromUserAgent} from '../../bin/runtime.mjs';
import {parseArgs} from '../../scripts/cli/args.ts';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';

test('runtime policy rejects unqualified majors, older minors and prereleases', () => {
  for (const nodeVersion of ['v20.20.0','v21.7.3','v22.21.1','v23.11.1','v24.6.99','v25.0.0','v26.12.99','v27.0.0','bad','v24.7.0-rc.1','v26.13.0-rc.1','v26.13']) {
    assert.equal(runtimeReport({nodeVersion,npmVersion:'11.18.0',platform:'linux',arch:'x64'}).nodeSupported, false, nodeVersion);
  }
  for (const nodeVersion of ['v24.7.0','v24.20.1','v26.13.0','v26.13.1','v26.20.0']) {
    const report = runtimeReport({nodeVersion,npmVersion:'11.18.0',platform:'darwin',arch:'arm64'});
    assert.equal(report.nodeSupported, true);
    assert.equal(report.npmSupported, true);
  }
});
test('package engines, lockfile and runtime guard accept the same stable Node versions', () => {
  const root = JSON.parse(readFileSync(new URL('../../package.json', import.meta.url), 'utf8'));
  const lock = JSON.parse(readFileSync(new URL('../../package-lock.json', import.meta.url), 'utf8'));
  assert.deepEqual(root.engines, lock.packages[''].engines);
  // Reuse npm tooling's existing semver dependency; no new runtime dependency.
  const {satisfies} = createRequire(import.meta.url)('semver');
  for (const major of [20,22,24,25,26,27,28]) {
    for (const minor of [0,6,7,12,13,20]) {
      const version = `${major}.${minor}.0`;
      const report = runtimeReport({nodeVersion:version,npmVersion:'11.20.0',platform:'darwin',arch:'arm64'});
      assert.equal(report.nodeSupported, satisfies(version, root.engines.node), version);
      assert.equal(report.npmSupported, true);
      assert.ok(report.supported.includes(root.engines.node));
    }
  }
});
test('npm policy treats direct Node invocation as unknown, not fabricated npm validation', () => {
  assert.equal(npmFromUserAgent('npm/11.18.0 node/v24.7.0 darwin arm64'), '11.18.0');
  assert.equal(npmFromUserAgent(undefined), undefined);
  for (const npmVersion of ['9.0.0','10.9.0','12.0.0','bad']) assert.equal(runtimeReport({nodeVersion:'v24.7.0',npmVersion,platform:'win32',arch:'x64'}).npmSupported, false);
  assert.equal(runtimeReport({nodeVersion:'v24.7.0',platform:'win32',arch:'x64'}).npmSupported, null);
  assert.deepEqual(parseArgs(['doctor']), {command:'doctor'});
});
