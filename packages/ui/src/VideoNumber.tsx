import {useVideoTheme} from '@code-to-video/themes/react';
import {formatChartValue, numberAtFrame} from './charts.ts';
import type {NumberFormat} from './charts.ts';

export interface VideoNumberProps {
  from: number; to: number; frame: number; startFrame: number; endFrame: number;
  reducedMotion?: boolean; format?: NumberFormat; label?: string;
}
export function VideoNumber({from, to, frame, startFrame, endFrame, reducedMotion = false, format, label}: VideoNumberProps) {
  const t = useVideoTheme();
  const value = numberAtFrame(frame, from, to, startFrame, endFrame, reducedMotion);
  return <span aria-label={label ?? formatChartValue(value, format)} style={{color: t.colors.foreground,
    fontFamily: t.typography.headingFontFamily, fontWeight: t.typography.headingWeight}}>{formatChartValue(value, format)}</span>;
}
