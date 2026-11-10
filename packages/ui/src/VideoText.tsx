import {createElement} from 'react';
import type {CSSProperties, ReactNode} from 'react';
import type {ColorRole} from '@code-to-video/themes';
import {useVideoTheme} from '@code-to-video/themes/react';
import {textStyle} from './styles.ts';
import type {TextVariant} from './styles.ts';
import type {TextDiagnosticOptions} from './diagnostics/types.ts';

export interface VideoTextProps {
  children: ReactNode;
  variant?: TextVariant;
  tone?: ColorRole;
  as?: 'div' | 'span' | 'p' | 'h1' | 'h2' | 'h3';
  align?: 'left' | 'center' | 'right';
  style?: CSSProperties;
  diagnostics?: TextDiagnosticOptions;
}
export function VideoText({children, variant = 'body', tone = 'foreground', as = 'div', align = 'left', style, diagnostics}: VideoTextProps) {
  const theme = useVideoTheme();
  return createElement(as, {style: {...textStyle(theme, variant, tone), textAlign: align, ...style},
    ...(diagnostics ? {'data-ctv-text': JSON.stringify(diagnostics)} : {})}, children);
}
