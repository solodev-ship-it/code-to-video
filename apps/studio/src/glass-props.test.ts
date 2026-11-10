import assert from 'node:assert/strict';
import test from 'node:test';
import {validateGlassProps} from './glass-props.ts';
const selection = {schemaVersion: 1, brandId: 'aurora-finance', styleId: 'cinematic', motionId: 'elegant'};
test('glass showcase props preserve validated theme selection and optional defaults', () => {
  const p = validateGlassProps(selection); assert.equal(p.fixture, 'showcase'); assert.equal(p.background, 'dark'); assert.equal(p.diagnostics, false);
  assert.equal(validateGlassProps({...selection, brandId: 'ember-studio', styleId: 'minimal', reducedMotion: true}).reducedMotion, true);
});
test('glass metadata rejects bad selectors, fixture values, unknown keys and accessors', () => {
  for (const extra of [{fixture: 'invented'}, {background: 'remote'}, {diagnostics: 'true'}, {url: 'remote'}, {brandId: 'unknown'}, {reducedMotion: 'yes'}]) assert.throws(() => validateGlassProps({...selection, ...extra}));
  assert.throws(() => validateGlassProps(Object.defineProperty({...selection}, 'fixture', {get() {throw new Error('do not invoke');}})), /fixture/);
});
