import assert from 'node:assert/strict';
import test from 'node:test';
import {loadLocalFonts, validateLocalFonts} from './fonts.ts';
import type {FontEnvironment, LocalFontDefinition} from './fonts.ts';

// Metadata only: no actual font is downloaded, redistributed, or claimed licensed.
const font: LocalFontDefinition = {family: 'Test Face', src: '/fonts/test.woff2', weight: 400, style: 'normal',
  license: {name: 'Test-only attestation', source: 'fixture://license-review', redistributionApproved: true}};
test('font metadata validates and copies explicit human license approval', () => {
  const result = validateLocalFonts([font]);
  assert.deepEqual(result, [font]);
  assert.notEqual(result[0], font);
  assert.notEqual(result[0]?.license, font.license);
});
test('remote paths, traversal, missing approval, invalid faces, and duplicates fail', () => {
  for (const src of ['https://remote/font.woff2', '//remote/font.woff2', '../font.ttf', '/fonts/../font.ttf', '/fonts/a.woff2?url=remote']) {
    assert.throws(() => validateLocalFonts([{...font, src}]), /same-origin/);
  }
  assert.throws(() => validateLocalFonts([{...font, license: {...font.license, name: ''}}]), /license/);
  assert.throws(() => validateLocalFonts([{...font, weight: 99}]), /weight/);
  assert.throws(() => validateLocalFonts([font, font]), /duplicate/);
});
test('all loads complete before faces are installed; no global cache is used', async () => {
  const events: string[] = [];
  const environment: FontEnvironment = {
    createFace: () => {const face = {load: async () => {events.push('loaded'); return face;}}; return face;},
    addFace: () => {events.push('added');},
  };
  await loadLocalFonts([font, {...font, weight: 700}], environment);
  assert.deepEqual(events, ['loaded', 'loaded', 'added', 'added']);
});
test('font failures are actionable and install no partial result', async () => {
  let installed = false;
  const environment: FontEnvironment = {
    createFace: () => ({load: async () => {throw new Error('missing');}}),
    addFace: () => {installed = true;},
  };
  await assert.rejects(loadLocalFonts([font], environment), /Unable to load local font: Test Face/);
  assert.equal(installed, false);
});
test('empty font set needs no browser; nonempty set fails clearly outside a browser', async () => {
  await loadLocalFonts([]);
  await assert.rejects(loadLocalFonts([font]), /browser with the FontFace API/);
});
