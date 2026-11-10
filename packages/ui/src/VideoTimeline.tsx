import {useVideoTheme} from '@code-to-video/themes/react';
import type {ReactNode} from 'react';
import {chartProgress, normalizeTimeline} from './charts.ts';
import type {ChartAnimation, TimelineEvent} from './charts.ts';

export interface VideoTimelineProps {
  events: readonly TimelineEvent[]; frame: number; fps: number; width: number; height: number;
  spacing?: 'chronological' | 'events'; orientation?: 'horizontal' | 'vertical'; animation?: ChartAnimation;
  icon?: (event: TimelineEvent) => ReactNode; renderDescription?: (event: TimelineEvent) => ReactNode;
}
export function VideoTimeline({events: input, frame, fps, width, height, spacing = 'chronological', orientation = 'horizontal',
  animation, icon, renderDescription}: VideoTimelineProps) {
  const t = useVideoTheme();
  if (![width, height].every(Number.isFinite) || width < 200 || height < 150 || !['horizontal', 'vertical'].includes(orientation)) throw new Error('Invalid timeline geometry.');
  const events = normalizeTimeline(input, spacing);
  const horizontal = orientation === 'horizontal';
  const extent = horizontal ? width - 160 : height - 130;
  return <div role="img" aria-label={`Timeline with ${events.length} events; ${spacing === 'events' ? 'equal event spacing' : 'chronological spacing'}`}
    style={{position: 'relative', width, height, color: t.colors.foreground, fontFamily: t.typography.fontFamily}}>
    <div style={horizontal ? {position: 'absolute', left: 80, right: 80, top: 48, height: 2, background: t.colors.mutedForeground} :
      {position: 'absolute', top: 56, bottom: 74, left: 54, width: 2, background: t.colors.mutedForeground}}/>
    {events.map((event, index) => {const progress = chartProgress(frame, fps, t.motion, animation, index);
      const primary = horizontal ? 80 + event.position * extent : 56 + event.position * extent;
      const labelWidth = horizontal ? Math.min(220, width / Math.max(1, events.length) - 8) : width - 140;
      const labelLeft = horizontal ? Math.max(0, Math.min(width - labelWidth, primary - labelWidth / 2)) : 82;
      return <div key={event.id} style={{position: 'absolute', opacity: progress, left: horizontal ? primary - 20 : labelLeft,
        top: horizontal ? 28 : primary - 22, width: horizontal ? 40 : labelWidth, minWidth: 0}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 10}}>
          <span style={{display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            width: 40, height: 40, borderRadius: 20, background: event.highlight ? t.colors.accent : t.colors.muted,
            color: event.highlight ? t.colors.background : t.colors.foreground}}>{icon?.(event) ?? '•'}</span>
          {!horizontal && <span style={{fontSize: 20, color: t.colors.accent}}>{event.label}</span>}
        </div>
        <div style={{position: horizontal ? 'relative' : undefined, left: horizontal ? labelLeft - (primary - 20) : undefined,
          width: labelWidth, marginTop: 12, fontSize: 19, fontWeight: t.typography.headingWeight, overflowWrap: 'break-word'}}>
          {horizontal && <span style={{display: 'block', fontSize: 16, color: t.colors.accent}}>{event.label}</span>}{event.title}
          <div style={{marginTop: 5, fontSize: 15, fontWeight: t.typography.bodyWeight, color: t.colors.mutedForeground, overflowWrap: 'break-word'}}>{renderDescription?.(event) ?? event.description}</div>
        </div>
      </div>;})}
  </div>;
}
