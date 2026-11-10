import {useMemo} from 'react';
import {AbsoluteFill, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {colorWithOpacity, motionProgress, resolveTheme, secondsToFrames} from '@code-to-video/themes';
import type {ThemeSelection} from '@code-to-video/themes';
import {VideoThemeProvider, useVideoTheme} from '@code-to-video/themes/react';
import {showcaseRegistry} from './showcase-themes.ts';

export function ThemeShowcase(props: ThemeSelection) {
  // Frame subscription lives in the child: theme resolution is input-dependent only.
  const theme = useMemo(() => resolveTheme(showcaseRegistry, props), [props]);
  return <VideoThemeProvider theme={theme}><ShowcaseScene /></VideoThemeProvider>;
}

function ShowcaseScene() {
  const t = useVideoTheme();
  const frame = useCurrentFrame();
  const {fps, durationInFrames} = useVideoConfig();
  const appear = motionProgress(frame, fps, t.motion);
  const card = motionProgress(frame, fps, t.motion, 2);
  const exitFrames = Math.max(1, secondsToFrames(0.5, fps));
  const fade = Math.min(1, (durationInFrames - 1 - frame) / exitFrames);
  const shape = spring({frame: Math.max(0, frame - secondsToFrames(t.motion.delaySeconds, fps)), fps,
    durationInFrames: Math.max(1, secondsToFrames(t.motion.durationSeconds, fps)), config: {...t.motion.spring}});
  const color = t.colors;
  const border = `${t.border.width}px solid ${colorWithOpacity(color[t.border.color], t.border.opacity)}`;
  const shadow = `0 ${t.shadow.offsetY}px ${t.shadow.blur}px ${colorWithOpacity(color[t.shadow.color], t.shadow.opacity)}`;
  const gradient = t.gradient;
  const text = t.typography;
  const offset = t.motion.distance * t.motion.intensity;

  return (
    <AbsoluteFill style={{backgroundColor: color.background, color: color.foreground,
      fontFamily: text.fontFamily, fontWeight: text.bodyWeight, lineHeight: text.lineHeight}}>
      <AbsoluteFill style={{opacity: gradient.enabled ? gradient.opacity : 0,
        backgroundImage: `linear-gradient(${gradient.angle}deg, ${color[gradient.from]}, ${color[gradient.to]})`}} />
      <AbsoluteFill style={{opacity: t.effects.gridOpacity,
        backgroundImage: `linear-gradient(${color.foreground} 1px, transparent 1px), linear-gradient(90deg, ${color.foreground} 1px, transparent 1px)`,
        backgroundSize: '100px 100px'}} />
      <div style={{position: 'absolute', top: -240, right: -140, width: 1000, height: 1000,
        borderRadius: '50%', opacity: t.effects.glowOpacity,
        background: `radial-gradient(circle, ${color.accent}, transparent 65%)`}} />
      <AbsoluteFill style={{padding: t.spacing.page, justifyContent: 'center', alignItems: 'center', opacity: fade}}>
        <div style={{width: '100%', maxWidth: t.layout.contentWidth}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: t.spacing.gap,
            opacity: appear, color: color.mutedForeground, fontSize: text.captionSize, letterSpacing: 3}}>
            <span>{t.brandName.toUpperCase()}</span>
            <span>{t.styleName.toUpperCase()} / {t.motionName.toUpperCase()}</span>
          </div>
          <div style={{height: 4, width: 92, backgroundColor: color.accent, transformOrigin: 'left', transform: `scaleX(${appear})`, marginBottom: t.spacing.gap}} />
          <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: t.spacing.gap}}>
            <div style={{opacity: appear, transform: `translateY(${(1 - appear) * offset}px)`, flex: 1}}>
              <div style={{fontFamily: text.headingFontFamily, fontSize: text.titleSize, fontWeight: text.headingWeight,
                letterSpacing: text.letterSpacing, maxWidth: 950}}>Ideas, beautifully<br />in motion.</div>
              <div style={{fontSize: text.bodySize, color: color.mutedForeground, marginTop: t.spacing.gap}}>
                One scene. Independent creative identities.
              </div>
            </div>
            <div style={{width: 130, height: 130, marginRight: t.spacing.gap, border: `3px solid ${color.accent}`,
              borderRadius: t.radii.card, opacity: appear,
              transform: `rotate(${(1 - shape) * 45 * t.motion.intensity}deg) scale(${0.7 + 0.3 * shape})`}} />
          </div>
          <div style={{display: 'flex', gap: t.spacing.gap, marginTop: t.spacing.gap * 1.5}}>
            {[
              {label: 'IDENTITY', value: 'Made for your brand', detail: 'Semantic color & typography', swatch: color.primary},
              {label: 'EXPRESSION', value: 'A distinct visual voice', detail: 'Surfaces, spacing & movement', swatch: color.accent},
            ].map((item, index) => {
              const reveal = motionProgress(frame, fps, t.motion, 2 + index);
              return <div key={item.label} style={{flex: 1, padding: t.spacing.cardPadding, borderRadius: t.radii.card, border,
                backgroundColor: colorWithOpacity(color[t.surface.color], t.surface.opacity), boxShadow: shadow,
                opacity: reveal, transform: `translateY(${(1 - reveal) * offset}px)`}}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: t.spacing.gap / 2}}>
                  <span style={{fontSize: text.captionSize, letterSpacing: 2, color: color.mutedForeground}}>{item.label}</span>
                  <span style={{width: 36, height: 12, backgroundColor: item.swatch, borderRadius: t.radii.badge}} />
                </div>
                <div style={{fontSize: text.bodySize + 5, fontWeight: text.headingWeight}}>{item.value}</div>
                <div style={{fontSize: text.captionSize + 3, color: color.mutedForeground, marginTop: t.spacing.gap / 2}}>{item.detail}</div>
              </div>;
            })}
          </div>
          <div style={{marginTop: t.spacing.gap, display: 'flex', justifyContent: 'space-between', opacity: card,
            color: color.mutedForeground, fontSize: text.captionSize}}>
            <span>CODE TO VIDEO — DESIGN SYSTEM STUDY</span><span>01 / FRAME-DRIVEN DESIGN</span>
          </div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}
