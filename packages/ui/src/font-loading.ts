export interface LocalFontDefinition {
  family: string;
  src: string;
  weight: number;
  style: 'normal' | 'italic';
  license: {name: string; source: string; redistributionApproved: true};
}
export interface FontFaceLike {load(): Promise<FontFaceLike>}
export interface FontEnvironment {
  createFace(font: LocalFontDefinition): FontFaceLike;
  addFace(face: FontFaceLike): void;
  isFaceReady?(font: LocalFontDefinition): boolean;
}

export function validateLocalFonts(input: readonly LocalFontDefinition[]): LocalFontDefinition[] {
  if (!Array.isArray(input)) throw new Error('Local fonts must be an array.');
  const keys = new Set<string>();
  return input.map((font, index) => {
    const error = (message: string): never => {throw new Error(`Font ${index}: ${message}`);};
    if (!font || typeof font !== 'object') return error('expected a font definition.');
    if (typeof font.family !== 'string' || !font.family.trim() || font.family.length > 128 || /["'\\\n\r]/.test(font.family)) return error('family must be a simple, nonempty font family name.');
    if (typeof font.src !== 'string' || !/^\/(?!\/)[a-zA-Z0-9_./-]+\.(woff2?|ttf|otf)$/.test(font.src) || font.src.split('/').includes('..')) return error('src must be a same-origin public font path, not a remote URL or filesystem path.');
    if (!Number.isInteger(font.weight) || font.weight < 100 || font.weight > 900) return error('weight must be an integer in [100, 900].');
    if (!['normal', 'italic'].includes(font.style)) return error('style must be normal or italic.');
    const license = font.license;
    if (!license || license.redistributionApproved !== true || typeof license.name !== 'string' || !license.name.trim() || typeof license.source !== 'string' || !license.source.trim()) return error('explicit reviewed license name/source and redistribution approval are required.');
    const key = `${font.family}/${font.weight}/${font.style}`;
    if (keys.has(key)) return error(`duplicate font face: ${key}`);
    keys.add(key);
    return {family: font.family, src: font.src, weight: font.weight, style: font.style,
      license: {name: license.name, source: license.source, redistributionApproved: true}};
  });
}

export function browserFontEnvironment(resolveAsset: (src: string) => string = (src) => src): FontEnvironment {
  if (typeof FontFace === 'undefined' || typeof document === 'undefined' || !document.fonts) {
    throw new Error('Local font loading requires a browser with the FontFace API.');
  }
  return {
    createFace: (font) => {
      const src = new URL(resolveAsset(font.src), document.baseURI);
      if (src.origin !== location.origin || !['http:', 'https:'].includes(src.protocol)) throw new Error('Resolved fonts must remain same-origin local assets.');
      return new FontFace(font.family, `url(${JSON.stringify(src.href)})`, {weight: String(font.weight), style: font.style});
    },
    addFace: (face) => document.fonts.add(face as FontFace),
    isFaceReady: (font) => {
      const exact = [...document.fonts].some((face) => face.family.replace(/["']/g, '').toLowerCase() === font.family.toLowerCase() &&
        face.weight === String(font.weight) && face.style === font.style && face.status === 'loaded');
      return exact && document.fonts.check(`${font.style} ${font.weight} 16px ${JSON.stringify(font.family)}`, 'Reliable type');
    },
  };
}

export async function loadLocalFonts(input: readonly LocalFontDefinition[], environment?: FontEnvironment): Promise<void> {
  const definitions = validateLocalFonts(input);
  if (!definitions.length) return;
  const env = environment ?? browserFontEnvironment();
  // No faces are installed until all loads succeed. No global cache or network fallback.
  const loaded = await Promise.all(definitions.map(async (font) => {
    try {return await env.createFace(font).load();}
    catch {throw new Error(`Unable to load local font: ${font.family} (${font.weight} ${font.style}) from ${font.src}`);}
  }));
  for (const face of loaded) env.addFace(face);
}
