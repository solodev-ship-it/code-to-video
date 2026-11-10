import assert from 'node:assert/strict';
import test from 'node:test';
import {validateIslandShowcaseProps} from './island-props.ts';
const base = {schemaVersion: 1, brandId: 'aurora-finance', styleId: 'cinematic', motionId: 'elegant'};
test('island showcase metadata keeps optional defaults and supports Ember without scene duplication', () => {
  assert.equal(validateIslandShowcaseProps(base).fixture, 'showcase'); assert.equal(validateIslandShowcaseProps(base).diagnostics, false);
  assert.equal(validateIslandShowcaseProps({...base, brandId: 'ember-studio', styleId: 'minimal'}).brandId, 'ember-studio');
});
test('island showcase metadata rejects invalid selectors, fixtures, flags and getters', () => {
  for (const value of [{...base, brandId: 'unknown'}, {...base, fixture: 'os-widget'}, {...base, diagnostics: 'true'}, {...base, interval: 2}]) assert.throws(() => validateIslandShowcaseProps(value));
  assert.throws(() => validateIslandShowcaseProps(Object.defineProperty({...base}, 'fixture', {get() {throw new Error('must not invoke');}})), /fixture/);
});
