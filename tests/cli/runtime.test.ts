import {test} from 'node:test';
import assert from 'node:assert/strict';
import {runtimeReport, npmFromUserAgent} from '../../bin/runtime.mjs';
import {parseArgs} from '../../scripts/cli/args.ts';

test('runtime policy rejects EOL/unverified majors and older24 without claiming compatibility', () => {
  for (const nodeVersion of ['v20.20.0','v21.7.3','v22.21.1','v23.11.1','v24.6.0','v25.0.0','v26.13.0','bad','v24.7.0-rc.1']) {
    assert.equal(runtimeReport({nodeVersion,npmVersion:'11.18.0',platform:'linux',arch:'x64'}).nodeSupported, false, nodeVersion);
  }
  for (const nodeVersion of ['v24.7.0','v24.20.1']) {
    const report = runtimeReport({nodeVersion,npmVersion:'11.18.0',platform:'darwin',arch:'arm64'});
    assert.equal(report.nodeSupported, true);
    assert.equal(report.npmSupported, true);
  }
});
test('npm policy treats direct Node invocation as unknown, not fabricated npm validation', () => {
  assert.equal(npmFromUserAgent('npm/11.18.0 node/v24.7.0 darwin arm64'), '11.18.0');
  assert.equal(npmFromUserAgent(undefined), undefined);
  for (const npmVersion of ['9.0.0','10.9.0','12.0.0','bad']) assert.equal(runtimeReport({nodeVersion:'v24.7.0',npmVersion,platform:'win32',arch:'x64'}).npmSupported, false);
  assert.equal(runtimeReport({nodeVersion:'v24.7.0',platform:'win32',arch:'x64'}).npmSupported, null);
  assert.deepEqual(parseArgs(['doctor']), {command:'doctor'});
});
