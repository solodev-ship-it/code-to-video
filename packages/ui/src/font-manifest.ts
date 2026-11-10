import {validateLocalFonts} from './font-loading.ts';
import type {LocalFontDefinition} from './font-loading.ts';

export interface FontRequirement {family: string; weight: number; style: 'normal' | 'italic'}
export type RegisteredFontFace = LocalFontDefinition & {
  id: string;
  licenseId?: string;
  licenseDocumentation?: string;
  attribution?: string;
};
export interface FontManifest {schemaVersion: 1; faces: readonly RegisteredFontFace[]}
export const fontIdentity = (face: FontRequirement): string => `${face.family.trim().toLowerCase()}/${face.weight}/${face.style}`;

function assertJson(value: unknown, ancestors = new Set<object>(), depth = 0): void {
  if (depth > 32) throw new Error('Font manifest exceeds maximum JSON depth.');
  if (value === null || typeof value === 'string' || typeof value === 'boolean' || (typeof value === 'number' && Number.isFinite(value))) return;
  if (!value || typeof value !== 'object' || ancestors.has(value)) throw new Error('Font manifest must contain finite acyclic JSON data.');
  if ((!Array.isArray(value) && Object.getPrototypeOf(value) !== Object.prototype) || Object.getOwnPropertySymbols(value).length) throw new Error('Font manifest requires plain JSON objects.');
  ancestors.add(value);
  for (const [key, descriptor] of Object.entries(Object.getOwnPropertyDescriptors(value))) {
    if (Array.isArray(value) && key === 'length') continue;
    if (!descriptor.enumerable || !('value' in descriptor) || ['__proto__', 'constructor', 'prototype'].includes(key)) throw new Error('Unsafe font manifest property.');
    assertJson(descriptor.value, ancestors, depth + 1);
  }
  if (Array.isArray(value) && Object.keys(value).some((key, i) => key !== String(i))) throw new Error('Font manifest arrays must be dense.');
  if (Array.isArray(value) && Object.keys(value).length !== value.length) throw new Error('Font manifest arrays must be dense.');
  ancestors.delete(value);
}

export function validateFontManifest(input: unknown): FontManifest {
  assertJson(input);
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Font manifest must be an object.');
  const manifest = input as Record<string, unknown>;
  if (manifest.schemaVersion !== 1 || !Array.isArray(manifest.faces)) throw new Error('Font manifest requires schemaVersion 1 and faces array.');
  for (const key of Object.keys(manifest)) if (!['schemaVersion', 'faces'].includes(key)) throw new Error(`Unknown font manifest field: ${key}`);
  const ids = new Set<string>();
  const identities = new Set<string>();
  const faces = manifest.faces.map((value: unknown): RegisteredFontFace => {
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Font face must be an object.');
    const face = value as Record<string, unknown>;
    for (const key of Object.keys(face)) if (!['id', 'family', 'src', 'weight', 'style', 'license', 'licenseId', 'licenseDocumentation', 'attribution'].includes(key)) throw new Error(`Unknown font face field: ${key}`);
    if (typeof face.id !== 'string' || !/^[a-z][a-z0-9-]{0,79}$/.test(face.id)) throw new Error('Font face requires a stable lowercase ID.');
    if (ids.has(face.id)) throw new Error(`Duplicate font ID: ${face.id}`);
    ids.add(face.id);
    const parsed = validateLocalFonts([face as unknown as LocalFontDefinition])[0]!;
    if (identities.has(fontIdentity(parsed))) throw new Error(`Duplicate font face definition: ${fontIdentity(parsed)}`);
    identities.add(fontIdentity(parsed));
    const result: RegisteredFontFace = {...parsed, id: face.id};
    for (const key of ['licenseId', 'licenseDocumentation', 'attribution'] as const) {
      if (face[key] !== undefined) {
        if (typeof face[key] !== 'string' || !face[key].trim()) throw new Error(`Font ${face.id}: invalid ${key}`);
        result[key] = face[key];
      }
    }
    Object.freeze(result.license);
    return Object.freeze(result);
  });
  validateLocalFonts(faces); // Duplicate family/weight/style detection, independent of IDs.
  return Object.freeze({schemaVersion: 1, faces: Object.freeze(faces)});
}

export function assertRequiredFonts(faces: readonly LocalFontDefinition[], required: readonly FontRequirement[]): void {
  const available = new Set(faces.map(fontIdentity));
  for (const face of required) {
    if (!face.family || !Number.isInteger(face.weight) || !['normal', 'italic'].includes(face.style) || !available.has(fontIdentity(face))) {
      throw new Error(`Missing required font face: ${face.family} (${face.weight} ${face.style})`);
    }
  }
}
