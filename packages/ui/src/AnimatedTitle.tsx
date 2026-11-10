import {VideoText} from './VideoText.tsx';
import type {VideoTextProps} from './VideoText.tsx';
import {VideoMotion} from './VideoMotion.tsx';
import type {VideoMotionProps} from './VideoMotion.tsx';

export type AnimatedTitleProps = Omit<VideoTextProps, 'variant'> & Pick<VideoMotionProps, 'frame' | 'fps'> & {
  animation?: Omit<VideoMotionProps, 'children' | 'frame' | 'fps' | 'style'>;
};
export function AnimatedTitle({frame, fps, animation, ...text}: AnimatedTitleProps) {
  return <VideoMotion frame={frame} fps={fps} preset="slide" {...animation}>
    <VideoText as="h1" {...text} variant="title" />
  </VideoMotion>;
}
