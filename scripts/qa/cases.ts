import {createHash} from 'node:crypto';
export interface VisualCase {
  schemaVersion: 1;
  id: string;
  compositionId: string;
  frame: number;
  width: number;
  height: number;
  fps: number;
  brandId: string | null;
  styleId: string | null;
  fontPolicy: 'required-local' | 'system-compatible';
  props: Record<string, unknown>;
}
export function canonical(value: unknown): string {
  const ancestors = new Set<object>();
  function sorted(input: unknown): unknown {
    if (input === null || typeof input === 'string' || typeof input === 'boolean') return input;
    if (typeof input === 'number' && Number.isFinite(input)) return input;
    if (typeof input !== 'object' || input === null || ancestors.has(input)) throw new Error('Case props must be finite, acyclic JSON data.');
    if (Object.getOwnPropertySymbols(input).length) throw new Error('Case props cannot contain symbol keys.');
    if (!Array.isArray(input) && Object.getPrototypeOf(input) !== Object.prototype) throw new Error('Case props must be plain JSON objects.');
    ancestors.add(input);
    let output: unknown;
    if (Array.isArray(input)) {
      if (Object.keys(input).length !== input.length) throw new Error('Sparse case arrays are invalid.');
      output = input.map(sorted);
    } else {
      output = Object.fromEntries(Object.keys(input).sort().map((key) => {
        const descriptor = Object.getOwnPropertyDescriptor(input, key)!;
        if (!('value' in descriptor) || ['__proto__', 'constructor', 'prototype'].includes(key)) throw new Error('Unsafe case property.');
        return [key, sorted(descriptor.value)];
      }));
    }
    ancestors.delete(input); return output;
  }
  return JSON.stringify(sorted(value));
}
export function validateCase(input: unknown): VisualCase {
  canonical(input);
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('Visual case must be an object.');
  const c = input as Record<string, unknown>;
  if (c.schemaVersion !== 1) throw new Error('Visual case schemaVersion must be 1.');
  const keys = ['schemaVersion', 'id', 'compositionId', 'frame', 'width', 'height', 'fps', 'brandId', 'styleId', 'fontPolicy', 'props'];
  for (const key of Object.keys(c)) if (!keys.includes(key)) throw new Error(`Unknown visual case field: ${key}`);
  if (typeof c.id !== 'string' || !/^[a-z][a-z0-9-]{0,100}$/.test(c.id)) throw new Error('Invalid visual case ID.');
  if (typeof c.compositionId !== 'string' || !/^[A-Za-z][A-Za-z0-9-]*$/.test(c.compositionId)) throw new Error('Invalid composition ID.');
  for (const key of ['frame', 'width', 'height', 'fps']) if (typeof c[key] !== 'number' || !Number.isSafeInteger(c[key]) || (c[key] as number) < (key === 'frame' ? 0 : 1)) throw new Error(`Invalid visual case ${key}.`);
  if ((c.width as number) > 7680 || (c.height as number) > 7680 || (c.fps as number) > 120) throw new Error('Visual case exceeds QA size/FPS limits.');
  if (!c.props || typeof c.props !== 'object' || Array.isArray(c.props)) throw new Error('Visual case props must be an object.');
  if (!['required-local', 'system-compatible'].includes(c.fontPolicy as string)) throw new Error('Invalid case font policy.');
  for (const key of ['brandId', 'styleId']) {
    if (c[key] !== null && (typeof c[key] !== 'string' || !/^[a-z][a-z0-9-]*$/.test(c[key] as string))) throw new Error(`Invalid case ${key}.`);
    if (c[key] !== null && (c.props as Record<string, unknown>)[key] !== c[key]) throw new Error(`Case ${key} must match input props.`);
  }
  return JSON.parse(canonical(c)) as VisualCase;
}
export const caseKey = (c: VisualCase): string => `${c.id}-${createHash('sha256').update(canonical(validateCase(c))).digest('hex').slice(0, 12)}`;
