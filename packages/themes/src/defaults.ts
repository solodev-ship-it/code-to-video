import type {Colors, MotionTokens, StyleTokens, Typography} from './types.ts';
import {freezeData} from './immutable.ts';

export const frameworkDefaults = freezeData({
  colors: {primary: '#4466dd', secondary: '#182437', accent: '#68ddcc', background: '#101722', foreground: '#f4f6fa', muted: '#202d40', mutedForeground: '#b1bdcc'} satisfies Colors,
  typography: {fontFamily: 'Arial, sans-serif', headingFontFamily: 'Arial, sans-serif', headingWeight: 700, bodyWeight: 400, titleSize: 88, bodySize: 28, captionSize: 18, lineHeight: 1.2, letterSpacing: 0} satisfies Typography,
  style: {
    surface: {color: 'muted', opacity: 1}, radii: {card: 12, badge: 12},
    border: {color: 'foreground', width: 1, opacity: 0.15},
    shadow: {color: 'background', offsetY: 12, blur: 30, opacity: 0},
    gradient: {enabled: false, from: 'secondary', to: 'background', angle: 135, opacity: 1},
    spacing: {page: 100, gap: 32, cardPadding: 36}, layout: {contentWidth: 1600}, effects: {gridOpacity: 0, glowOpacity: 0},
  } satisfies StyleTokens,
  motion: {durationSeconds: 0.9, delaySeconds: 0.2, staggerSeconds: 0.12, easing: 'ease-out-cubic', intensity: 1, distance: 32, spring: {damping: 22, stiffness: 100, mass: 1}} satisfies MotionTokens,
} as const);
