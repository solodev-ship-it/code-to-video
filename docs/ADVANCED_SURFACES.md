# Advanced Surfaces — Phase 3D.1

## Status and architecture

Implemented in the existing UI workspace, without new dependencies or changes to theme contracts. Human visual approval is **pending** for both the pre-existing Phase 3C references and the new candidates. Technical capture is not approval. Phase 3D.2 now consumes this unchanged surface API; see [ICONS_AND_DYNAMIC_ISLAND.md](ICONS_AND_DYNAMIC_ISLAND.md). Clay materials, complete templates and production orchestration remain unimplemented.

**Finalization update:** the glass showcase's ordinary small labels now use the existing semantic foreground locally, not accent. No global theme/shared card API changed. Actual glyph-hidden rendered-background regressions cover 176 labels, with worst Ember contrast 6.858:1. The historical contrast paragraph below records the pre-correction evidence. Latest handoff, inspection notes, artifacts and approval commands: [PHASE_3D1_FINALIZATION.md](PHASE_3D1_FINALIZATION.md).

- `@code-to-video/ui/surfaces`: pure, React/Remotion-runtime-free appearance resolution, validation, immutable serializable data, and surface animation evaluation. It reuses `/motion` timing rather than adding a timeline engine.
- `VideoGlassSurface`: theme-context rendering, explicit filter mode and optional evaluated animation state. No frame subscription, browser measurement, filesystem or network request.
- `VideoSurface`: its existing `panel`, `canvas`, `plain` semantics and default markup remain unchanged. Optional `appearance` delegates **panel only** to the glass renderer; contradictory variants throw.
- `VideoCard`: retains every slot, default layout and typography. Optional appearance/filter/state props pass through. A card already provides the needed glass-card structure; a sized `VideoGlassSurface` is the panel. There are no redundant card/panel classes.
- `GlassmorphismShowcase`: one literal 1920×1080, 30 FPS, 300-frame registration. All original ten registrations remain. Scene-local synthetic backgrounds and fixture controls are not a new public template API.

Themes still resolve defaults → style → brand → motion → scene overrides. Surface resolution consumes that immutable snapshot; it does not change tokens or register themes. Cache resolutions by stable selection/theme identity, outside frame work. Components use `useMemo`; hoist appearance objects rather than constructing them per frame. The showcase pre-resolves its animation appearances independently of frame updates.

## Data contract

`SurfaceSelection = {preset?: SurfacePreset; overrides?: SurfaceOverrides}`. Resolve with `resolveSurface(theme, selection)`, accepting unknown data. `validateSurfaceOverrides(unknown)` validates/copies/freezes the flat override object. `SurfaceAppearance` is a flat, frozen snapshot; inputs and themes are never mutated. Unknown keys/presets/variants/roles, accessors, nonplain objects, symbols, explicit undefined, nonfinite or out-of-range numbers fail. Values are **rejected**, not silently clamped.

| Field | Meaning / bounds |
| --- | --- |
| `variant` | `solid`, `translucent`, `frosted-glass`, `elevated-glass`, `outlined`, `luminous`, `custom` |
| `tint`, `borderColor`, `shadowColor` | Existing semantic color roles, not arbitrary CSS or brand IDs |
| `opacity`, `borderOpacity`, `shadowOpacity`, `fallbackOpacity` | 0–1, multiplied by any alpha already present in the theme color |
| `borderWidth`, `radius` | 0–12 / 0–120 composition pixels |
| `blur` | 0–24 composition pixels |
| `saturation` | 0–2 |
| `highlight`, `glow` | 0–1 |
| `noise` | 0–0.15 |
| `elevation` | 0–3; increases offset/softness of two bounded shadow layers |

No selection returns existing surface/border/radius/shadow token values and no blur/highlight/glow/noise. Selecting a preset applies its material data. An explicit override `variant` applies its small structural defaults, then individual overrides win. Solid always disables blur/saturation; outlined always removes fill/blur/drop-shadow, including simulated-frost fill. Other variants provide starting treatments, not shader/plugin dispatch. `custom` retains inherited/preset values for explicit overrides.

