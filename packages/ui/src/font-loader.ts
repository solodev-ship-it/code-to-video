import {browserFontEnvironment, validateLocalFonts} from './font-loading.ts';
import type {FontEnvironment, LocalFontDefinition} from './font-loading.ts';
import {assertRequiredFonts, fontIdentity} from './font-manifest.ts';
import type {FontRequirement} from './font-manifest.ts';

export interface LocalFontLoader {
  load(faces: readonly LocalFontDefinition[], required?: readonly FontRequirement[]): Promise<void>;
  isReady(face: FontRequirement): boolean;
  clear(): void;
}

// Explicitly owned by a gate/document, never an application-wide mutable cache.
export function createLocalFontLoader(options: {environment?: FontEnvironment; timeoutMs?: number; resolveAsset?: (src: string) => string} = {}): LocalFontLoader {
  const timeout = options.timeoutMs ?? 15000;
  if (!Number.isFinite(timeout) || timeout < 1 || timeout > 120000) throw new Error('Font loader timeout must be in [1, 120000] ms.');
  const entries = new Map<string, {src: string; promise: Promise<void>; ready: boolean}>();
  let generation = 0;
  let environment = options.environment;
  const env = () => environment ??= browserFontEnvironment(options.resolveAsset);
  return {
    async load(input, required = input) {
      const faces = validateLocalFonts(input);
      assertRequiredFonts(faces, required);
      await Promise.all(faces.map((font) => {
        const key = fontIdentity(font);
        const existing = entries.get(key);
        if (existing) {
          if (existing.src !== font.src) throw new Error(`Conflicting source for font face: ${key}`);
          return existing.promise;
        }
        const entry = {src: font.src, ready: false, promise: Promise.resolve()};
        const startedGeneration = generation;
        entry.promise = Promise.resolve().then(async () => {
          let timer: ReturnType<typeof setTimeout> | undefined;
          try {
            const loaded = await Promise.race([
              env().createFace(font).load(),
              new Promise<never>((_, reject) => {timer = setTimeout(() => reject(new Error('font load timed out')), timeout);}),
            ]);
            if (generation !== startedGeneration) throw new Error('font loader lifecycle ended');
            env().addFace(loaded);
            if (env().isFaceReady && !env().isFaceReady!(font)) throw new Error('exact family/weight/style is not ready');
            entry.ready = true;
          } catch (error) {
            if (entries.get(key) === entry) entries.delete(key); // Failed requests remain retryable.
            throw new Error(`Required font failed: ${font.family} (${font.weight} ${font.style}) ${font.src}: ${error instanceof Error ? error.message : String(error)}`);
          } finally {if (timer) clearTimeout(timer);}
        });
        entries.set(key, entry);
        return entry.promise;
      }));
    },
    isReady: (face) => entries.get(fontIdentity(face))?.ready === true &&
      (!environment?.isFaceReady || environment.isFaceReady(face as LocalFontDefinition)),
    clear: () => {generation++; entries.clear();},
  };
}
