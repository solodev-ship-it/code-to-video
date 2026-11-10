import assert from 'node:assert/strict';
import test from 'node:test';
import {createThemeRegistry, resolveTheme, validateBrand, validateVisualStyle, validateMotionPreset, validateSceneOverrides, validateThemeSelection, frameworkDefaults, secondsToFrames, motionProgress, colorWithOpacity} from './index.ts';
import {auroraFinance, emberStudio, cinematic, minimal, elegant, energetic} from './presets.ts';
import {verdantHealth} from '../../../examples/themes/verdant.ts';
import type {BrandIdentity} from './types.ts';

const selection = {schemaVersion: 1, brandId: 'aurora-finance', styleId: 'cinematic', motionId: 'elegant'} as const;
function registry() {
  const r = createThemeRegistry();
  r.registerBrand(auroraFinance);
  r.registerBrand(emberStudio);
  r.registerVisualStyle(cinematic);
  r.registerVisualStyle(minimal);
  r.registerMotionPreset(elegant);
  r.registerMotionPreset(energetic);
  return r;
}

test('explicit registration and ID lookups succeed without global state', () => {
  const r = registry();
  assert.equal(r.getBrand('aurora-finance').displayName, 'Aurora Finance');
  assert.equal(r.getVisualStyle('minimal').id, 'minimal');
  assert.equal(r.getMotionPreset('energetic').id, 'energetic');
  assert.throws(() => createThemeRegistry().getBrand('aurora-finance'), /Unknown brand ID/);
});

test('duplicate brand, style, and motion IDs are rejected without replacing entries', () => {
  const r = registry();
  assert.throws(() => r.registerBrand({...auroraFinance, displayName: 'Replacement'}), /Duplicate brand ID: aurora-finance/);
  assert.throws(() => r.registerVisualStyle(cinematic), /Duplicate visual style ID: cinematic/);
  assert.throws(() => r.registerMotionPreset(elegant), /Duplicate motion preset ID: elegant/);
  assert.equal(r.getBrand('aurora-finance').displayName, 'Aurora Finance');
});

for (const [key, message] of [['brandId', 'brand'], ['styleId', 'visual style'], ['motionId', 'motion preset']] as const) {
  test(`unknown ${key} fails instead of using defaults`, () => {
    assert.throws(() => resolveTheme(registry(), {...selection, [key]: 'missing'}), new RegExp(`Unknown ${message} ID: missing`));
  });
}

test('missing identifiers and unsupported versions fail clearly', () => {
  assert.throws(() => validateThemeSelection({schemaVersion: 1}), /selection.brandId/);
  assert.throws(() => validateThemeSelection({...selection, schemaVersion: 2}), /unsupported schemaVersion/);
  assert.throws(() => validateBrand({...auroraFinance, schemaVersion: 2}), /brand.schemaVersion/);
  assert.throws(() => validateVisualStyle({...minimal, schemaVersion: 0}), /style.schemaVersion/);
  assert.throws(() => validateMotionPreset({...elegant, schemaVersion: 3}), /motion.schemaVersion/);
  assert.throws(() => validateBrand({...auroraFinance, id: '../brand'}), /kebab-case ID/);
  assert.throws(() => validateBrand({...auroraFinance, displayName: ''}), /nonempty string/);
});

test('complete resolution has versioned IDs, colors, typography, styles, and motion', () => {
  const t = resolveTheme(registry(), selection);
  assert.equal(t.schemaVersion, 1);
  assert.equal(t.brandName, 'Aurora Finance');
  assert.equal(t.colors.accent, auroraFinance.colors.accent);
  assert.equal(t.typography.titleSize, frameworkDefaults.typography.titleSize);
  assert.equal(t.gradient.enabled, true);
  assert.equal(t.motion.easing, 'ease-in-out-cubic');
});

test('omitted optional token groups receive complete safe framework defaults', () => {
  const r = createThemeRegistry();
  r.registerBrand({schemaVersion: 1, id: 'simple', displayName: 'Simple', colors: {...auroraFinance.colors}});
  r.registerVisualStyle({schemaVersion: 1, id: 'plain', displayName: 'Plain'});
  r.registerMotionPreset({schemaVersion: 1, id: 'steady', displayName: 'Steady'});
  const t = resolveTheme(r, {...selection, brandId: 'simple', styleId: 'plain', motionId: 'steady'});
  assert.deepEqual(t.typography, frameworkDefaults.typography);
  assert.deepEqual(t.motion, frameworkDefaults.motion);
  assert.deepEqual(t.surface, frameworkDefaults.style.surface);
});

test('rejects invalid color formats and accepts only documented hex forms', () => {
  for (const accent of ['red', '#12', '#12345', '#gggggg', 'url(secret)', 'rgb(0,0,0)']) {
    assert.throws(() => validateBrand({...auroraFinance, colors: {...auroraFinance.colors, accent}}), /brand.colors.accent: expected a hex color/);
  }
  for (const accent of ['#abc', '#abcd', '#AABBCC', '#AABBCCDD']) {
    assert.equal(validateBrand({...auroraFinance, colors: {...auroraFinance.colors, accent}}).colors.accent, accent);
  }
});

