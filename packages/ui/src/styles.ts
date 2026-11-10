import {colorWithOpacity} from '@code-to-video/themes';
import type {ColorRole, ResolvedTheme} from '@code-to-video/themes';
import type {CSSProperties} from 'react';

export type TextVariant = 'title' | 'heading' | 'body' | 'caption';
export function textStyle(theme: ResolvedTheme, variant: TextVariant = 'body', tone: ColorRole = 'foreground'): CSSProperties {
  const t = theme.typography;
  const heading = variant === 'title' || variant === 'heading';
  return {
    margin: 0, minWidth: 0, color: theme.colors[tone],
    fontFamily: heading ? t.headingFontFamily : t.fontFamily,
    fontWeight: heading ? t.headingWeight : t.bodyWeight,
    fontSize: {title: t.titleSize, heading: t.titleSize * 0.4, body: t.bodySize, caption: t.captionSize}[variant],
    lineHeight: t.lineHeight, letterSpacing: heading ? t.letterSpacing : 0,
    whiteSpace: 'pre-wrap', overflowWrap: 'break-word',
  };
}

export type SurfaceVariant = 'panel' | 'canvas' | 'plain';
export function surfaceStyle(theme: ResolvedTheme, variant: SurfaceVariant = 'panel'): CSSProperties {
  const base: CSSProperties = {position: 'relative', boxSizing: 'border-box', minWidth: 0, color: theme.colors.foreground};
  if (variant === 'canvas') return {...base, backgroundColor: theme.colors.background, overflow: 'hidden'};
  if (variant === 'plain') return base;
  return {...base,
    backgroundColor: colorWithOpacity(theme.colors[theme.surface.color], theme.surface.opacity),
    borderRadius: theme.radii.card,
    border: `${theme.border.width}px solid ${colorWithOpacity(theme.colors[theme.border.color], theme.border.opacity)}`,
    boxShadow: `0 ${theme.shadow.offsetY}px ${theme.shadow.blur}px ${colorWithOpacity(theme.colors[theme.shadow.color], theme.shadow.opacity)}`,
  };
}

export function layoutGap(value: number): number {
  if (!Number.isFinite(value) || value < 0 || value > 1000) throw new Error('Layout gap/inset must be in [0, 1000] pixels.');
  return value;
}

export function gridColumns(columns: number): string {
  if (!Number.isInteger(columns) || columns < 1 || columns > 12) throw new Error('VideoGrid columns must be an integer in [1, 12].');
  return `repeat(${columns}, minmax(0, 1fr))`;
}
