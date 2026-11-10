import {useMemo} from 'react';
import type {CSSProperties, ReactNode} from 'react';
import {colorWithOpacity} from '@code-to-video/themes';
import {useVideoTheme} from '@code-to-video/themes/react';
import {resolveSurface} from './surfaces.ts';
import type {SurfaceSelection, SurfaceAnimationState} from './surfaces.ts';

export type GlassFilterMode = 'backdrop' | 'frosted';
export interface VideoGlassSurfaceProps {
  children?: ReactNode;
  appearance?: SurfaceSelection;
  filterMode?: GlassFilterMode;
  animationState?: SurfaceAnimationState;
  style?: CSSProperties;
}
// Fixed seed, local inline SVG. No random state, image download or animated filter.
const noiseImage = `url("data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves="1" seed="17" stitchTiles="stitch"/></filter><path fill="white" filter="url(#n)" d="M0 0h128v128H0z"/></svg>')}")`;
const defaultAppearance: SurfaceSelection = Object.freeze({preset: 'cinematic-frost'});
export function VideoGlassSurface({children, appearance = defaultAppearance, filterMode = 'backdrop', animationState, style}: VideoGlassSurfaceProps) {
  const t = useVideoTheme();
  const a = useMemo(() => resolveSurface(t, appearance), [t, appearance]);
  if (!['backdrop', 'frosted'].includes(filterMode)) throw new Error('Unknown glass filter mode.');
  const state = animationState ?? {blur: a.blur, illumination: 1, highlightPosition: 50};
  for (const [key, value, min, max] of [['blur', state.blur, 0, 24], ['illumination', state.illumination, 0, 1], ['highlightPosition', state.highlightPosition, -20, 120]] as const) {
    if (!Number.isFinite(value) || value < min || value > max) throw new Error(`Invalid surface animation ${key}.`);
  }
  const filtered = filterMode === 'backdrop' && a.blur > 0;
  const backdropFilter = filtered ? `blur(${state.blur}px) saturate(${a.saturation})` : undefined;
  const opacity = filterMode === 'frosted' && a.variant !== 'outlined' ? Math.max(a.opacity, a.fallbackOpacity) : a.opacity;
  const shadow = colorWithOpacity(t.colors[a.shadowColor], a.shadowOpacity);
  return <div data-surface={a.variant} data-filter-mode={filterMode} style={{position: 'relative', boxSizing: 'border-box', minWidth: 0,
    color: t.colors.foreground, borderRadius: a.radius, backgroundColor: colorWithOpacity(t.colors[a.tint], opacity),
    backdropFilter, WebkitBackdropFilter: backdropFilter,
    border: `${a.borderWidth}px solid ${colorWithOpacity(t.colors[a.borderColor], a.borderOpacity * state.illumination)}`,
    boxShadow: `0 ${t.shadow.offsetY + a.elevation * 5}px ${t.shadow.blur + a.elevation * 10}px ${shadow}, 0 3px ${6 + a.elevation * 3}px ${shadow}, 0 0 ${a.glow * 60}px ${colorWithOpacity(t.colors.accent, a.glow)}`,
    ...style}}>
    <div aria-hidden style={{position: 'absolute', inset: 0, borderRadius: 'inherit', pointerEvents: 'none',
      backgroundImage: `linear-gradient(125deg, ${colorWithOpacity(t.colors.foreground, a.highlight)} 0%, transparent 48%), radial-gradient(ellipse at ${state.highlightPosition}% 0%, ${colorWithOpacity(t.colors.accent, a.highlight)}, transparent 60%)`}} />
    {a.noise > 0 && <div aria-hidden style={{position: 'absolute', inset: 0, borderRadius: 'inherit', pointerEvents: 'none', backgroundImage: noiseImage, opacity: a.noise}} />}
    <div style={{position: 'relative', minWidth: 0, height: '100%'}}>{children}</div>
  </div>;
}
