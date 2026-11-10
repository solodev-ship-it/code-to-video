import type {CSSProperties, ReactNode} from 'react';
import {useVideoTheme} from '@code-to-video/themes/react';
import {evaluateIsland} from './island.ts';
import type {IslandGeometry, IslandTiming} from './island.ts';
import type {SurfaceSelection} from './surfaces.ts';
import {VideoSurface} from './VideoSurface.tsx';
import {VideoText} from './VideoText.tsx';

export interface VideoDynamicIslandProps {
  frame: number; fps: number; timing?: IslandTiming; geometry?: IslandGeometry; reducedMotion?: boolean;
  icon?: ReactNode; title?: ReactNode; secondary?: ReactNode; status?: ReactNode;
  children?: ReactNode; appearance?: SurfaceSelection; style?: CSSProperties;
}
export function VideoDynamicIsland({frame, fps, timing, geometry, reducedMotion = false, icon, title, secondary, status, children, appearance, style}: VideoDynamicIslandProps) {
  const t = useVideoTheme(); const s = evaluateIsland(frame, fps, t.motion, timing, geometry, reducedMotion);
  if (s.state === 'hidden') return null;
  const g = s.geometry; const gap = Math.min(20, t.spacing.gap / 2); const iconWidth = icon == null ? 0 : 48 + gap;
  const iconTop = (g.compactHeight - 48) / 2 + (g.padding - (g.compactHeight - 48) / 2) * s.expansion;
  return <VideoSurface appearance={appearance} style={{...style, width: s.width, height: s.height, borderRadius: s.radius,
    opacity: s.opacity, transform: `translateY(${reducedMotion ? 0 : (1 - s.opacity) * 12}px)`}}>
    <div data-island-state={s.state} data-island-phase={s.phase} style={{position: 'relative', width: '100%', height: '100%'}}>
      {icon != null && <div style={{position: 'absolute', left: g.padding, top: iconTop, width: 48, height: 48,
        display: 'flex', alignItems: 'center', justifyContent: 'center', transform: `scale(${s.iconScale})`}}>{icon}</div>}
      <div style={{position: 'absolute', left: g.padding + iconWidth, right: g.padding, top: 0, height: g.compactHeight,
        display: 'flex', alignItems: 'center', gap, opacity: s.compactOpacity, visibility: s.compactOpacity ? 'visible' : 'hidden'}}>
        <VideoText style={{fontSize: 24, flex: 1, minWidth: 0}}>{title}</VideoText>{status}
      </div>
      {/* Full fixed expanded layout never paints inside a partially morphed pill. */}
      <div style={{position: 'absolute', left: g.padding, top: g.padding, width: g.expandedWidth - g.padding * 2,
        opacity: s.expandedOpacity, visibility: s.expandedOpacity > 0 ? 'visible' : 'hidden'}}>
        <div style={{marginLeft: iconWidth, minHeight: 48, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap}}>
          <VideoText style={{fontSize: 26}}>{title}</VideoText>{status}
        </div>
        {secondary != null && <VideoText tone="mutedForeground" style={{fontSize: 21, marginTop: 12}}>{secondary}</VideoText>}
        <div style={{marginTop: gap}}>{children}</div>
      </div>
    </div>
  </VideoSurface>;
}
