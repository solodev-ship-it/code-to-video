import {useMemo} from 'react';
import type {CSSProperties, ReactNode} from 'react';
import {colorWithOpacity} from '@code-to-video/themes';
import {useVideoTheme} from '@code-to-video/themes/react';
import {evaluateClayMotion, resolveClay} from './clay.ts';
import type {ClayMotionOptions, ClaySelection} from './clay.ts';

export interface VideoClaySurfaceProps {
  children?: ReactNode;
  appearance?: ClaySelection;
  animation?: ClayMotionOptions;
  frame?: number;
  fps?: number;
  clipContent?: boolean;
  style?: CSSProperties;
}
const defaultAppearance: ClaySelection = Object.freeze({preset: 'soft-panel'});
export function VideoClaySurface({children, appearance = defaultAppearance, animation, frame, fps, clipContent = true, style}: VideoClaySurfaceProps) {
  const t = useVideoTheme();
  const a = useMemo(() => resolveClay(t, appearance), [t, appearance]);
  if (typeof clipContent !== 'boolean') throw new Error('Clay clipContent must be a boolean.');
  if (animation && (frame === undefined || fps === undefined)) throw new Error('Animated clay requires explicit frame and FPS.');
  if ((frame === undefined) !== (fps === undefined)) throw new Error('Clay frame and FPS must be supplied together.');
  const state = animation ? evaluateClayMotion(frame!, fps!, t.motion, animation) : {opacity: 1, y: 0, scale: 1, depthFactor: 1};
  const depth = a.depth * state.depthFactor;
  const light = t.colors[a.lightRole], dark = t.colors[a.darkRole], fill = t.colors[a.fill];
  const direction = a.lightDirection === 'top-left' ? 135 : 225;
  const shadow = colorWithOpacity(dark, a.shadowOpacity);
  const softness = 10 + a.softness * 28;
  const outerShadow = `0 ${5 + depth * 9}px ${softness + depth * 8}px ${shadow}, 0 ${2 + depth * 2}px ${4 + depth * 3}px ${colorWithOpacity(dark, a.shadowOpacity * 0.34)}`;
  const insetShadow = `inset ${a.lightDirection === 'top-left' ? -1 : 1} ${2 + a.inset * 5}px ${8 + a.softness * 12}px ${colorWithOpacity(light, a.inset * 0.58)}, inset ${a.lightDirection === 'top-left' ? 2 : -2}px -${2 + a.inset * 6}px ${10 + a.softness * 12}px ${colorWithOpacity(dark, a.inset * 0.42)}`;
  return <div data-clay-surface="true" style={{position: 'relative', boxSizing: 'border-box', minWidth: 0, color: t.colors.foreground,
    backgroundColor: fill, borderRadius: a.radius, border: `1px solid ${colorWithOpacity(light, a.borderOpacity)}`,
    boxShadow: `${outerShadow}, ${insetShadow}`, opacity: state.opacity,
    transform: `translate3d(0, ${state.y}px, 0) scale(${state.scale})`, overflow: 'visible', ...style}}>
    <div aria-hidden style={{position: 'absolute', inset: 0, borderRadius: 'inherit', overflow: 'hidden', pointerEvents: 'none',
      backgroundImage: `linear-gradient(${direction}deg, ${colorWithOpacity(light, a.highlight)} 0%, transparent 42%, ${colorWithOpacity(dark, a.highlight * 0.42)} 100%), radial-gradient(ellipse at ${a.lightDirection === 'top-left' ? '17%' : '83%'} 8%, ${colorWithOpacity(light, a.highlight * 0.48)}, transparent 52%)`}} />
    <div style={{position: 'relative', minWidth: 0, height: '100%', borderRadius: 'inherit', overflow: clipContent ? 'hidden' : 'visible'}}>{children}</div>
  </div>;
}
