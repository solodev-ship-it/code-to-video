import assert from 'node:assert/strict';
import test from 'node:test';
import {validateClayShowcaseProps} from './clay-props.ts';
const selection = {schemaVersion: 1, brandId: 'aurora-finance', styleId: 'cinematic', motionId: 'elegant', reducedMotion: false};
test('clay showcase props preserve theme selection and explicit fixture defaults', () => {
  assert.equal(validateClayShowcaseProps(selection).fixture, 'showcase');
  assert.equal(validateClayShowcaseProps({...selection, brandId: 'ember-studio', styleId: 'minimal', fixture: 'flat'}).fixture, 'flat');
});
test('clay showcase metadata rejects invalid fixtures and unknown theme fields', () => {
  assert.throws(() => validateClayShowcaseProps({...selection, fixture: 'unknown'}), /fixture/);
  assert.throws(() => validateClayShowcaseProps({...selection, extra: true}), /unknown|extra/i);
  assert.throws(() => validateClayShowcaseProps(Object.defineProperty({...selection}, 'fixture', {enumerable: true, get() {throw Error('executed');}})), /fixture/);
});
