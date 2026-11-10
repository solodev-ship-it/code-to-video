import assert from 'node:assert/strict';
import test from 'node:test';
import {assertRequiredFonts, createLocalFontLoader, validateFontManifest} from './fonts.ts';
import type {FontEnvironment, FontFaceLike, LocalFontDefinition} from './fonts.ts';

const face: LocalFontDefinition = {family: 'Test Face', src: '/fonts/test.woff2', weight: 400, style: 'normal',
  license: {name: 'Test fixture metadata', source: 'fixture', redistributionApproved: true}};
test('versioned manifest is immutable and rejects invalid IDs, versions, duplicate faces and remote URLs', () => {
  const valid = validateFontManifest({schemaVersion: 1, faces: [{...face, id: 'test-regular'}]});
  assert(Object.isFrozen(valid.faces[0]?.license));
  for (const input of [{schemaVersion: 2, faces: []}, {schemaVersion: 1, faces: [{...face, id: '../bad'}]},
    {schemaVersion: 1, faces: [{...face, id: 'a'}, {...face, id: 'b'}]},
    {schemaVersion: 1, faces: [{...face, id: 'a', src: 'https://remote/font.ttf'}]}]) assert.throws(() => validateFontManifest(input));
});
test('requirements match exact family, weight, and style; multiple weights are allowed', () => {
  const bold = {...face, weight: 700};
  assertRequiredFonts([face, bold], [face, bold]);
  assert.throws(() => assertRequiredFonts([face], [bold]), /Missing required font face/);
  assert.throws(() => assertRequiredFonts([face], [{...face, style: 'italic'}]), /Missing required font face/);
  assert.throws(() => assertRequiredFonts([face], [{...face, family: 'Other'}]), /Missing required font face/);
});
test('loader deduplicates concurrent and completed requests within its explicit lifecycle', async () => {
  let loads = 0; const ready = new Set<string>();
  const environment: FontEnvironment = {createFace: (font) => {const loaded = {load: async () => {loads++; ready.add(String(font.weight)); return loaded;}}; return loaded;},
    addFace: () => {}, isFaceReady: (font) => ready.has(String(font.weight))};
  const loader = createLocalFontLoader({environment});
  await Promise.all([loader.load([face]), loader.load([face])]);
  await loader.load([face]);
  assert.equal(loads, 1); assert(loader.isReady(face));
  await loader.load([{...face, weight: 700}]); assert.equal(loads, 2);
  loader.clear(); assert.equal(loader.isReady(face), false);
});
test('failed and timed-out requests are evicted and retryable, without late registration', async () => {
  let fail = true; let added = 0;
  const loader = createLocalFontLoader({environment: {createFace: () => {const loaded = {load: async () => {if (fail) throw new Error('missing asset'); return loaded;}}; return loaded;}, addFace: () => {added++;}}});
  await assert.rejects(loader.load([face]), /missing asset/);
  fail = false; await loader.load([face]); assert.equal(added, 1);
  let finish: (() => void) | undefined;
  const delayed: FontFaceLike = {load: () => new Promise((resolve) => {finish = () => resolve(delayed);})};
  const timed = createLocalFontLoader({timeoutMs: 5, environment: {createFace: () => delayed, addFace: () => {added++;}}});
  await assert.rejects(timed.load([face]), /timed out/);
  assert.equal(timed.isReady(face), false); assert.equal(added, 1); assert(finish);
  finish(); await Promise.resolve(); await Promise.resolve(); assert.equal(added, 1, 'Late completion must not install a timed-out face.');
});
test('explicit readiness failure is not hidden by a fulfilled load promise', async () => {
  const loaded = {load: async () => loaded};
  const loader = createLocalFontLoader({environment: {createFace: () => loaded, addFace: () => {}, isFaceReady: () => false}});
  await assert.rejects(loader.load([face]), /exact family\/weight\/style/);
});
