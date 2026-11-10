import type {CSSProperties, ReactNode} from 'react';
import {useVideoTheme} from '@code-to-video/themes/react';
import {evaluateMotion, motionStyle} from './motion.ts';
import type {MotionOptions} from './motion.ts';

export type VideoMotionProps = MotionOptions & {children: ReactNode; frame: number; fps: number; style?: CSSProperties};
export function VideoMotion({children, frame, fps, style, ...options}: VideoMotionProps) {
  const theme = useVideoTheme();
  return <div style={{...style, ...motionStyle(evaluateMotion(frame, fps, theme.motion, options))}}>{children}</div>;
}
