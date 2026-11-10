import {useMemo} from 'react';
import type {CSSProperties} from 'react';
import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {colorWithOpacity, resolveTheme} from '@code-to-video/themes';
import {VideoThemeProvider, useVideoTheme} from '@code-to-video/themes/react';
import {AnimatedTitle, VideoCard, VideoGlassSurface, VideoMotion, VideoSafeArea, VideoStack, VideoText} from '@code-to-video/ui';
import {evaluateSurfaceAnimation, resolveSurface, surfacePresets} from '@code-to-video/ui/surfaces';
import type {SurfaceSelection} from '@code-to-video/ui/surfaces';
import {LayoutProbe} from '@code-to-video/ui/diagnostics/react';
import {showcaseRegistry} from './showcase-themes.ts';
import {validateGlassProps} from './glass-props.ts';
import type {GlassProps} from './glass-props.ts';
import {GlassLabel, GlassLabelProbe} from './GlassLabel';

const treatments: readonly SurfaceSelection[] = [
  {preset: 'cinematic-frost', overrides: {noise: 0.025}},
  {preset: 'aurora-glass'},
  {preset: 'minimal-clear'},
];
const fixtureAppearance: SurfaceSelection = {preset: 'cinematic-frost', overrides: {radius: 28, opacity: 0.66, highlight: 0, noise: 0, glow: 0, borderOpacity: 0.6, borderWidth: 2}};
function Background({kind}: {kind: GlassProps['background']}) {
  const t = useVideoTheme();
  const style: CSSProperties = kind === 'frequency' ? {
    backgroundColor: t.colors.background,
    backgroundImage: `repeating-conic-gradient(${t.colors.foreground} 0% 25%, ${t.colors.background} 0% 50%)`, backgroundSize: '24px 24px',
  } : kind === 'light' ? {backgroundColor: t.colors.foreground} : kind === 'grid' ? {
    backgroundColor: t.colors.background,
    backgroundImage: `linear-gradient(${colorWithOpacity(t.colors.foreground, 0.3)} 2px, transparent 2px), linear-gradient(90deg, ${colorWithOpacity(t.colors.accent, 0.5)} 2px, transparent 2px)`, backgroundSize: '48px 48px',
  } : {backgroundColor: t.colors.background, backgroundImage: `linear-gradient(130deg, ${t.colors.background}, ${t.colors.muted})`};
  return <AbsoluteFill style={style} />;
}
function MaterialFixture({props}: {props: GlassProps}) {
  const {width, height} = useVideoConfig();
  const variant = props.fixture;
  const appearance = useMemo<SurfaceSelection>(() => ({...fixtureAppearance, overrides: {...fixtureAppearance.overrides,
    ...(variant === 'no-blur' ? {blur: 0} : {}), ...(variant === 'solid' ? {variant: 'solid', opacity: 1} : {}),
    ...(variant === 'border-off' ? {borderWidth: 0} : {}), ...(variant === 'shadow-off' ? {shadowOpacity: 0} : {}),
  }}), [variant]);
  const rect: CSSProperties = {position: 'absolute', left: width * 0.25, top: height * 0.26, width: width * 0.5, height: height * 0.44};
  return <AbsoluteFill style={{width, height}}>
    {variant !== 'alpha' && <Background kind={props.background} />}
    <VideoGlassSurface appearance={appearance} filterMode={variant === 'fallback' ? 'frosted' : 'backdrop'} style={rect}>
      <VideoText variant="heading" style={{position: 'absolute', left: 48, bottom: 42, fontSize: 28}}>A clear signal, over any layer.</VideoText>
    </VideoGlassSurface>
    {variant === 'layered' && <>
      <VideoGlassSurface appearance={treatments[1]} style={{...rect, left: width * 0.15, top: height * 0.17, width: width * 0.28, height: height * 0.36}} />
      <VideoGlassSurface appearance={treatments[2]} style={{...rect, left: width * 0.58, top: height * 0.49, width: width * 0.27, height: height * 0.31}} />
    </>}
  </AbsoluteFill>;
}
function ShowcaseContent({props}: {props: GlassProps}) {
  const t = useVideoTheme(); const frame = useCurrentFrame(); const {fps, width, height} = useVideoConfig();
  const appearances = useMemo(() => treatments.map((a) => resolveSurface(t, a)), [t]);
  return <AbsoluteFill data-glass-stage style={{width, height}}>
    <Background kind="dark" />
    <div aria-hidden style={{position: 'absolute', left: width * 0.4, top: height * 0.28, width: width * 0.54, height: height * 0.52,
      borderRadius: 70, backgroundImage: `repeating-linear-gradient(90deg, ${colorWithOpacity(t.colors.accent, 0.16)} 0 2px, transparent 2px 24px)`}} />
    <VideoSafeArea frameSize={{width, height}} margins={{unit: 'ratio', top: 0.08, right: 0.07, bottom: 0.08, left: 0.07}} diagnostics={{id: 'glass-safe'}}>
      <VideoStack gap={20}>
        <VideoText variant="caption" tone="foreground" diagnostics={{id: 'glass-kicker', safeAreaId: 'glass-safe', maxLines: 1}}><GlassLabel id="kicker" hideInk={props.hideLabelInk}>MATERIAL STUDIES  /  01</GlassLabel></VideoText>
        <AnimatedTitle frame={frame} fps={fps} animation={{startSeconds: 0.15, durationSeconds: 0.9, distance: 18, reducedMotion: props.reducedMotion}}
          diagnostics={{id: 'glass-title', safeAreaId: 'glass-safe', maxLines: 1}} style={{fontSize: 88}}>Clarity, with depth.</AnimatedTitle>
        <VideoText tone="mutedForeground" style={{fontSize: 28}} diagnostics={{id: 'glass-subtitle', safeAreaId: 'glass-safe', maxLines: 1}}>A considered surface system. Built for stories in motion.</VideoText>
        <div style={{display: 'grid', gridTemplateColumns: '1.1fr 1.1fr 1fr', gap: 28, marginTop: 66}}>
          {['Cinematic frost', 'Elevated glass', 'Minimal clear'].map((title, i) => <VideoMotion key={title} frame={frame} fps={fps}
            preset="slide" startSeconds={1.1 + i * 0.3} durationSeconds={1.1} distance={28} reducedMotion={props.reducedMotion}>
            <VideoCard appearance={treatments[i]} animationState={evaluateSurfaceAnimation(frame, fps, t.motion, appearances[i]!, {startSeconds: 2.2 + i * 0.3, durationSeconds: 2, reducedMotion: props.reducedMotion})}
              style={{height: 370, padding: 34}} eyebrow={<GlassLabel id={`card-${i}`} hideInk={props.hideLabelInk}>{`0${i + 1}  /  ${['ATMOSPHERE', 'HIERARCHY', 'RESTRAINT'][i]}`}</GlassLabel>} title={title}
              description={['Soft diffusion. Quiet detail.', 'A focal point, not a distraction.', 'Less treatment. More signal.'][i]}>
              <div style={{height: 68, marginTop: 20, display: 'flex', alignItems: 'end', gap: 10}}>
                {[0.3, 0.55, 0.44, 0.76, 1, 0.84].map((value, index) => <div key={index} style={{height: `${value * 100}%`, flex: 1, borderRadius: 4,
                  backgroundColor: colorWithOpacity(t.colors.accent, 0.18 + index * 0.1)}} />)}
              </div>
              <VideoText variant="caption" tone="mutedForeground" style={{fontSize: 20, marginTop: 12}}>ILLUSTRATIVE SIGNAL · NOT LIVE DATA</VideoText>
            </VideoCard>
          </VideoMotion>)}
        </div>
        <VideoMotion frame={frame} fps={fps} preset="fade" startSeconds={4.6} durationSeconds={0.8} reducedMotion={props.reducedMotion}>
          <VideoText variant="caption" tone="mutedForeground" style={{fontSize: 22, marginTop: 28}}
            diagnostics={{id: 'glass-footer', safeAreaId: 'glass-safe', maxLines: 1}}>THEME-NATIVE   /   FRAME-PRECISE   /   COMPOSITION-FIRST</VideoText>
        </VideoMotion>
      </VideoStack>
    </VideoSafeArea>
    {props.diagnostics && [90, 180, 299].includes(frame) && <LayoutProbe compositionId="GlassmorphismShowcase" frame={frame} ready />}
    {props.diagnostics && [90, 180, 299].includes(frame) && <GlassLabelProbe frame={frame} hideInk={props.hideLabelInk} />}
  </AbsoluteFill>;
}
function LabelContrastFixture({props}: {props: GlassProps}) {
  const {width, height} = useVideoConfig(); const frame = useCurrentFrame();
  return <AbsoluteFill data-glass-stage style={{width, height}}>
    <Background kind={props.background} />
    <div style={{position: 'absolute', left: 120, right: 120, top: 160, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80}}>
      {surfacePresets.map((preset) => <VideoCard key={preset} appearance={{preset}} filterMode={props.fixture === 'label-contrast-fallback' ? 'frosted' : 'backdrop'} style={{height: 300}}
        eyebrow={<GlassLabel id={preset} hideInk={props.hideLabelInk}>INFORMATION / {preset.toUpperCase()}</GlassLabel>}
        title="A clear signal" />)}
    </div>
    <GlassLabelProbe frame={frame} hideInk={props.hideLabelInk} />
  </AbsoluteFill>;
}
export function GlassmorphismShowcase(input: GlassProps) {
  const props = useMemo(() => validateGlassProps(input), [input]);
  const t = useMemo(() => {
    const {fixture: _fixture, background: _background, reducedMotion: _reduced, diagnostics: _diagnostics, hideLabelInk: _hide, ...selection} = props;
    return resolveTheme(showcaseRegistry, selection);
  }, [props]);
  return <VideoThemeProvider theme={t}>{props.fixture === 'showcase' ? <ShowcaseContent props={props} /> : props.fixture.startsWith('label-contrast') ? <LabelContrastFixture props={props} /> : <MaterialFixture props={props} />}</VideoThemeProvider>;
}
