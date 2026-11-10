# Component System — Phase 3B

Phase 3D.2 adds catalog-independent icons, optional static icon adapters, a deterministic Dynamic Island container and composable information presentations. Existing public defaults remain unchanged. Current APIs/evidence: [ICONS_AND_DYNAMIC_ISLAND.md](ICONS_AND_DYNAMIC_ISLAND.md); historical foundation scope below is preserved.

Phase 3D.1 adds `VideoGlassSurface` and optional `appearance`, `filterMode`, `animationState` on `VideoSurface` (panel only) and `VideoCard`, preserving all existing default paths. Pure appearance/preset/animation data lives at `@code-to-video/ui/surfaces`. See [ADVANCED_SURFACES.md](ADVANCED_SURFACES.md) for the implemented API, renderer evidence, fallback and limitations. Historical foundation scope below is not a claim that these additions were present in Phase 3B.

This document records the Phase 3B foundation and its original validation limits. Phase 3C extends the same APIs with actual licensed local-font QA, owned loader/requirements, opt-in diagnostics and visual comparison; see [RENDERING_RELIABILITY.md](RENDERING_RELIABILITY.md). Original scene/template scope and default typography remain unchanged.

## Implemented boundary

`packages/ui` is a real private workspace for video-native React components. It depends on the existing theme workspace and peers with the installed React/Remotion versions. No Next.js, Tailwind, dashboard, third-party UI system, animation library, or new external package is added.

The main entry exports components and their props. `/motion` exports pure frame math and motion types; `/fonts` exports local font metadata validation/loading and types. Pure helper subpaths do not import the component tree or Remotion runtime. The Node test-only TSX hook reuses installed TypeScript; it is not part of browser rendering.

Shared primitives are separate from complete scene templates. `ComponentShowcase` is an authored demonstration using the primitives, not a project manager, a structural-variant registry, or a promise that all layouts fit every token combination. Original intro/theme scene implementations and theme contracts are unchanged.

## Theme integration

Resolve a theme with `resolveTheme(registry, selection)` outside frame-dependent work, then wrap your scene with `VideoThemeProvider` from `@code-to-video/themes/react`. Components consume `useVideoTheme()`; missing context throws rather than choosing an unrelated brand.

Identity, style, motion, and bounded scene overrides retain the Phase 3A precedence and ownership described in [THEME_SYSTEM.md](THEME_SYSTEM.md). Components never inspect company IDs or style IDs. Colors/fonts come from tokens; numeric layout choices and structural variants are authored independently.

All component `style` props are trusted-code `CSSProperties` escape hatches, not validated project JSON. They apply after base styles, except `VideoMotion` reserves opacity/transform/clipPath/transformOrigin for its motion result. Use styles for deliberate static layout overrides; never introduce CSS keyframes/transitions, event-driven dimensions, or brand exceptions. Prefer resolved scene overrides when changing the design system itself.

## Component APIs

### `VideoText`

Props: required `children`; optional `variant: 'title' | 'heading' | 'body' | 'caption'`, `tone: ColorRole`, `as: 'div' | 'span' | 'p' | 'h1' | 'h2' | 'h3'`, `align: 'left' | 'center' | 'right'`, and `style`.

Defaults: body, foreground, div, left. Title/heading use heading font/weight/letter spacing; body/caption use body font/weight. Heading size is `titleSize * 0.4`; other sizes map directly to theme tokens. Margins reset to zero, whitespace is preserved, and long words may wrap. Text is not auto-fitted, measured, truncated, or guaranteed to fit every language.

### `AnimatedTitle`

Accepts `VideoText` props except `variant`, plus required `frame` and `fps` and optional `animation` motion options. Defaults to a slide entrance and title typography rendered as h1. Override `as` for another heading level. `style` affects the text; use `VideoMotion` directly when a layout wrapper needs its own styling.

### `VideoSurface`

Props: optional `children`, `variant: 'panel' | 'canvas' | 'plain'`, `style`.

- `panel` (default): resolved fill/opacity, card radius, border, and shadow.
- `canvas`: brand background plus resolved gradient/grid/glow layers and a relative content region. Set explicit width/height, typically 100% of the composition. Decorative layers are static and pointer-inert.
- `plain`: relative, border-box/min-width foundation without a fill/border/shadow.

These are explicit component treatments, not branches for cinematic/minimal/brand names. Canvas content has a wrapper with 100% height; parent dimensions must be definite.

### `VideoCard`

