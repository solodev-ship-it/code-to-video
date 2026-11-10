import {useMemo} from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {resolveTheme} from '@code-to-video/themes';
import {VideoThemeProvider, useVideoTheme} from '@code-to-video/themes/react';
import {Video3DAsset, VideoDepthLayer, VideoLightSweep, VideoGlow, VideoClaySurface, VideoGlassSurface, VideoText} from '@code-to-video/ui';
import type {AssetSource} from '@code-to-video/ui/cinematic';
import {showcaseRegistry} from './showcase-themes.ts';
import {validateComponentProps} from './component-props.ts';
import type {ComponentShowcaseProps} from './component-props.ts';
const sequence: AssetSource = {type: 'sequence', frames: Array.from({length: 8}, (_, i) => `advanced-effects/ring-${String(i).padStart(3, '0')}.png`), sourceFps: 8, startFrame: 10, policy: 'loop'};
const still: AssetSource = {type: 'png', src: 'advanced-effects/ring-000.png'};
function Scene({reducedMotion}: {reducedMotion: boolean}) {
  const frame = useCurrentFrame(); const {fps} = useVideoConfig(); const t = useVideoTheme();
  return <AbsoluteFill style={{background: t.colors.background, color: t.colors.foreground, padding: 100}}>
    <VideoText variant="caption" tone="accent">MATERIAL STUDIES / 03</VideoText>
    <VideoText variant="title" style={{fontSize: 76, marginTop: 24}}>Light in motion.</VideoText>
    <VideoText tone="mutedForeground" style={{fontSize: 28, marginTop: 20}}>External imagery. Frame-native compositing.</VideoText>
    <div style={{position: 'absolute', left: 180, top: 390, width: 650}}>
      <VideoDepthLayer frame={frame} startFrame={0} durationInFrames={89} depth={1} travelX={40} reducedMotion={reducedMotion}>
        <VideoGlow><VideoClaySurface style={{height: 440}}>
          <Video3DAsset source={still} frame={frame} fps={fps} width={390} height={390} x={125} y={15}
            envelope={{startFrame: 0, endFrame: 90, fadeInFrames: 15, fadeOutFrames: 12}}/>
          <VideoLightSweep frame={frame} startFrame={15} durationInFrames={55} reducedMotion={reducedMotion}/>
        </VideoClaySurface></VideoGlow>
      </VideoDepthLayer>
    </div>
    <div style={{position: 'absolute', left: 1040, top: 390, width: 650}}>
      <VideoDepthLayer frame={frame} startFrame={0} durationInFrames={89} depth={-1} travelX={25} reducedMotion={reducedMotion}>
        <VideoGlassSurface filterMode="frosted" style={{height: 440}}>
          <Video3DAsset source={sequence} frame={frame} fps={fps} width={390} height={390} x={125} y={15}/>
        </VideoGlassSurface>
      </VideoDepthLayer>
    </div>
    <VideoText variant="caption" style={{position: 'absolute', bottom: 110}}>PNG ALPHA / 8 FPS SEQUENCE / LAYERED LIGHT</VideoText>
  </AbsoluteFill>;
}
export function AdvancedEffectsShowcase(input: ComponentShowcaseProps) {
  const props = useMemo(() => validateComponentProps(input), [input]);
  const theme = useMemo(() => {const {reducedMotion: _reduced, ...selection} = props; return resolveTheme(showcaseRegistry, selection);}, [props]);
  return <VideoThemeProvider theme={theme}><Scene reducedMotion={props.reducedMotion}/></VideoThemeProvider>;
}
