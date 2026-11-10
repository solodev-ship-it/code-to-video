# Clay material and depth — Phase 3D.4A

Clay is a bounded 2.5D treatment in the existing `@code-to-video/ui` workspace. It uses semantic theme colors, layered CSS gradients and inset/contact shadows. It does not use WebGL, a 3D engine, live lighting, textures, physics, or runtime asset loading. Existing glass, surface, theme and motion contracts remain unchanged.

## Public API

`@code-to-video/ui/clay` exports `clayPresets`, `validateClayOverrides`, `resolveClay`, and `evaluateClayMotion` with their types. The main UI entry exports `VideoClaySurface`, `VideoClayCard`, and `VideoClayShape`.

`ClaySelection = {preset?: 'soft-panel' | 'sculpted' | 'pressed'; overrides?: ClayOverrides}`. The resolver derives a frozen appearance from a resolved theme, then the selected preset, then explicit overrides. `fill` is a semantic color role. Numeric controls are `radius` (0–120 px), `depth` (0–3), `softness` (0–1), `highlight` (0–0.5), `shadowOpacity` (0–0.7), `inset` (0–0.7), and `borderOpacity` (0–0.5). `lightDirection` is `top-left` or `top-right`. Unknown properties, roles, presets, accessors, explicit undefined, nonfinite and out-of-range values fail. The resolver chooses lighter/darker theme roles for shading; no brand-ID branch or hardcoded brand color exists. Resolve appearance when theme/selection changes, not as per-frame mutable state.

`VideoClaySurface` takes `appearance`, optional `children`, trusted static `style`, and `clipContent` (default true). Its outer contact shadow remains visible while the material overlay is clipped to the radius; content clipping is explicit. Authors must give content enough padding to keep text clear of curved edges. `VideoClayCard` composes the surface with existing `VideoStack` and `VideoText`, accepting `eyebrow`, `title`, `description`, `children`, `footer`, and the same appearance/motion properties. Cards default `clipContent` to false so headings near their padded upper edge are not cut by an inner rounded clip; callers can enable clipping when needed. `VideoClayShape` is decorative by default; `variant` is `orb`, `capsule`, or `disc`, with explicit bounded width/height and optional accessible `label`. Orbs/discs must be square; capsules must be at least as wide as tall.

All three accept an optional `animation` and, when animated, explicit `frame` and `fps`. The animation presets are `reveal`, `float`, `press`, and `depth`. Options reuse existing motion easing/timing (`startSeconds`, `durationSeconds`, `staggerIndex`, `staggerSeconds`, `easing`, `reducedMotion`), with bounded `amplitude` (0–24 px) and `periodSeconds` (0.5–10). Float is a pure sine of frame/FPS, never accumulated state. Reduced motion removes displacement/scale/depth changes and retains only the existing short opacity entrance. Unanimated surfaces remain static.

```tsx
import {VideoClayCard, VideoClayShape} from '@code-to-video/ui';

// Inside VideoThemeProvider; pass Remotion frame/FPS from the scene boundary.
<VideoClayCard appearance={{preset: 'soft-panel', overrides: {depth: 1.4}}}
  animation={{preset: 'reveal', startSeconds: 0.5, reducedMotion}}
  frame={frame} fps={fps} title="An authored idea" description="Clear content in a tactile frame"
  style={{width: 540, height: 320}} />
<VideoClayShape variant="orb" width={120} height={120}
  animation={{preset: 'float', amplitude: 6, periodSeconds: 4}}
  frame={frame} fps={fps} />
```

The shape is already `aria-hidden` when `label` is omitted; an `aria-hidden` prop is not part of its public TypeScript interface. Static `style` is a trusted-code escape hatch, not unrestricted external JSON.

## Rendering and limits

The material uses one opaque theme fill, two bounded gradient layers and a small inset/contact-shadow stack. There is no `backdrop-filter`, noise texture, SVG filter or full-frame blur. The result is a lighting illustration, not geometric 3D: objects do not rotate in perspective, cast physically correct shadows, occlude each other in depth, or respond to a scene light. Future external 3D assets should be staged through a separately approved local asset workflow and composited as authored layers, without making a 3D runtime mandatory for clay components.

Keep material regions modest, avoid overlapping many large shadows, and inspect long text and new aspect ratios. System fonts and theme token combinations can change wrapping/contrast. The 1080p showcase is authored for the existing Aurora/Ember themes and does not certify arbitrary footage or every brand. Large blur/filter suites are deliberately untouched. Human visual approval of old baselines and new clay candidates remains required.

`ClaymorphismShowcase` is one 1920×1080, 30 FPS, 270-frame registration. Its validated props select theme, explicit reduced motion and a `showcase` or `flat` QA fixture. Run `npm run check`, `npm run compositions`, and focused `npm run qa:clay`. The QA command writes unique ignored PNG/MP4/report output under `renders/clay-checks/`; it never approves or replaces visual baselines. `qa:all` still awaits human-approved references.

## Executed validation — November 10, 2026

`npm run check` passed strict TypeScript, 206 fast tests and thirteen Studio-editable literal registrations. `npm run compositions` discovered fourteen compositions. Studio bundled and served HTTP 200 on localhost:3002; interactive playback was not performed. Focused `npm run qa:clay` passed eight representative full-HD stills, five exact independent PNG repeats, visible motion/theme/material differences and full decode of a 270-frame H.264 1920×1080/30 FPS/9-second MP4 (977,508 bytes). The final candidate directory is `renders/clay-checks/clay-1794307625663-436e1c/`, including `report.json`, `settled.png`, `ember.png`, `reduced.png`, and `ClaymorphismShowcase.mp4`. Candidate stills were inspected for clipping and readable layout. The first exploratory render had clipped content and was interrupted; the corrected final run is the passing evidence. Human visual approval remains pending.