Optional slots: `eyebrow`, `title`, `description`, `children`, `footer`; optional `style`. Built from `VideoSurface`, `VideoStack`, and `VideoText`. Token-driven padding and slot gaps; title uses heading typography, descriptions use muted caption typography, and eyebrows use accent. Custom content/footer remains arbitrary authored React. Card height fills its container; equal-row layout still depends on the parent grid.

### `VideoStack`

Required `children`; optional `direction: 'row' | 'column'` (column), `gap` (theme gap), `align: 'flex-start' | 'center' | 'flex-end' | 'stretch'`, `justify: 'flex-start' | 'center' | 'flex-end' | 'space-between'`, and `style`.

No implicit media queries or viewport reflow. Use explicit composition-aware dimensions.

### `VideoGrid`

Required `children`; optional integer `columns` from 1–12 (default 2), `gap`, and `style`. Uses `repeat(columns, minmax(0, 1fr))`. Gaps inherit the theme; invalid column counts/gaps fail clearly. No masonry, responsive auto-fit, or DOM measurement.

### `VideoSafeArea`

Required `children`; optional `inset` as one pixel number or complete `{top, right, bottom, left}`, plus `style`. Defaults to `theme.spacing.page`. Absolutely fills a positioned parent and uses border-box padding. Numeric gaps/insets are finite values in [0, 1000]. It is an author-controlled safe region, not platform-specific broadcast/social safe-area certification. Keep combined insets smaller than the composition dimensions.

### `VideoMotion`

Required `children`, `frame`, `fps`; optional `style` and motion options below. It reads theme motion tokens and wraps arbitrary React content. `frame` is local to the scene/Sequence: pass Remotion's `useCurrentFrame()` and `useVideoConfig().fps` at the scene boundary, not wall-clock values. Components can also be evaluated outside Remotion with explicit frames, as done in SSR tests.

## Motion primitives

`evaluateMotion(frame, fps, theme.motion, options)` returns numeric `MotionState` with progress, opacity, translation, scale, and reveal percentage. `motionStyle(state)` creates React styles. Supported presets:

| Preset | Treatment |
| --- | --- |
| `fade` | Eased opacity from 0 to 1 |
| `slide` | Fade plus directional pixel displacement settling at zero |
| `scale` | Fade plus restrained scale settling at one |
| `reveal` | Fade plus left-to-right rectangular clipping, removed at completion |
| `stagger` utility | Deterministic scheduling, composed with any entrance preset |

`stagger(index, spacingSeconds, startSeconds = 0)` returns a delayed start time; it is not a fifth visual transform. Wrappers support `staggerIndex` and `staggerSeconds`, applying the same scheduling internally.

Options: `preset`, `startSeconds`, `durationSeconds`, `easing`, `staggerIndex`, `staggerSeconds`, `direction: 'up' | 'down' | 'left' | 'right'`, `distance`, `fromScale`, `reducedMotion`. Defaults come from resolved motion tokens; scale begins at 0.94 and slide moves up by default. Duration is finite in (0, 10], distance in [0, 200], fromScale in [0.5, 1], and stagger inputs are nonnegative. Invalid timing/FPS fails. Travel is multiplied by motion intensity; scale intensity is capped at 1 to avoid exaggerated shrinking.

The implementation reuses Phase 3A's `motionProgress`, easing profiles, and nearest-integer seconds-to-frames convention. No second easing library, spring engine, randomness, timers, CSS animation, or sequential-frame state is added. These are entrance primitives, not a full timeline or exit-transition system.

`reducedMotion: true` is an explicit render input: it retains start/stagger scheduling but uses an opacity-only fade capped at 0.15 seconds, with no displacement, scale, or clipping. It does not read browser/OS preferences, because those would make renders machine-dependent. The showcase's final fade is also frame-based.

Example inside an existing provider:

```tsx
<VideoMotion frame={frame} fps={fps} preset="slide"
  startSeconds={1.5} durationSeconds={0.9}
  staggerIndex={index} staggerSeconds={0.2} reducedMotion={false}>
  <VideoCard title="An independent idea" />
</VideoMotion>
```

## Font strategy and minimal loading support

### Current samples

The intro uses Helvetica Neue/Arial; Aurora uses Helvetica Neue/Arial; Ember uses Georgia headings and Arial body. These remain local system font stacks. No font files were downloaded, redistributed, bundled, or required for the new showcase. System fonts can change glyphs, wrapping, and pixels across machines. Current render evidence applies to the tested macOS environment only.

### Future licensed project fonts

