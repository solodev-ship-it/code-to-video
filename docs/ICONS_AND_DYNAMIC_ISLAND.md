# Icons and Dynamic Island — Phase 3D.2

## Implemented architecture

`packages/ui` supplies a catalog-independent `VideoIcon`, an explicitly owned icon registry/adapters, a pure island state evaluator, `VideoDynamicIsland` and five small information presentations. Existing motion evaluation and surfaces are reused. No singleton, dynamic import registry, browser timer, network asset service, phone simulator or second animation engine is introduced.

The Studio app registers six selected icons at initialization and seals its registry. `DynamicIslandShowcase` is one literal 1920×1080, 30 FPS, 330-frame / 11-second composition. Its `icons` fixture validates icons without adding a redundant `IconShowcase` registration. The original eleven compositions remain (twelve total).

## Optional packages and licensing

Only Studio adds `lucide-react` **1.71.0** and `@phosphor-icons/react` **2.1.10**, pinned in its manifest/lockfile. Published React peers accept React 19. Both render local SVG, with no CDN requests. Generic UI/adapters import neither icon package, so consumers can use only custom icons or a single optional library.

Studio uses direct `lucide-react/icons/bell`, `check`, `arrow-up-right` imports and direct Phosphor SSR `ChartLineUp` / `PlayCircle` modules. It does not import whole catalogs, dynamic icon loaders or interactive context providers. Phosphor includes weight definitions for each selected icon, not every icon in the package.

Lucide uses ISC, with MIT notices for Feather-derived icons; Phosphor uses MIT. Full notices are preserved in [LUCIDE.txt](licenses/LUCIDE.txt) and [PHOSPHOR.txt](licenses/PHOSPHOR.txt). Retain applicable notices in distributions. The custom signal-mark path is an authored synthetic demonstration, not an approved production brand asset. Package integration is not blanket legal advice for future assets.

## Icon registry and adapters

`@code-to-video/ui/icons` exports `createIconRegistry`, contracts and `evaluateIconAnimation`; `/icons/adapters` exports `lucideIcon`, `phosphorIcon`, `pathIcon`.

```tsx
import Bell from 'lucide-react/icons/bell'; // Optional host-installed package.
import {createIconRegistry} from '@code-to-video/ui/icons';
import {lucideIcon, pathIcon} from '@code-to-video/ui/icons/adapters';
import {VideoIcon} from '@code-to-video/ui';

const icons = createIconRegistry([
  lucideIcon('bell', Bell),
  pathIcon('signal', ['M4 12 L10 18 L20 6']),
]);
icons.seal(); // During app initialization, not during frame rendering.
// Inside an existing VideoThemeProvider:
// <VideoIcon registry={icons} library="lucide" id="bell" size={40} label="New briefing" />
// <VideoIcon registry={icons} library="custom" id="signal" frame={frame} fps={fps}
//   animation={{preset: 'draw', startSeconds: 0.3, durationSeconds: 1}} />
```

`register(IconDefinition)` accepts `{id, library, render, supportsStroke, supportsDraw}`. Libraries are `lucide | phosphor | custom`; IDs are kebab-case, at most 80 characters. Unknown identifiers/library combinations, duplicates, invalid definitions and registration after sealing throw. Definitions are copied/frozen; registry functions/components are trusted code, not serializable external configuration or a sandbox. `render` is a function component receiving size/color/strokeWidth/weight/drawProgress. Wrap other component forms with an adapter/function. No core edit is required to register custom SVG.

`pathIcon(id, paths, viewBox?)` copies a bounded list of authored SVG path strings, renders open/stroked paths and normalizes `pathLength=1` for simultaneous drawing. Default viewBox is `0 0 24 24`. Validation is a basic character/count/viewBox contract, not a complete SVG-path syntax parser. Inspect custom paths with an actual render. Use a trusted custom render definition for filled shapes/complex SVG, explicitly declaring drawing capability.

### VideoIcon props