The renderer derives two shadow layers from existing shadow offset/blur plus elevation, and a separate accent glow. Presets choose the darker of the theme's background/foreground roles using a weighted RGB brightness heuristic, avoiding a bright drop-shadow on dark themes. This is a shadow-design heuristic, **not** a contrast certification. The no-preset default retains the existing shadow color role. Explicit `shadowColor` wins.

## Presets

| Preset | Tint / alpha | Blur | Treatment |
| --- | --- | --- | --- |
| `cinematic-frost` | background / .76 | 14 | Foreground outline, .12 highlight, soft depth |
| `minimal-clear` | background / .84 | 5 | Restrained highlight and shallow shadow |
| `aurora-glass` | background / .80 | 16 | Accent border and .12 glow, elevated depth |
| `ember-glass` | background / .88 | 10 | Accent illumination, .06 glow, restrained warmth |

The last two names describe authored treatments, **not brand selection**. Both work with every registered brand. Aurora's semantic accent makes cyan illumination over navy; Ember's makes coral over warm neutrals. Components never inspect brand/style IDs. Radius, typography and layout remain theme-driven. Minimal style therefore retains its square radius unless explicitly overridden. No duplicated brand hex definitions are introduced.

## Components and example

`VideoGlassSurfaceProps`: optional `children`, `appearance`, `filterMode: 'backdrop' | 'frosted'` (default backdrop), `animationState`, and trusted static `style: CSSProperties`. Default appearance is cinematic frost. Set width/height with style; the component does not infer browser viewport dimensions. Child content has a relative, full-height region. There is no implicit padding; use `VideoCard` for token-driven spacing. Borders, highlights and noise follow radius; shadows are not clipped by the surface. Parent clipping is still the scene author's responsibility.

```tsx
import {VideoCard, VideoGlassSurface, VideoMotion} from '@code-to-video/ui';
import {resolveSurface, evaluateSurfaceAnimation} from '@code-to-video/ui/surfaces';

// Stable authored data; inside an existing VideoThemeProvider.
const appearance = {preset: 'cinematic-frost', overrides: {noise: 0.025}} as const;
// Resolve once per theme/appearance change, NOT per frame:
// const resolved = useMemo(() => resolveSurface(theme, appearance), [theme]);
// const state = evaluateSurfaceAnimation(frame, fps, theme.motion, resolved,
//   {startSeconds: 1, durationSeconds: 1.2, reducedMotion});

// Entrance opacity/translation/scale uses existing VideoMotion:
// <VideoMotion frame={frame} fps={fps} preset="slide" reducedMotion={reducedMotion}>
//   <VideoCard appearance={appearance} animationState={state}
//     title="A clear hierarchy" description="Measured, frame-native depth."
//     style={{width: 640, height: 400}} />
// </VideoMotion>

// Explicit lower-complexity panel fallback (not real background diffusion):
// <VideoGlassSurface appearance={appearance} filterMode="frosted"
//   style={{width: 900, height: 500, padding: 40}}>...</VideoGlassSurface>
```

`VideoSurface`/`VideoCard` accept the same optional `appearance`, `filterMode`, `animationState`. Static style escape hatches are trusted author code, **not externally validated JSON**. They can override material CSS; their visual/deterministic correctness remains the caller's responsibility.

## Animation

`evaluateSurfaceAnimation(frame, fps, motionTokens, appearance, MotionOptions?)` reuses `evaluateMotion`'s validated timing, easing, start/stagger and reduced-motion behavior. It returns a frozen `{highlightPosition, illumination, blur}`. Highlight position moves from -20% to 120%; border illumination settles from .65 to 1; initial blur is at most 4 pixels above the settled blur, capped at 24. Reduced motion fixes highlight position at 50%, illumination at 1 and blur at its settled value. `VideoMotion` handles opacity, slide, scale or reveal; no competing transform engine is introduced. Reveal clipping can crop shadows: prefer slide/scale for glass.