1. Obtain human approval of embedding/redistribution rights for each face and usage context. Preserve the actual license text, attribution, source, version, and file hash in the eventual project asset records; do not treat an agent's assertion as legal verification.
2. Keep production font files with the future project asset store, or intentionally small licensed engine fixtures only after explicit approval. Stage approved files through Remotion's public directory; there is no external-project asset loader yet.
3. Give custom font families unique names, enumerate required weights/styles and language coverage, and select those names in brand/scene typography tokens. Do not mutate a resolved theme.
4. Load exact faces before capture. Reject failures rather than silently replacing final typography with another font; review wrapping/readability and record renderer/font versions.

### Implemented API

`LocalFontDefinition` has required `family`, same-origin public `src`, integer `weight` (100–900), `style: 'normal' | 'italic'`, and `license: {name, source, redistributionApproved: true}`. The license fields are an explicit human attestation, **not** automatic license discovery or proof of legal rights.

`validateLocalFonts` validates/copies definitions and rejects duplicate family/weight/style triples, remote URLs, traversal, and missing approval. Paths are simple root-relative public URLs such as `/fonts/ApprovedFace.woff2`, not absolute filesystem paths. Supported suffixes are woff/woff2/ttf/otf; use simple ASCII public paths without URL queries. Files do not exist merely because a descriptor validates.

`loadLocalFonts(definitions)` loads all faces through the browser `FontFace` API before adding any to `document.fonts`. A missing/invalid file rejects with family/weight/style/path information; there is no fallback download. Empty lists work outside a browser. A small optional `FontEnvironment` argument enables mocked load/failure tests, not a production service layer. Font faces remain installed for that document's lifetime; automatic unloading, shared caches, and conflict resolution are not implemented. Keep one stable gate/definition list per composition rather than mounting loaders per card or frame.

`LocalFontGate` accepts `fonts`, `children`, and optional `timeoutMs` (default 15000; 1–120000). It uses a layout effect and a separately owned Remotion delay handle per effect, including StrictMode cleanup/restart. Captures wait until loading succeeds; errors call `cancelRender`; timeout bounds stalled loading. This readiness timeout is not an animation clock.

Illustrative integration **only after adding and reviewing the real local file/license**:

```tsx
import {LocalFontGate} from '@code-to-video/ui';
import type {LocalFontDefinition} from '@code-to-video/ui/fonts';

// Keep this array outside frame-rendered components. These are illustrative names,
// not a bundled font or an assertion that a font license has been approved.
const fonts: readonly LocalFontDefinition[] = [{
  family: 'Approved Project Sans', src: '/fonts/ApprovedProjectSans.woff2',
  weight: 400, style: 'normal',
  license: {name: 'ACTUAL REVIEWED LICENSE', source: 'ACTUAL PROVENANCE', redistributionApproved: true},
}];
// <LocalFontGate fonts={fonts}><YourThemedScene /></LocalFontGate>
```

Validation/loading behavior is unit-tested with mock faces; no licensed success fixture is included, so real-font capture/readiness across browsers has **not** been end-to-end verified. System-font fallbacks are not automatically checked by the gate. Binary license verification, asset hashes, glyph coverage, variable-font axes, and font subsetting remain future work.

## Studio warning: cause and resolution

Warning: `Can't save default props: Could not find or extract defaultProps for composition 'ThemeEmberMinimal'.`

Reproduced using the actual `@remotion/codemods` extractor shipped with CLI 4.0.541. Previously `Root.tsx` generated registrations through `.map()`, with `id={id}` and `defaultProps={selection}`. Runtime registration/rendering succeeded, but Studio's source-editing AST extractor could not locate a literal composition ID and statically extract an object. Referenced/imported defaults and spread expressions are also not generally editable by this extractor. The failure was not a theme schema error and was not fixed by adding Zod.

Fix: the five theme registrations and three new component registrations use explicit literal IDs and inline literal defaultProps in `Root.tsx`. They still share scene components and validators. Small registration boilerplate is intentional to preserve Studio editing. The intro registration remains unchanged because it does not use theme default props.

`npm run test:studio-props` reproduces the old failure, verifies extraction for all eight editable registrations, changes defaults through Remotion's real codemod **in memory**, and verifies extraction of the changed values. It writes no source files. This check is part of `npm run check`. It uses a pinned transitive CLI internal diagnostic API, not a production rendering import; revisit it when upgrading Remotion.

`Root.tsx` is now the authoritative source for Studio-saved defaults. `showcaseDefaults`/`showcasePresets` in `showcase-themes.ts` are retained as compatible example selections/test fixtures; changing them no longer changes literal registrations. Edit Root defaults or use inputProps. No warning is suppressed, no node_modules code is patched, and no unrelated scene implementation is changed. In-memory save-path checks are not a claim that a manual browser Save click was performed.