test('color alpha helper preserves short/long alpha and rejects unsafe input', () => {
  assert.equal(colorWithOpacity('#fff', 0.5), 'rgba(255, 255, 255, 0.5)');
  assert.equal(colorWithOpacity('#0000', 1), 'rgba(0, 0, 0, 0)');
  assert.equal(colorWithOpacity('#112233ff', 0), 'rgba(17, 34, 51, 0)');
  assert.throws(() => colorWithOpacity('red', 1), /validated hex/);
  assert.throws(() => colorWithOpacity('#fff', 2), /opacity/);
});

for (const overrides of [
  {radii: {card: -1}}, {surface: {opacity: 1.1}}, {border: {width: -1}},
  {shadow: {blur: 161}}, {gradient: {angle: 361}}, {spacing: {page: 0}},
  {layout: {contentWidth: 2000}}, {effects: {glowOpacity: -0.1}},
  {typography: {titleSize: 0}}, {motion: {durationSeconds: 0}},
  {motion: {spring: {damping: -1}}}, {motion: {staggerSeconds: 3}},
]) {
  test(`numeric range validation: ${JSON.stringify(overrides)}`, () => {
    assert.throws(() => validateSceneOverrides(overrides), /expected a finite number in/);
  });
}

test('easing, roles, unknown keys, and cross-owner properties are validated', () => {
  assert.throws(() => validateSceneOverrides({surface: {color: 'unknown'}}), /expected one of/);
  assert.throws(() => validateMotionPreset({...elegant, tokens: {easing: 'elastic'}}), /expected one of/);
  assert.throws(() => validateSceneOverrides({radii: {mystery: 2}}), /unknown property/);
  assert.throws(() => validateVisualStyle({...minimal, colors: {}}), /unknown property/);
  assert.throws(() => validateMotionPreset({...elegant, colors: {}}), /unknown property/);
});

test('explicit precedence: defaults → style → brand → motion → scene', () => {
  const r = registry();
  r.registerVisualStyle({...minimal, id: 'colored', defaultColors: {accent: '#000'}, tokens: {radii: {card: 20}}});
  const base = resolveTheme(r, {...selection, styleId: 'colored'});
  assert.equal(base.colors.accent, auroraFinance.colors.accent); // Brand beats style default color.
  assert.equal(base.radii.card, 20);
  assert.equal(base.motion.durationSeconds, elegant.tokens.durationSeconds);
  const t = resolveTheme(r, {...selection, styleId: 'colored', overrides: {
    colors: {accent: '#123456'}, typography: {titleSize: 100}, radii: {card: 8},
    motion: {durationSeconds: 0.8, spring: {mass: 2}},
  }});
  assert.equal(t.colors.accent, '#123456');
  assert.equal(t.colors.background, auroraFinance.colors.background);
  assert.equal(t.typography.titleSize, 100);
  assert.equal(t.radii.card, 8);
  assert.equal(t.radii.badge, frameworkDefaults.style.radii.badge);
  assert.equal(t.motion.durationSeconds, 0.8);
  assert.equal(t.motion.spring.mass, 2);
  assert.equal(t.motion.spring.damping, elegant.tokens.spring.damping);
});

test('registration clones input, resolution is deeply frozen and isolated', () => {
  const r = createThemeRegistry();
  const source: BrandIdentity = structuredClone(auroraFinance);
  r.registerBrand(source);
  source.colors.accent = '#000000';
  source.metadata = {category: 'changed'};
  r.registerVisualStyle(cinematic);
  r.registerMotionPreset(elegant);
  const overrides = {colors: {accent: '#111111'}};
  const a = resolveTheme(r, {...selection, overrides});
  overrides.colors.accent = '#222222';
  const b = resolveTheme(r, selection);
  assert.equal(a.colors.accent, '#111111');
  assert.equal(b.colors.accent, auroraFinance.colors.accent);
  assert.equal(b.metadata?.category, 'financial-documentary');
  assert.notEqual(a.colors, b.colors);
  assert.notEqual(a.motion.spring, b.motion.spring);
  assert.notEqual(a.metadata, b.metadata);
  assert(Object.isFrozen(a) && Object.isFrozen(a.motion.spring) && Object.isFrozen(a.metadata));
  assert.equal(Reflect.set(a.colors, 'accent', '#fff'), false);
  assert.equal(Reflect.set(r.getBrand('aurora-finance').colors, 'accent', '#fff'), false);
  assert.equal(b.colors.accent, auroraFinance.colors.accent);
});

test('sealed registry rejects further registration', () => {
  const r = registry();
  r.seal();
  assert.throws(() => r.registerBrand(verdantHealth), /registry is sealed/);
});

