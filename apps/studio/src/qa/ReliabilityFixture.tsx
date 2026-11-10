import {useMemo} from 'react';
import {Artifact, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {resolveTheme} from '@code-to-video/themes';
import {VideoThemeProvider, useVideoTheme} from '@code-to-video/themes/react';
import {AnimatedTitle, LocalFontGate, useLocalFontsReady, VideoCard, VideoGrid, VideoSafeArea, VideoStack, VideoSurface, VideoText} from '@code-to-video/ui';
import {LayoutProbe} from '@code-to-video/ui/diagnostics/react';
import {validateComponentProps} from '../component-props.ts';
import type {ComponentShowcaseProps} from '../component-props.ts';
import {showcaseRegistry} from '../showcase-themes.ts';
import {qaFontManifest} from './fonts.ts';

export type ReliabilityProps = ComponentShowcaseProps & {fixture: string};
const resolveFontAsset = (src: string) => staticFile(src.slice(1));
export function validateReliabilityProps(input: unknown): ReliabilityProps {
  if (!input || typeof input !== 'object') throw new Error('Reliability props must be an object.');
  const {fixture, ...selection} = input as Record<string, unknown>;
  if (typeof fixture !== 'string' || !['normal', 'font-failure', 'overflow', 'small', 'wrap', 'non-ascii', 'optional', 'safe-violation', 'animation-exempt', 'not-ready', 'fallback'].includes(fixture)) throw new Error('Unknown reliability fixture.');
  return {...validateComponentProps(selection), fixture};
}

export function ReliabilityFixture(props: ReliabilityProps) {
  const prepared = useMemo(() => {
    const {fixture, reducedMotion, ...selection} = validateReliabilityProps(props);
    // Explicit opt-in compatibility override; original brand tokens are never rewritten.
    const theme = resolveTheme(showcaseRegistry, {...selection, overrides: {...selection.overrides,
      typography: {...selection.overrides?.typography, fontFamily: 'Atkinson Hyperlegible', headingFontFamily: 'Atkinson Hyperlegible', headingWeight: 700, bodyWeight: 400}}});
    const fonts = fixture === 'font-failure' ? qaFontManifest.faces.map((face) => ({...face, src: '/fonts/missing-required.ttf'})) : qaFontManifest.faces;
    return {fixture, reducedMotion, theme, fonts};
  }, [props]);
  return <LocalFontGate fonts={prepared.fonts} resolveAsset={resolveFontAsset}><VideoThemeProvider theme={prepared.theme}>
    <FixtureScene fixture={prepared.fixture} reducedMotion={prepared.reducedMotion} />
  </VideoThemeProvider></LocalFontGate>;
}

function FixtureScene({fixture, reducedMotion}: {fixture: string; reducedMotion: boolean}) {
  const frame = useCurrentFrame(); const {fps, width, height, id, durationInFrames} = useVideoConfig();
  const theme = useVideoTheme();
  const ready = useLocalFontsReady();
  const overflow = fixture === 'overflow' || fixture === 'small';
  const outside = fixture === 'safe-violation' || fixture === 'animation-exempt';
  const title = fixture === 'non-ascii' ? 'Café — naïve €: clear local type.' :
    overflow ? 'An excessively long English title that must overflow this deliberately tiny container.' : 'Reliable frames. Clear stories.';
  const expectedFont = {family: fixture === 'not-ready' ? 'Missing Required Face' : 'Atkinson Hyperlegible', weight: 700, style: 'normal' as const};
  return <VideoSurface variant="canvas" style={{width: '100%', height: '100%'}}>
    <VideoSafeArea margins={{unit: 'ratio', top: 0.08, right: 0.08, bottom: 0.08, left: 0.08}} frameSize={{width, height}} diagnostics={{id: 'project-safe'}}>
      <VideoStack justify="center" style={{height: '100%', opacity: Math.min(1, (durationInFrames - 1 - frame) / (fps * 0.5))}}>
        <AnimatedTitle frame={frame} fps={fps} animation={{startSeconds: 0.2, durationSeconds: 1, reducedMotion}}
          diagnostics={{id: 'qa-title', maxLines: 1, safeAreaId: 'project-safe', expectedFont,
            ...(fixture === 'animation-exempt' ? {exemptions: {codes: ['TEXT_OUTSIDE_SAFE_AREA', 'TEXT_CLIPPED'] as const, reason: 'Explicit cinematic entrance fixture; sampled intentionally outside safe area.'}} : {})}}
          style={{fontSize: Math.min(theme.typography.titleSize, width * 0.045),
            ...(overflow ? {width: fixture === 'small' ? 80 : 160, height: 32, overflow: 'hidden', whiteSpace: 'nowrap'} : {}),
            ...(outside ? {transform: `translateX(${-width * 0.4}px)`} : {}),
            ...(fixture === 'fallback' ? {fontFamily: 'serif'} : {})}}>
          {title}
        </AnimatedTitle>
        {fixture !== 'optional' && <VideoText diagnostics={{id: 'qa-subtitle', safeAreaId: 'project-safe', maxLines: fixture === 'wrap' ? 1 : 2,
          expectedFont: {family: 'Atkinson Hyperlegible', weight: 400, style: 'normal'}}}
          style={{fontSize: Math.min(theme.typography.bodySize, width * 0.022), ...(overflow ? {width: 180, height: 25, overflow: 'hidden'} : {})}}>
          {'Locally loaded type, explicit identity.\nReproducible frames, without changing brand defaults.'}
        </VideoText>}
        <VideoGrid columns={2}>
          <VideoCard eyebrow="QUALITY / 01" title="Theme-native surfaces">
            <VideoText variant="caption" diagnostics={{id: 'qa-card', maxLines: 2, safeAreaId: 'project-safe'}}>Typography, cards and precise spacing.</VideoText>
          </VideoCard>
          <VideoCard eyebrow="QUALITY / 02" title="Independent motion" description="Frame-driven, measured and reproducible." />
        </VideoGrid>
      </VideoStack>
    </VideoSafeArea>
    {ready && <Artifact filename="font-readiness.json" content={JSON.stringify({fixture, ready, width, height, frame,
      userAgent: navigator.userAgent, deviceScaleFactor: devicePixelRatio,
      faces: [...document.fonts].map((face) => ({family: face.family, weight: face.weight, style: face.style, status: face.status}))})} />}
    <LayoutProbe compositionId={id} frame={frame} ready={ready} revision={fixture} />
  </VideoSurface>;
}
