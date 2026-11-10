import type {CSSProperties, ReactNode} from 'react';
import {useVideoTheme} from '@code-to-video/themes/react';
import {surfaceStyle} from './styles.ts';
import type {SurfaceVariant} from './styles.ts';
import {VideoGlassSurface} from './VideoGlassSurface.tsx';
import type {VideoGlassSurfaceProps} from './VideoGlassSurface.tsx';

export interface VideoSurfaceProps extends Pick<VideoGlassSurfaceProps, 'appearance' | 'filterMode' | 'animationState'> {children?: ReactNode; variant?: SurfaceVariant; style?: CSSProperties}
export function VideoSurface({children, variant = 'panel', style, appearance, filterMode, animationState}: VideoSurfaceProps) {
  const t = useVideoTheme();
  if (appearance) {
    if (variant !== 'panel') throw new Error('Advanced appearance requires the panel surface variant.');
    return <VideoGlassSurface appearance={appearance} filterMode={filterMode} animationState={animationState} style={style}>{children}</VideoGlassSurface>;
  }
  if (variant !== 'canvas') return <div style={{...surfaceStyle(t, variant), ...style}}>{children}</div>;
  return <div style={{...surfaceStyle(t, variant), ...style}}>
    <div aria-hidden style={{position: 'absolute', inset: 0, pointerEvents: 'none', opacity: t.gradient.enabled ? t.gradient.opacity : 0,
      backgroundImage: `linear-gradient(${t.gradient.angle}deg, ${t.colors[t.gradient.from]}, ${t.colors[t.gradient.to]})`}} />
    <div aria-hidden style={{position: 'absolute', inset: 0, pointerEvents: 'none', opacity: t.effects.gridOpacity,
      backgroundImage: `linear-gradient(${t.colors.foreground} 1px, transparent 1px), linear-gradient(90deg, ${t.colors.foreground} 1px, transparent 1px)`, backgroundSize: '100px 100px'}} />
    <div aria-hidden style={{position: 'absolute', inset: 0, pointerEvents: 'none', opacity: t.effects.glowOpacity,
      backgroundImage: `radial-gradient(ellipse at 80% 20%, ${t.colors.accent}, transparent 60%)`}} />
    <div style={{position: 'relative', width: '100%', height: '100%'}}>{children}</div>
  </div>;
}
