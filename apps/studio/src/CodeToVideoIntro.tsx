import {AbsoluteFill, useCurrentFrame, useVideoConfig} from 'remotion';
import {easeOutCubic, progress} from './motion.ts';

// Sample-local art direction only. A reusable multi-brand theme system is deferred.
const look = {
  background: '#080d17',
  surface: '#142137',
  text: '#f2f5fa',
  muted: '#a6b4c8',
  accent: '#82e6cd',
  grid: 'rgba(166, 180, 200, 0.045)',
  fontFamily: 'Helvetica Neue, Arial, sans-serif',
} as const;

export function CodeToVideoIntro() {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const title = easeOutCubic(progress(frame, 0.3 * fps, 1.1 * fps));
  const subtitle = easeOutCubic(progress(frame, 0.9 * fps, 0.9 * fps));
  const line = easeOutCubic(progress(frame, 0.2 * fps, 1.2 * fps));
  const fadeOut = 1 - progress(frame, 4.4 * fps, 0.6 * fps - 1);
  const drift = progress(frame, 0, 5 * fps - 1);

  return (
    <AbsoluteFill
      style={{backgroundColor: look.background, color: look.text, fontFamily: look.fontFamily}}
    >
      <AbsoluteFill
        style={{
          background: `radial-gradient(ellipse at 50% 38%, ${look.surface} 0%, ${look.background} 68%)`,
          transform: `scale(${1 + drift * 0.04})`,
        }}
      />
      <AbsoluteFill style={{
        backgroundImage: `linear-gradient(${look.grid} 1px, transparent 1px), linear-gradient(90deg, ${look.grid} 1px, transparent 1px)`,
        backgroundSize: '120px 120px',
        maskImage: 'radial-gradient(ellipse at center, black, transparent 74%)',
        opacity: 0.7 * fadeOut,
      }} />
      <AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', opacity: fadeOut}}>
        <div style={{width: 72, height: 3, marginBottom: 42, backgroundColor: look.accent,
          transform: `scaleX(${line})`, opacity: line}} />
        <div style={{fontSize: 112, fontWeight: 700, letterSpacing: 12, lineHeight: 1.1,
          opacity: title, transform: `translateY(${(1 - title) * 38}px)`}}>
          CODE TO VIDEO
        </div>
        <div style={{marginTop: 28, fontSize: 30, fontWeight: 400, letterSpacing: 4,
          color: look.muted, opacity: subtitle, transform: `translateY(${(1 - subtitle) * 18}px)`}}>
          AI-Powered Video Production
        </div>
        <div style={{marginTop: 52, display: 'flex', gap: 10, opacity: subtitle * 0.8}}>
          {[0, 1, 2].map((index) => (
            <div key={index} style={{width: index === 1 ? 32 : 6, height: 6,
              borderRadius: 3, backgroundColor: index === 1 ? look.accent : look.muted}} />
          ))}
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
}