No wall clock, CSS transitions/keyframes, timers, rAF animation, remote content or mutable frame state. Noise is a local inline SVG with a fixed turbulence seed, not `Math.random`. Single-frame, repeated, parallel-independent and out-of-order captures are tested on the pinned host.

## True blur, fallback and compatibility

`backdrop` uses CSS `backdrop-filter: blur(...) saturate(...)` plus its WebKit-prefixed counterpart. Blur is real diffusion of previously composited content behind the element, not a blur of children. It needs detailed content behind a translucent tint to be visible. The renderer test compares identical detailed checker backgrounds with only blur enabled/disabled and measures interior edge energy. Final ratio **0.00666**, against a strict maximum .35; the unfiltered frame is explicitly rejected as a negative control.

`frosted` removes backdrop filtering and raises tint alpha to at least `fallbackOpacity` (default .94). Borders/highlights/noise/shadows remain. **Underlying detail stays sharp and faint: this is simulated frost, not true blur.** Select this mode deliberately on an untested/slow backend. There is no nondeterministic browser feature-detection branch. Browsers that ignore `backdrop-filter` still get the normal translucent fill, but do not automatically get the denser fallback; authors must select and render-test fallback for their delivery environment.

Tested: macOS/Darwin 25.6.0 arm64, Apple M1 Pro, Node 24.7.0, Remotion 4.0.541, HeadlessChrome 158.0.8127.2, `swangle`, device scale/PNG scale 1. No cross-browser/OS/GPU support guarantee. Opacity/filter/transform ancestors can create backdrop roots or intermediate layers and change what is sampled. Avoid whole-scene opacity and unnecessary nested filters; inspect the actual render rather than trusting CSS support tables.

PNG alpha test verifies surface alpha **168/255** at a .66-alpha interior and **0** outside. H.264/yuv420p MP4 is opaque delivery; PNG alpha is not a transparent-MP4 promise.

## Layering and visual quality

- Use definite composition-relative dimensions and safe regions. Keep text away from rounded edges and layer intersections. No auto-fitting or automatic safe-area certification.
- Default showcase is authored for 16:9; reusable panels have no viewport dependence, but 9:16/1:1 require an authored layout and new visual QA, not an automatic responsive-layout claim.
- Use restrained blur and small filtered regions. Do not blur a whole composition for one panel.
- Keep primary text on a sufficiently dense tint. Bright/high-frequency backgrounds and overlapping panels can change local contrast. Fallback is often preferable to more blur.
- Both brands, dark gradient, light flat, grid, high-frequency checker, overlaps and fallback are captured. Settled showcase title/subtitle/footer/kicker are browser-measured at deliberately selected frames 90/180/299; card text/layout and decorative shadows also require visual inspection. These diagnostics are not glyph-ink measurements.
- The fixtures deliberately call the theme foreground a “light” background; Ember foreground is dark. Across the two brands the stress matrix therefore includes both bright and dark backdrops without hardcoded brand logic.
- Candidate inspections found readable hierarchy and visible blur/borders. No measured whole-frame accessibility compliance is claimed. Small accent labels, arbitrary overrides, translucency over new footage and language shaping still need human review.

**Pre-correction evidence:** representative settled text-token versus text-free card-pixel samples at `(200,550)`, `(800,550)`, `(1500,550)` yielded Aurora foreground 15.14–17.25:1, muted 8.27–9.43:1 and accent 10.97–12.49:1. Ember yielded foreground 11.54–12.68:1, muted 5.13–5.64:1 and accent **3.46–3.81:1**. These nearby samples motivated the local informational-label correction; they were not measurements at every actual glyph location. Historical evidence remains in `tests/visual/reports/phase3d1-sampled-contrast.json`. The stricter finalization gate now measures every composited background pixel in actual label line boxes and rejects the original accent treatment. Decorative accents and all global theme colors remain unchanged.

