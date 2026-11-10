import {useMemo} from 'react';
import type {CSSProperties} from 'react';
import {colorWithOpacity} from '@code-to-video/themes';
import {useVideoTheme} from '@code-to-video/themes/react';
import {VideoClaySurface} from './VideoClaySurface.tsx';
import {resolveClay} from './clay.ts';
import type {ClayMotionOptions, ClaySelection} from './clay.ts';

export type ClayShapeVariant = 'orb' | 'capsule' | 'disc';
export interface VideoClayShapeProps {
  variant: ClayShapeVariant; width: number; height: number;
  appearance?: ClaySelection; animation?: ClayMotionOptions; frame?: number; fps?: number;
  label?: string; style?: CSSProperties;
}
const defaultAppearance: ClaySelection = Object.freeze({preset: 'sculpted'});
export function VideoClayShape({variant, width, height, appearance = defaultAppearance, animation, frame, fps, label, style}: VideoClayShapeProps) {
  const t = useVideoTheme(); const a = useMemo(() => resolveClay(t, appearance), [t, appearance]);
  if (!['orb', 'capsule', 'disc'].includes(variant)) throw new Error('Unknown clay shape variant.');
  if (![width, height].every(Number.isFinite) || width < 16 || height < 16 || width > 1000 || height > 1000 ||
    ((variant === 'orb' || variant === 'disc') && width !== height) || (variant === 'capsule' && width < height)) {
    throw new Error('Clay shape dimensions must be bounded and match its geometry.');
  }
  if (label !== undefined && (typeof label !== 'string' || !label.trim() || label.length > 100)) throw new Error('Clay shape label must be short nonempty text.');
  const light = t.colors[a.lightRole], dark = t.colors[a.darkRole];
  const gradient = variant === 'orb' ? `radial-gradient(circle at 28% 24%, ${colorWithOpacity(light, 0.32)}, transparent 46%), radial-gradient(circle at 72% 78%, ${colorWithOpacity(dark, 0.3)}, transparent 55%)` :
    variant === 'capsule' ? `linear-gradient(135deg, ${colorWithOpacity(light, 0.2)}, transparent 48%, ${colorWithOpacity(dark, 0.16)})` :
      `radial-gradient(circle at 35% 25%, ${colorWithOpacity(light, 0.16)}, transparent 52%)`;
  return <div role={label ? 'img' : undefined} aria-label={label} aria-hidden={label ? undefined : true} style={{width, height, ...style}}>
    <VideoClaySurface appearance={appearance} animation={animation} frame={frame} fps={fps} style={{width, height, borderRadius: variant === 'capsule' ? height / 2 : '50%'}}>
      <div aria-hidden style={{position: 'absolute', inset: 0, borderRadius: 'inherit', backgroundImage: gradient}}/>
    </VideoClaySurface>
  </div>;
}
