# @code-to-video/ui — video-native foundation

Phase 3B implements a small private React/Remotion workspace, not a complete component/template library. It reuses `@code-to-video/themes`; no new third-party dependency is introduced. Source exports target the existing TypeScript-aware bundler; publishing compiled packages is deferred.

Phase 3C extends these APIs compatibly with versioned local-font manifests, exact requirements, an explicitly owned deduplicating loader and opt-in text/safe-area diagnostics. Node capture/pixel-comparison dependencies live at the root under `scripts/qa`, not in this browser package. See [RENDERING_RELIABILITY.md](../../docs/RENDERING_RELIABILITY.md).

## Components

| Component | Purpose |
| --- | --- |
| `VideoText` | Theme-driven title/heading/body/caption typography and semantic color roles |
| `AnimatedTitle` | `VideoText` title plus deterministic entrance motion |
| `VideoSurface` | Token-driven `panel`, full-scene `canvas`, or unstyled `plain` treatment |
| `VideoGlassSurface` | Bounded theme-native glass appearance, optional noise/effects and explicit fallback |
| `VideoIcon` | Explicit registry-backed local SVG, theme color and bounded frame-driven effects |
| `VideoDynamicIsland` | Sequential compact/expand/hold/collapse container with optional existing glass surfaces |
| `VideoCard` | Reusable surface with optional eyebrow/title/description/content/footer slots |
| `VideoStack` | Explicit row/column flex layout and token-default gap |
| `VideoGrid` | Fixed 1–12 equal-width columns, not responsive breakpoints |
| `VideoSafeArea` | Absolute, pixel-inset content region; defaults to theme page spacing |
| `VideoMotion` | Reusable frame-driven fade/slide/scale/reveal wrapper with stagger timing |
| `LocalFontGate` | Opt-in Remotion capture gate for approved same-origin font files |

All visual components consume an existing `VideoThemeProvider`. No brand is selected implicitly. `AnimatedTitle` and `VideoMotion` require explicit `frame` and `fps`; they do not subscribe to wall-clock playback or assume sequential frames.

```tsx
import {useCurrentFrame, useVideoConfig} from 'remotion';
import {AnimatedTitle, VideoCard, VideoGrid} from '@code-to-video/ui';

// Render inside VideoThemeProvider using an already resolved theme.
function MyContent() {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return <>
    <AnimatedTitle frame={frame} fps={fps} animation={{preset: 'slide', startSeconds: 0.3}}>
      A story worth telling
    </AnimatedTitle>
    <VideoGrid columns={2}>
      <VideoCard title="First idea" description="Theme-native foundations" />
      <VideoCard title="Second idea" description="Custom content remains welcome" />
    </VideoGrid>
  </>;
}
```

`@code-to-video/ui/motion` exports pure `evaluateMotion`, `motionStyle`, `stagger`, timing conversion, and types. `/fonts` retains legacy font APIs and adds `validateFontManifest`, `assertRequiredFonts`, and `createLocalFontLoader`. Fonts remain opt-in: original demos keep system stacks, while one new QA fixture explicitly uses the included small OFL faces. License metadata for arbitrary future fonts is a human attestation, not automated legal verification.

`/diagnostics` exports typed findings, pure evaluation/frame-aware geometry and opt-in browser measurement. `/diagnostics/react` exports `LayoutProbe`, emitting a JSON Remotion artifact at selected frames. `VideoText`/`AnimatedTitle` accept optional diagnostic policies; `VideoSafeArea` adds optional ratio/pixel margins, frame dimensions and development outlines without changing existing defaults.

From the repository root:

```sh
npm run check
npm run test:components
npm run studio
npm run render:components:aurora
npm run render:components:ember
```

Select `ComponentShowcase`, `ComponentAuroraCinematic`, or `ComponentEmberMinimal`. Existing intro/theme compositions remain available and existing renders are not overwritten.

Phase 3D.1 adds `/surfaces` pure immutable appearance/preset resolution and material animation, `VideoGlassSurface`, and optional `appearance`/`filterMode`/`animationState` props on `VideoSurface` (panel only) and `VideoCard`. Existing default markup/semantics are preserved; no duplicate glass-card/panel wrapper is needed. See [ADVANCED_SURFACES.md](../../docs/ADVANCED_SURFACES.md) for APIs, actual-render evidence, fallback and performance.

Phase 3D.2 adds pure `/icons` and `/island` state helpers, optional `/icons/adapters`, `VideoIcon`, `VideoDynamicIsland` and five small information presentations. Generic UI imports no Lucide/Phosphor catalog; only the Studio host installs those optional packages. See [ICONS_AND_DYNAMIC_ISLAND.md](../../docs/ICONS_AND_DYNAMIC_ISLAND.md).

Full foundation APIs, motion behavior, font provenance requirements, extension patterns, Studio default-props investigation, and limitations are in [COMPONENT_SYSTEM.md](../../docs/COMPONENT_SYSTEM.md). Advanced charts, clay materials and complete scene templates are not included.
