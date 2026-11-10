import {resolveTheme} from '../../themes/src/index.ts';
import type {ThemeRegistry} from '../../themes/src/index.ts';

export type Json = null | boolean | number | string | readonly Json[] | {readonly [key: string]: Json};
export type ProjectManifest = Readonly<{
  schemaVersion: 1; id: string; title: string;
  framework: Readonly<{name: 'code-to-video'; version: string}>;
  width: number; height: number; fps: number;
  theme: Readonly<{brandId: string; styleId: string; motionId: string}>;
  assets: readonly Readonly<{id: string; path: string; type: 'image' | 'video' | 'audio' | 'font'}>[];
  compositions: readonly Readonly<{id: string; durationInFrames: number; props: Readonly<Record<string, Json>>}>[];
}>;
function fail(field: string, rule: string): never {throw new Error(`${field}: ${rule}`);}
function record(value: unknown, field: string): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value) || ![Object.prototype, null].includes(Object.getPrototypeOf(value))) fail(field, 'must be a plain object');
  if (Object.getOwnPropertySymbols(value).length || Object.values(Object.getOwnPropertyDescriptors(value)).some(d => !('value' in d))) fail(field, 'symbol keys and accessors are not JSON data');
  return value as Record<string, unknown>;
}
function keys(value: Record<string, unknown>, allowed: string[], field: string) {
  for (const key of Object.keys(value)) if (!allowed.includes(key)) fail(`${field}.${key}`, 'unknown field');
  for (const key of allowed) if (!Object.hasOwn(value, key)) fail(`${field}.${key}`, 'required');
}
function id(value: unknown, field: string): string {
  if (typeof value !== 'string' || !/^[A-Za-z][A-Za-z0-9-]*$/.test(value)) fail(field, 'must start with a letter; only letters, digits and hyphens allowed');
  return value;
}
function integer(value: unknown, field: string): number {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value <= 0) fail(field, 'must be a positive safe integer');
  return value;
}
export function validateProjectPath(value: unknown, field: string): string {
  if (typeof value !== 'string' || !/^[a-zA-Z0-9_/-]+\.[a-zA-Z0-9]+$/.test(value) || value.startsWith('/') || value.split('/').some(p => p === '..' || p === '.' || p === '')) fail(field, 'must be a safe relative file path without traversal, schemes or queries');
  return value;
}
function json(value: unknown, field: string, ancestors = new Set<object>()): Json {
  if (value === null || typeof value === 'boolean') return value;
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string') {
    if (/(?:[a-z][a-z0-9+.-]*:\/\/|^(?:data|javascript|file):)/i.test(value)) fail(field, 'URLs and executable schemes are not allowed');
    return value; // Text stays inert data; never evaluated as source.
  }
  if (typeof value !== 'object' || !value) fail(field, 'must be finite JSON data');
  if (ancestors.size >= 32) fail(field, 'maximum JSON nesting is 32');
  if (Array.isArray(value) && (Object.keys(value).length !== value.length || Object.getOwnPropertySymbols(value).length)) fail(field, 'must be a dense JSON array');
  if (ancestors.has(value)) fail(field, 'cyclic data is not allowed');
  ancestors.add(value);
  let result: Json;
  if (Array.isArray(value)) result = Object.freeze(value.map((v, i) => json(v, `${field}[${i}]`, ancestors)));
  else result = Object.freeze(Object.fromEntries(Object.entries(record(value, field)).map(([k,v]) => {
    if (['__proto__', 'constructor', 'prototype'].includes(k)) fail(`${field}.${k}`, 'reserved key');
    return [k, json(v, `${field}.${k}`, ancestors)];
  })));
  ancestors.delete(value);
  return result;
}
export function validateProjectManifest(input: unknown, registry: ThemeRegistry, frameworkVersion = '0.1.0'): ProjectManifest {
  const p = record(input, 'project');
  keys(p, ['schemaVersion','id','title','framework','width','height','fps','theme','assets','compositions'], 'project');
  if (p.schemaVersion !== 1) fail('schemaVersion', 'unsupported version; expected 1 (no migration)');
  id(p.id, 'id');
  if (typeof p.title !== 'string' || !p.title.trim()) fail('title', 'must be nonempty text');
  const f = record(p.framework, 'framework'); keys(f, ['name','version'], 'framework');
  if (f.name !== 'code-to-video') fail('framework.name', 'must equal code-to-video');
  if (typeof f.version !== 'string' || !/^0\.1\.\d+$/.test(f.version) || !/^0\.1\.\d+$/.test(frameworkVersion)) fail('framework.version', `must be compatible with ${frameworkVersion} (0.1.x)`);
  for (const k of ['width','height','fps']) integer(p[k], k);
  if (Number(p.width) % 2 || Number(p.height) % 2) fail('width/height', 'must be even for H.264');
  const t = record(p.theme, 'theme'); keys(t, ['brandId','styleId','motionId'], 'theme');
  for (const k of Object.keys(t)) id(t[k], `theme.${k}`);
  try {resolveTheme(registry, {schemaVersion: 1, brandId: t.brandId as string, styleId: t.styleId as string, motionId: t.motionId as string});}
  catch (error) {fail('theme', String(error));}
  for (const kind of ['assets','compositions'] as const) {
    if (!Array.isArray(p[kind]) || (kind === 'compositions' && p[kind].length === 0)) fail(kind, 'must be an array (compositions must be nonempty)');
    const ids = new Set<string>();
    (p[kind] as unknown[]).forEach((value, i) => {
      const field = `${kind}[${i}]`; const item = record(value, field);
      keys(item, kind === 'assets' ? ['id','path','type'] : ['id','durationInFrames','props'], field);
      const itemId = id(item.id, `${field}.id`);
      if (ids.has(itemId)) fail(`${field}.id`, 'duplicate id'); ids.add(itemId);
      if (kind === 'assets') {
        const assetPath = validateProjectPath(item.path, `${field}.path`);
        if (!assetPath.startsWith('assets/')) fail(`${field}.path`, 'must be under assets/');
        if (!['image','video','audio','font'].includes(String(item.type))) fail(`${field}.type`, 'expected image, video, audio or font');
      } else {
        integer(item.durationInFrames, `${field}.durationInFrames`);
        const props = record(item.props, `${field}.props`);
        for (const k of ['assets','brandId','styleId','motionId']) if (Object.hasOwn(props,k)) fail(`${field}.props.${k}`, 'reserved project input');
      }
    });
  }
  return json(p, 'project') as ProjectManifest;
}
