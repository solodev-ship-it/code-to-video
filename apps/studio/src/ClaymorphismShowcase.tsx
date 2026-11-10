import {useMemo} from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {colorWithOpacity, resolveTheme} from '@code-to-video/themes';
import {VideoThemeProvider, useVideoTheme} from '@code-to-video/themes/react';
import {VideoClayCard, VideoClayShape, VideoClaySurface, VideoSafeArea, VideoText} from '@code-to-video/ui';
import type {ClaySelection} from '@code-to-video/ui/clay';
import {showcaseRegistry} from './showcase-themes.ts';
import {validateClayShowcaseProps} from './clay-props.ts';
import type {ClayShowcaseProps} from './clay-props.ts';

const soft: ClaySelection = Object.freeze({preset: 'soft-panel'});
const sculpted: ClaySelection = Object.freeze({preset: 'sculpted'});
const pressed: ClaySelection = Object.freeze({preset: 'pressed'});
const flat: ClaySelection = Object.freeze({preset: 'soft-panel', overrides: Object.freeze({depth: 0, highlight: 0, shadowOpacity: 0, inset: 0, borderOpacity: 0})});
function Scene({props}: {props: ClayShowcaseProps}) {
  const t = useVideoTheme(); const frame = useCurrentFrame(); const {width, height, fps} = useVideoConfig();
  const material = (preset: ClaySelection) => props.fixture === 'flat' ? flat : preset;
  return <AbsoluteFill data-clay-stage style={{width, height, color: t.colors.foreground, backgroundColor: t.colors.background,
    backgroundImage: `radial-gradient(circle at 78% 18%, ${colorWithOpacity(t.colors.muted, 0.6)}, transparent 43%)`}}>
    <VideoSafeArea frameSize={{width, height}} margins={{unit: 'ratio', top: 0.075, right: 0.055, bottom: 0.075, left: 0.055}}>
      <div style={{position: 'relative', width: '100%', height: '100%'}}>
      <VideoText variant="caption" tone="accent" style={{fontSize: 19, letterSpacing: 4}}>MATERIAL STUDIES / 02</VideoText>
      <VideoText variant="title" style={{fontSize: 80, marginTop: 18}}>Depth you can almost touch.</VideoText>
      <VideoText tone="mutedForeground" style={{fontSize: 27, marginTop: 12}}>Soft form, measured light, and motion shaped for the frame.</VideoText>
      <div style={{position: 'absolute', left: 0, right: 0, top: 315, height: 520}}>
        <VideoClayShape variant="orb" width={210} height={210} appearance={material(sculpted)} animation={{preset: 'float', startSeconds: 0.1, durationSeconds: 0.9, amplitude: 8, reducedMotion: props.reducedMotion}}
          frame={frame} fps={fps} style={{position: 'absolute', left: 1210, top: -80}}/>
        <VideoClayShape variant="capsule" width={210} height={84} appearance={material(soft)} animation={{preset: 'float', startSeconds: 0.3, durationSeconds: 0.9, amplitude: 5, periodSeconds: 4, reducedMotion: props.reducedMotion}}
          frame={frame} fps={fps} style={{position: 'absolute', right: 80, top: -76}}/>
        <VideoClayShape variant="disc" width={126} height={126} appearance={material(pressed)} animation={{preset: 'depth', startSeconds: 1.2, durationSeconds: 0.9, reducedMotion: props.reducedMotion}}
          frame={frame} fps={fps} style={{position: 'absolute', right: 16, bottom: -30}}/>
        <div style={{position: 'relative', display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 30, marginTop: 70}}>
          <VideoClayCard appearance={material(soft)} animation={{preset: 'reveal', startSeconds: 0.6, durationSeconds: 0.85, reducedMotion: props.reducedMotion}}
            frame={frame} fps={fps} style={{height: 380, padding: 35}}
            eyebrow="01 / SOFT PANEL" title="Quiet curvature" description="A matte shell, lifted by light.">
            <VideoText tone="accent" style={{fontSize: 42, marginTop: 38}}>FORM / LIGHT</VideoText>
          </VideoClayCard>
          <VideoClayCard appearance={material(sculpted)} animation={{preset: 'float', startSeconds: 1, durationSeconds: 1, amplitude: 7, reducedMotion: props.reducedMotion}}
            frame={frame} fps={fps} style={{height: 380, padding: 35}}
            eyebrow="02 / SCULPTED" title="A tactile layer" description="A focal point with soft depth.">
            <VideoClaySurface appearance={material(pressed)} style={{width: 150, height: 75, marginTop: 35}}>
              <div style={{height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}><VideoText variant="caption" style={{fontSize: 22}}>2.5D</VideoText></div>
            </VideoClaySurface>
          </VideoClayCard>
          <VideoClayCard appearance={material(pressed)} animation={{preset: 'press', startSeconds: 1.4, durationSeconds: 1.1, reducedMotion: props.reducedMotion}}
            frame={frame} fps={fps} style={{height: 380, padding: 35}}
            eyebrow="03 / PRESSED" title="Controlled relief" description="Inward shading, without distraction.">
            <VideoText variant="caption" tone="mutedForeground" style={{fontSize: 22, marginTop: 40}}>FRAME-NATIVE / NO LIVE INPUT</VideoText>
          </VideoClayCard>
        </div>
      </div>
      <VideoText variant="caption" tone="mutedForeground" style={{position: 'absolute', bottom: 5, left: 0, fontSize: 21}}>THEME-AWARE  /  DETERMINISTIC  /  MATTE 2.5D</VideoText>
      </div>
    </VideoSafeArea>
  </AbsoluteFill>;
}
export function ClaymorphismShowcase(input: ClayShowcaseProps) {
  const props = useMemo(() => validateClayShowcaseProps(input), [input]);
  const theme = useMemo(() => {const {fixture: _fixture, reducedMotion: _reduced, ...selection} = props; return resolveTheme(showcaseRegistry, selection);}, [props]);
  return <VideoThemeProvider theme={theme}><Scene props={props}/></VideoThemeProvider>;
}