A separate startup smoke test also found that appending `--port` to the old script duplicated its hardcoded port flag. The script now lets Remotion choose its default port (normally 3000), so `npm run studio --workspace=@code-to-video/studio -- --port=3001` supplies only one value. Custom-port Studio HTTP readiness was verified after this correction; it is separate from the defaultProps issue.

## Adding components and custom structural variants

Add an independent typed module under `packages/ui/src`, export it from the entry point, and add token/motion/SSR tests plus a focused render example. Consume existing theme tokens instead of brand/style names. Add a new token only for a demonstrated shared need, with version/validation/default decisions and backward-compatibility tests. Do not update unrelated scenes merely to register a new component.

For a structural variant, compose existing primitives in trusted React code rather than extending JSON with arbitrary HTML/CSS/functions. For example, an app-local quote layout can use a row stack, an accent rule, and text:

```tsx
function QuotePanel({quote, source}: {quote: string; source: string}) {
  return <VideoCard footer={<VideoText variant="caption" tone="mutedForeground">{source}</VideoText>}>
    <VideoStack direction="row">
      <VideoText variant="heading" tone="accent">“</VideoText>
      <VideoText variant="heading">{quote}</VideoText>
    </VideoStack>
  </VideoCard>;
}
```

This changes structure, not identity. Keep a one-off variant app-local; extract it only after real reuse. No generalized template/plugin registry is needed. AI agents should inspect current props/tokens, make small changes, preserve existing defaults/output files, test independent frames, and request visual/rights approval. Never download fonts or add UI packages just to make a new component look different.

## Showcase and validation commands

```sh
npm run studio
npm run compositions
npm run check
npm run test:components
npm run render:components:aurora
npm run render:components:ember
```

Select `ComponentShowcase`, `ComponentAuroraCinematic`, or `ComponentEmberMinimal`. All are 1920×1080, 30 FPS, 270 frames / 9 seconds. InputProps use the same versioned theme selectors with an additional optional boolean `reducedMotion` (default false); unknown IDs/fields fail validation. Cinematic/minimal and both brands are supported without modifying the scene.

Example using existing selection JSON:

```sh
npm run studio --workspace=@code-to-video/studio -- --props=../../examples/themes/ember-minimal.json
```

Select a component composition in Studio. To render arbitrary inputProps to a new filename:

```sh
npm exec --workspace=@code-to-video/studio -- remotion render src/index.ts ComponentShowcase ../../renders/MyComponentStudy.mp4 --props=../../examples/themes/ember-minimal.json --codec=h264 --concurrency=1 --disallow-parallel-encoding --overwrite=false
```

Root render shortcuts write dedicated `ComponentAuroraCinematic.mp4` and `ComponentEmberMinimal.mp4` files under ignored `renders/`. Archive previous outputs deliberately before rerunning; existing intro/theme MP4s are not replaced. Frame tests preserve uniquely named output runs and validate all four brand/style combinations, reduced motion, repeated independent frames, and invalid-props rejection.

## Performance and rendering constraints

- Resolve themes once per input change. Pass explicit frame/FPS only where animation is needed; keep static primitives free of frame subscriptions.
- Keep dimensions explicit; avoid runtime media queries, viewport/OS preference dependencies, measurement loops, CSS animation, live network content, and shared mutable frame state.
- Use restrained transform/opacity/reveal animation. Clipping may crop shadows or overflow intentionally; choose a different wrapper for content that must extend outside a reveal.
- Avoid large blur/filter layers, oversized textures, unnecessary wrappers, and per-frame font loading. Current canvas effects are static gradients/grid, not full glass/clay materials.
- Current components are fixed-frame, not responsive application widgets. Extreme valid tokens, long copy, unsupported glyphs, and new aspect ratios require visual inspection. No automatic text fitting or formal contrast audit exists.
- Run CLI render checks sequentially to avoid shared webpack-cache contention; samples render with concurrency 1 and parallel encoding disabled.
- Tests cover pure math, SSR output, metadata validation, and actual still/MP4 rendering on the documented macOS environment. Visual comparisons are within that environment, not cross-platform pixel guarantees or human-approved golden baselines.

Phase 3C should prioritize font/typography reliability with a human-approved fixture, text/safe-area QA, and a small reviewed visual-regression matrix. Complete scene templates, Dynamic Island, advanced charts, full material effects, and AI production automation remain outside this foundation.