test('configurations and resolved themes survive JSON round trips', () => {
  const r = registry();
  const t = resolveTheme(r, selection);
  assert.deepEqual(JSON.parse(JSON.stringify(t)), t);
  assert.deepEqual(validateBrand(JSON.parse(JSON.stringify(auroraFinance))), auroraFinance);
  assert.deepEqual(validateVisualStyle(JSON.parse(JSON.stringify(cinematic))), cinematic);
  assert.deepEqual(validateMotionPreset(JSON.parse(JSON.stringify(elegant))), elegant);
  assert.deepEqual(resolveTheme(r, JSON.parse(JSON.stringify(selection))), t);
});

test('non-JSON configurations fail instead of silently dropping data', () => {
  for (const invalid of [undefined, () => 1, new Date(), NaN, Infinity, BigInt(1)]) {
    assert.throws(() => validateBrand({...auroraFinance, metadata: {invalid}}), /JSON|plain object/);
  }
  const cycle: Record<string, unknown> = {};
  cycle.self = cycle;
  assert.throws(() => validateBrand({...auroraFinance, metadata: cycle}), /cyclic/);
  assert.throws(() => validateBrand({...auroraFinance, metadata: JSON.parse('{"__proto__":{}}')}), /unsafe/);
  assert.throws(() => validateBrand({...auroraFinance, metadata: {[Symbol('secret')]: true}}), /symbol/);
  assert.throws(() => validateBrand({...auroraFinance, metadata: {get value() {throw new Error('getter ran');}}}), /enumerable data property/);
  const sparse = [1, , 3];
  assert.throws(() => validateBrand({...auroraFinance, metadata: {sparse}}), /dense JSON array/);
  class ArrayWithHook extends Array {toJSON() {throw new Error('toJSON ran');}}
  assert.throws(() => validateBrand({...auroraFinance, metadata: {array: new ArrayWithHook()}}), /plain JSON array/);
});

test('motion tokens and evaluation remain deterministic across FPS and evaluation order', () => {
  const r = registry();
  const a = resolveTheme(r, selection);
  const b = resolveTheme(r, selection);
  assert.deepEqual(a.motion, b.motion);
  assert.equal(secondsToFrames(0.55, 30), 17);
  assert.equal(secondsToFrames(0, 60), 0);
  assert.equal(motionProgress(0, 30, a.motion), 0);
  assert.equal(motionProgress(179, 30, a.motion), 1);
  const first = motionProgress(20, 30, a.motion, 1);
  for (const frame of [179, 0, 90, 1]) motionProgress(frame, 30, a.motion, 1);
  assert.equal(motionProgress(20, 30, b.motion, 1), first);
  assert.equal(motionProgress(60, 30, a.motion), motionProgress(120, 60, a.motion));
  assert.throws(() => secondsToFrames(-1, 30), /nonnegative/);
  assert.throws(() => secondsToFrames(1, 0), /positive/);
  assert.throws(() => motionProgress(NaN, 30, a.motion), /finite frame/);
  assert.notEqual(a.motion.durationSeconds, resolveTheme(r, {...selection, motionId: 'energetic'}).motion.durationSeconds);
});

test('different brands resolve different tokens independently of style', () => {
  const r = registry();
  const a = resolveTheme(r, selection);
  const b = resolveTheme(r, {...selection, brandId: 'ember-studio'});
  assert.notDeepEqual(a.colors, b.colors);
  assert.notEqual(a.typography.headingFontFamily, b.typography.headingFontFamily);
  assert.deepEqual(a.surface, b.surface);
});

test('different styles resolve different surfaces independently of brand', () => {
  const r = registry();
  const a = resolveTheme(r, selection);
  const b = resolveTheme(r, {...selection, styleId: 'minimal'});
  assert.notDeepEqual(a.surface, b.surface);
  assert.notDeepEqual(a.shadow, b.shadow);
  assert.notDeepEqual(a.gradient, b.gradient);
  assert.notDeepEqual(a.radii, b.radii);
  assert.deepEqual(a.colors, b.colors);
});

test('third-brand example and independently added style/motion require no resolver edits', () => {
  const r = registry();
  r.registerBrand(verdantHealth);
  r.registerVisualStyle({schemaVersion: 1, id: 'paper', displayName: 'Paper', tokens: {radii: {card: 4}, surface: {color: 'background'}, border: {width: 3}}});
  r.registerMotionPreset({schemaVersion: 1, id: 'calm', displayName: 'Calm', tokens: {durationSeconds: 1.5, intensity: 0.4}});
  const t = resolveTheme(r, {...selection, brandId: 'verdant-health', styleId: 'paper', motionId: 'calm'});
  assert.equal(t.brandName, 'Verdant Health');
  assert.equal(t.radii.card, 4);
  assert.equal(t.motion.durationSeconds, 1.5);
  assert.equal(t.colors.primary, verdantHealth.colors.primary);
});