## Reliability, commands and artifacts

```sh
npm run check
npm run compositions
npm run qa:surfaces -- surfaces-UNIQUE
```

Run slow suites sequentially. The new suite uses established `captureCases`, environment/source fingerprints, JSON reports, exact comparison and cached-browser sessions. It does **not** change the existing 14-case matrix, references, comparison thresholds or approval workflow. `qa:all` remains the Phase 3C gate; run `qa:surfaces` alongside it for Phase 3D.1 validation. Capture runs refuse overwrite.

The 46 cases include four brand/style combinations at frames 15/90/180/299, both brands over four synthetic backgrounds with glass/fallback/overlaps, no-blur/solid/alpha/border-off/shadow-off controls and reduced motion. Every case has an exact repeat. Renderer-backed numeric assertions cover blur, border/shadow visibility, alpha, fallback/theme/layer differences. Fast tests include negative metrics that reject unchanged/uninformative images. Every unexpected failure remains nonzero; there is no generic “failed means expected” matcher.

Final run:

- Capture report: `tests/visual/reports/phase3d1-surfaces-final-capture.json`
- Material/performance/MP4 report: `tests/visual/reports/phase3d1-surfaces-final-surfaces.json`
- Candidate directory: `tests/visual/current/phase3d1-surfaces-final/`
- Aurora settled still: `aurora-finance-cinematic-glass-f180-9a27bb1694db.png`
- Ember settled still: `ember-studio-minimal-glass-f180-43b1f1d0ba40.png`
- MP4: `tests/visual/current/phase3d1-surfaces-final-media/GlassmorphismShowcase.mp4` — H.264, 1920×1080, 30 FPS, 300 decoded frames, 10 seconds, 778,310 bytes, full ffmpeg decode passed.

All are generated ignored artifacts, **unapproved candidates**, not new reference images. Use the existing named-case human approval workflow only after actual human review. Existing Phase 3C candidates and baselines are preserved. MP4 diagnostics are disabled: the existing `LayoutProbe` emits `layout.json`, a fixed artifact name suitable for a still but not multiple frames in one video. In this scene `diagnostics: true` is explicitly a selected-still QA option, not for full-video rendering.

## Performance

Representative full-HD frame-180 captures, fixed synthetic checker and label, same cached bundle/browser, concurrency 1, one warmup then three measured samples per workload. Times include composition selection, page/capture and PNG encoding; exclude initial bundling/browser startup. This is a small single-machine latency comparison, not a GPU profiler or a universal throughput claim.

| Workload | Median capture latency | Relative to solid |
| --- | --- | --- |
| One solid panel | 455.86 ms | 1.00× |
| One glass panel | 570.44 ms | 1.25× |
| Three overlapping glass panels | 727.16 ms | 1.60× |

Raw samples and environment are in the material report. Prefer minimal clear, reduced motion, lower blur, or explicit simulated frost on constrained delivery workers. The benchmark does not establish long-video memory/thermal behavior or optimal concurrency.

## Failures retained and future extension

Initial attempts remain in ignored reports/logs: zero-width hidden metadata geometry was fixed by definite frame dimensions; an intermittent one-channel pixel in the scene's large radial backdrop was eliminated by simplifying that new backdrop to a linear gradient (removing rotation alone was insufficient). Thresholds stayed at zero. A full-video attempt correctly rejected duplicate `layout.json` artifacts; diagnostics are now opt-in still-only for this scene. No old scene/theme was changed to make these tests pass.

Future material work can extend this bounded appearance contract and a separate renderer after a demonstrated need, preserving existing variant/preset semantics and tests. Claymorphism may eventually need explicit lighting/inset-shadow data rather than overloading blur. It is **not implemented** here. Icons/Dynamic Island require separate Phase 3D.2 authorization, deterministic vector assets and their own layout/motion/rights tests; they are not hidden dependencies of surfaces.