- Required: `registry`, `library`, `id`.
- `size` 4–512 pixels (40); `color` semantic role or hex (foreground); `opacity` 0–1 (1); `rotation` -3600–3600 degrees (0).
- `strokeWidth` .25–8 (2) for stroke-capable Lucide/custom adapters. Explicit stroke on Phosphor throws; use its `weight`: thin/light/regular/bold/fill/duotone. Weight on other libraries throws.
- Optional descriptive `label` (1–256 nonblank characters) gives the wrapper image semantics/label; omitted labels are decorative. Nested SVGs are aria-hidden, without random accessibility IDs.
- Optional `animation` requires explicit finite `frame` and positive `fps`; static icons need neither.

Animations: fade/scale/slide reuse existing motion; rotate adds bounded rotation; draw uses normalized paths only when declared supported; otherwise it **explicitly falls back to directional reveal**, recorded as `data-icon-draw="reveal-fallback"`. `reveal` works across all adapters. Pulse is a finite, eased entrance-window effect, not an endless loop: 1–8 integer cycles, amplitude 0–.12 (default .04), settling at scale 1. Rotation turns are bounded to ±2. Reduced motion uses the existing short opacity entrance and disables travel/scale/rotation/drawing/pulse complexity. There are no CSS transitions/keyframes or animation clocks.

## Dynamic Island API and timing

`VideoDynamicIsland` takes required `frame`, `fps`; optional `timing`, `geometry`, `reducedMotion`, `icon`, `title`, `secondary`, `status`, `children`, `appearance`, trusted static `style`. Slots are authored React; no icon registry/provider is forced on the container. Arbitrary custom children provide custom layouts/styling. It consumes existing theme colors/fonts/spacing and never branches on brand/style IDs.

Pure `evaluateIsland(frame, fps, theme.motion, timing?, geometry?, reducedMotion?)` lives at `@code-to-video/ui/island`. It returns an immutable state, phase, geometry, expansion/opacity and icon scale. There is no dependence on mounting order or previously rendered frames.

| Sequential stage | Default seconds | State |
| --- | --- | --- |
| `startSeconds` | 0 | hidden before start |
| `enterSeconds` | .45 | compact / entering |
| `compactSeconds` | 1.1 | compact |
| `expandSeconds` | .8 | expanded / expanding |
| `holdSeconds` | 4 | expanded |
| `collapseSeconds` | .8 | collapsing |
| `compactAfterSeconds` | .5 | compact |
| `exitSeconds` | .45 | compact / exiting, then hidden |

Each duration is rounded independently to frames with the existing nearest-integer conversion. Zero (or a duration rounding to zero) skips/snaps that stage; an entirely zero-length lifetime stays hidden. Invalid/nonfinite/negative timings throw. Transition durations are at most 10 seconds; start/holds at most 120 seconds. Separate overlapping interval inputs are not supported: all boundaries are derived sequentially, eliminating overlap ambiguity. FPS must be positive and at most 120.

Geometry defaults: compact **440×88**, expanded **880×340**, padding **28**, expanded radius **36**. Widths are 160–1800, heights 64–1000; expanded dimensions must contain compact ones. Padding/radius are bounded and validated. Compact radius is half its height. No viewport units or phone/device cutout sizes are inferred. Position within a composition-relative parent or `VideoSafeArea`; container style cannot override calculated width/height/radius/opacity/transform.

Compact text fades away early in expansion and returns near the end of collapse. Expanded content uses its final fixed-width layout and **does not paint during geometry morphs**, fading in after expansion and out before collapse. This deliberately avoids cramped/clipped transitional typography. Hold durations should allow at least .5 seconds for full content visibility and substantially longer for reading; one-frame/tiny holds are legal but not useful reading time. Reduced motion snaps expansion geometry and disables entrance travel/icon scaling while retaining the authored stage schedule/fades. No automatic text fitting or guarantees for oversized custom children/long titles are provided; author adequate geometry and inspect layout.

## Presentations and surfaces

- `IslandNotification({description})` — explanatory text; use island icon/title/status slots for a notification.
- `IslandStatistic({label, value, comparison?, trend?})` — explicit display strings and optional trend React content; no machine-locale number formatting or live data.
- `IslandProgress({title, progress})` — progress 0–1, displayed percentage and semantic progress bar; invalid values throw. A caller may derive progress from an explicit frame.
- `IslandAnnouncement({headline, description})` — headline/context.
- `IslandMedia({title, detail?, artwork?})` — supplied artwork/React content; no automatic image fetch or playback. Stage any real media through the existing approved local-asset boundary.

Compose presentations as children, not a configuration switch/plugin registry. Optional `appearance` delegates to the Phase 3D.1 surface system through `VideoSurface`; omitted appearance uses the original panel surface. There is no duplicate glass/filter implementation. The showcase uses restrained .94 tint, existing typography and semantic foreground labels on both brands. Decorative accents are not small informational text.

```tsx
// Inside an existing resolved theme provider:
// <VideoDynamicIsland frame={frame} fps={fps} title="Production briefing"
//   icon={<VideoIcon registry={icons} library="lucide" id="bell" />}
//   appearance={{preset: 'cinematic-frost'}}
//   timing={{startSeconds: 0.5, holdSeconds: 4}}
//   geometry={{expandedWidth: 880, expandedHeight: 340}}>
//   <IslandNotification description="A clear place for context." />
// </VideoDynamicIsland>
```

## Validation and artifacts

Commands executed (all exit **0**): baseline `npm run check` (167 tests); incremental checks after icons/island/showcase; final implementation `npm run check` (**185 tests**, original 167 retained); `npm run compositions` (**12 compositions**, eleven editable literal defaultProps); `npm run qa:island -- phase3d2-targeted-a`.

The targeted suite captures **12 exact-repeat PNG pairs** plus an out-of-order morph frame. Cases cover compact/morph/expanded/statistic/collapse/exit/hidden, Ember, drawing/settled icons, solid surface and reduced motion. Browser evidence verifies actual SVG paths/viewBoxes and measured foreground SVG pixels for all six selected icons; actual island geometry must match the pure evaluator. Glass captures verify the existing browser backdrop-filter path. This reuses existing capture/browser/PNG/report infrastructure and does not repeat the Phase 3C/3D.1 matrices.

- Report: `tests/visual/reports/phase3d2-targeted-a-island.json`.
- Candidates: `tests/visual/current/phase3d2-targeted-a/{compact,morph,expanded,statistic,ember,icons-settled}.png`.
- Video: `tests/visual/current/phase3d2-targeted-a/DynamicIslandShowcase.mp4` — H.264, 1920×1080, 30 FPS, **330 frames, 11 seconds, 532,715 bytes**; ffprobe assertions and complete ffmpeg decode passed.

Agent inspection of real compact/morph/expanded/Ember/icon pixels found no obvious clipping in those sampled layouts. This is **not human approval**, full glyph-shaping certification, cross-platform pixel determinism or whole-frame accessibility compliance. Original system-font warnings remain. All fourteen original Phase 3C candidates stay unchanged/unapproved; `qa:all` was deliberately not run and is not claimed passing. No baseline was approved/replaced/regenerated. See the [lightweight validation policy](RENDERING_RELIABILITY.md#choose-the-smallest-sufficient-validation-level).

## Performance and future scope

Reuse sealed registries and stable appearance objects outside frame work; resolve themes only on input changes. Direct icon modules avoid loading entire catalogs. Keep blur regions small and avoid nested animated filters. The island evaluates a handful of numeric stages per frame; it is not a DOM-measurement-driven layout engine. This milestone did not establish universal GPU throughput or long-duration memory behavior. Diagnose a new backdrop/backend rather than assuming CSS support proves actual blur.

Add new custom icons through explicit definitions and dedicated render tests. Compose new information bodies through React slots without changing island timing. Phase 3D.3 data visualizations remain unimplemented and require separate authorization; the illustrative metric/progress bar here is not a chart framework, live finance feed or factual production asset.
