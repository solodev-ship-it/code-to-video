# Theme System — Phase 3A

Phase 3D.1 adds glass material presets/rendering in `packages/ui`, consuming these unchanged semantic tokens and resolver. They are not new brand/style registrations or modifications to this schema. See [ADVANCED_SURFACES.md](ADVANCED_SURFACES.md) for the implemented surface layer; historical Phase 3A limits below describe that original milestone.

## Implemented scope

`packages/themes` is a real private TypeScript workspace consumed by `apps/studio` and the Phase 3B UI package. It implements validated data contracts, an explicit registry, a pure resolver, immutable theme snapshots, deterministic motion helpers, and a lightweight React context. Component primitives and opt-in local-font loading live separately in `packages/ui`; the theme package does not implement dashboards, AI workflows, remote plugins, external projects, or asset loading.

`CodeToVideoIntro` remains unchanged and deliberately independent of themes. `ThemeShowcase` and four comparison compositions reuse one theme-aware scene at 1920×1080, 30 FPS, 180 frames / 6 seconds. Card examples are demo-local markup, not public UI components.

## Independent layers and ownership

| Layer | Meaning | Supported data |
| --- | --- | --- |
| Framework defaults | Safe starting values, not a substitute for missing identity | Complete default tokens in `defaults.ts` |
| Visual style | How the scene is treated | Surface fill/opacity; card/badge radii; borders; shadows; gradient roles/angle; spacing; content width; grid/glow effect opacity |
| Brand identity | Who is communicating | Required semantic colors; optional typography overrides, logical logo asset ID, and JSON metadata |
| Motion personality | How it moves | Duration/delay/stagger in seconds, easing profile, spring parameters, intensity, and travel distance |
| Scene overrides | An explicit local exception | Partial allowed color/typography/style/motion token groups; no identity changes or arbitrary CSS |

Precedence is **defaults → selected style → selected brand → selected motion → scene overrides**. Brand colors beat `style.defaultColors`; typography comes from defaults plus brand and scene. Surface/layout/effect tokens belong to the style, not the brand. Motion cannot change colors, and styles cannot embed typography. Unknown fields fail validation. These ownership rules avoid ambiguous collisions.

The resolver explicitly merges each known group one level deep. It also explicitly merges `motion.spring` one level deep so a mass override retains damping and stiffness. There is no arbitrary recursive merge, no extra project-override layer, and no automatic registration. This replaces the earlier blueprint's provisional brand/project precedence.

**Structural scene variants** are different arrangements or component structures (for example a split-screen quote versus a full-screen title), not colors or radii. They remain authored React scenes. Do not add scene-layout switches for every style ID. Future structural variants should be deliberately registered/typed when needed; Phase 3A has no structural-variant registry.

## Contracts and runtime validation

Read `packages/themes/src/types.ts` for the exact exported TypeScript contracts. Brand, style, motion, and selection objects require `schemaVersion: 1`. IDs are lowercase kebab-case beginning with a letter, at most 80 characters. Display/font strings are nonempty, at most 256 characters. Missing or unknown IDs never resolve to another brand.

### Brand

Required: `schemaVersion`, `id`, `displayName`, and complete `colors`:
`primary`, `secondary`, `accent`, `background`, `foreground`, `muted`, `mutedForeground`.

Supported colors are **only** `#RGB`, `#RGBA`, `#RRGGBB`, and `#RRGGBBAA`, case-insensitive. Named colors, arbitrary CSS strings, URLs, and `rgb()` are intentionally not accepted. `colorWithOpacity` converts validated hex to RGBA and multiplies any existing alpha.

Optional `typography` fields inherit defaults: `fontFamily`, `headingFontFamily`, `headingWeight`, `bodyWeight`, `titleSize`, `bodySize`, `captionSize`, `lineHeight`, `letterSpacing`. `logoAssetId` is a logical ID, never a URL/path to load automatically. Optional `metadata` is JSON data; it is copied/frozen, not used to choose scene structure or execute instructions.

### Style

Required: `schemaVersion`, `id`, `displayName`. Optional `defaultColors` and `tokens` inherit framework values. All style groups permit only known partial fields:

| Group | Fields |
| --- | --- |
| `surface` | `color` semantic color role, `opacity` |
| `radii` | `card`, `badge` |
| `border` | `color` role, `width`, `opacity` |
| `shadow` | `color` role, `offsetY`, `blur`, `opacity` |
| `gradient` | `enabled`, `from`/`to` roles, `angle`, `opacity` |
| `spacing` | `page`, `gap`, `cardPadding` |
| `layout` | `contentWidth` |
| `effects` | `gridOpacity`, `glowOpacity` |

Cinematic uses a gradient, grid/glow, rounded filled cards, and shadows. Minimal uses a flat brand background, nearly square outlined cards, and no glow/grid/shadow. The renderer consumes these tokens, never tests `styleId === 'cinematic'`.

### Motion

Required: `schemaVersion`, `id`, `displayName`. Optional `tokens` inherits defaults. `elegant` uses longer, softer entrances; `energetic` uses shorter durations, more displacement, and a livelier spring. Easing is one of `linear`, `ease-out-cubic`, or `ease-in-out-cubic`—JSON never contains executable functions.

`secondsToFrames` uses nearest-integer rounding (`Math.round(seconds * fps)`). Evaluated durations have a minimum of one frame. Stagger start is rounded after `delaySeconds + index * staggerSeconds` is summed. `motionProgress` is a pure, clamped, frame-based evaluator. The showcase passes spring tokens to Remotion's frame-driven `spring`; no CSS animation, timers, randomness, or frame-order state is involved. Adding a new preset using existing profiles needs no renderer edit. Adding a new easing algorithm is a contract/helper change with tests, not remote code in JSON.

### Numeric bounds

All values must be finite. Distances/sizes are composition pixels unless marked otherwise.

| Fields | Inclusive bounds |
| --- | --- |
| Any opacity | 0–1 |
| Heading/body weight | 100–900 |
| Title/body/caption size | 12–240 / 10–100 / 8–72 |
| Line height / letter spacing | 0.8–2.5 / -5–30 |
| Radii / border width | 0–120 / 0–12 |
| Shadow offset / blur | -100–100 / 0–160 |
| Gradient angle | 0–360 degrees |
| Page / gap / card padding | 16–240 / 0–120 / 8–120 |
| Content width | 600–1800 |
| Duration / delay / stagger | 0.05–10 / 0–10 / 0–2 seconds |
| Intensity / distance | 0–2 / 0–200 |
| Spring damping / stiffness / mass | 1–100 / 1–500 / 0.1–10 |

These are safety bounds, not guarantees that every extreme combination fits every scene or has good contrast. Human layout/contrast checks remain necessary.

### JSON and version policy

Validators reject unknown keys, functions, symbols, getters/setters, nonplain objects, undefined values, nonfinite numbers, sparse arrays, cycles, unsafe prototype keys, and nesting deeper than 32. Optional means **omit the property**, not supply `undefined` in an external object. Example error: `brand.colors.accent: expected a hex color (...)`.

All public `validate*` functions accept `unknown` and return newly owned parsed data. Registration validates again and deeply freezes a copy. Resolution validates selection/overrides and returns a fresh, deeply frozen snapshot. Callers' objects are not frozen or mutated. Registries are isolated; duplicate IDs cannot replace existing entries. Seal the app registry after explicit initialization. Registry functions themselves are intentionally not serializable; configuration and resolved output are.

Version 1 is the only supported schema version. No automatic migration exists. When contracts evolve, introduce a version-specific validator, test old/new fixtures, and provide an explicit non-destructive migration if needed. Do not reinterpret version 1 inputs silently or treat arbitrary metadata as new rendering tokens. This private source package is not yet a published compatibility guarantee.

## Registry and React integration

```ts
import {createThemeRegistry, resolveTheme} from '@code-to-video/themes';
import {auroraFinance, cinematic, elegant} from '@code-to-video/themes/presets';

const registry = createThemeRegistry();
registry.registerBrand(auroraFinance);
registry.registerVisualStyle(cinematic);
registry.registerMotionPreset(elegant);
registry.seal();

const theme = resolveTheme(registry, {
  schemaVersion: 1,
  brandId: 'aurora-finance', styleId: 'cinematic', motionId: 'elegant',
  overrides: {colors: {accent: '#90f0df'}, motion: {durationSeconds: 0.8}},
});
```

Use `validateBrand`, `validateVisualStyle`, or `validateMotionPreset` first when loading external unknown data. Typed registration still validates at runtime. Pure package imports never import React or Remotion; `@code-to-video/themes/react` is separate:

```tsx
import {VideoThemeProvider, useVideoTheme} from '@code-to-video/themes/react';

function SceneTitle() {
  const theme = useVideoTheme();
  return <div style={{color: theme.colors.foreground,
    fontFamily: theme.typography.headingFontFamily}}>A new story</div>;
}

// In an authored component, using the already resolved `theme` above:
// <VideoThemeProvider theme={theme}><SceneTitle /></VideoThemeProvider>
```

The hook throws when no provider exists. The showcase resolves in an input-dependent `useMemo` in the provider wrapper; the child subscribes to frames. Avoid resolving in `useCurrentFrame` computations. No global package singleton, filesystem scanning, network fetching, plugin discovery, or dependency injection container is involved.

## How to add a completely new brand or visual style

### 1. Add a data module

The real, tested third-brand module is `examples/themes/verdant.ts`:

```ts
import type {BrandIdentity} from '@code-to-video/themes';

export const verdantHealth = {
  schemaVersion: 1, id: 'verdant-health', displayName: 'Verdant Health',
  colors: {
    primary: '#28765b', secondary: '#d8e9de', accent: '#3c8f69',
    background: '#f2f7f0', foreground: '#17352a',
    muted: '#e2ecdf', mutedForeground: '#4b6857',
  },
  typography: {fontFamily: 'Arial, sans-serif', headingFontFamily: 'Georgia, serif'},
  metadata: {fictional: true, category: 'education'},
} satisfies BrandIdentity;
```

Create a new style in a similar authored module, using existing token groups:

```ts
import type {VisualStyle} from '@code-to-video/themes';

export const paper = {
  schemaVersion: 1, id: 'paper', displayName: 'Paper',
  tokens: {radii: {card: 4}, surface: {color: 'background'}, border: {width: 3}},
} satisfies VisualStyle;
```

Missing optional token fields inherit framework defaults, not the previously selected style. The tests register this `paper` definition and a third motion preset to verify that the resolver does not need changing. For a production style, set intentional values for important effects rather than relying on every default.

### 2. Register during application initialization

In `apps/studio/src/showcase-themes.ts`, import the new module and call `registry.registerBrand(verdantHealth)` (and `registry.registerVisualStyle(paper)` if added) **inside `createShowcaseRegistry`, before `registry.seal()`**. The relative path from that file to the existing brand example is `../../../examples/themes/verdant.ts`.

Or use the third brand in a separately constructed registry without editing the showcase application at all:

```ts
import {createThemeRegistry, resolveTheme} from '@code-to-video/themes';
import {minimal, elegant} from '@code-to-video/themes/presets';
import {verdantHealth} from './examples/themes/verdant.ts'; // root-level caller

const registry = createThemeRegistry();
registry.registerBrand(verdantHealth);
registry.registerVisualStyle(minimal);
registry.registerMotionPreset(elegant);
registry.seal();
const theme = resolveTheme(registry, {
  schemaVersion: 1, brandId: 'verdant-health', styleId: 'minimal', motionId: 'elegant',
});
```

### 3. Select IDs, not implementation branches

Set `brandId: 'verdant-health'` and the desired registered style/motion IDs in your inputProps or composition defaults in `Root.tsx`. No changes to `ThemeShowcase.tsx`, `packages/core`, or the resolver are needed. The third-brand example is intentionally not registered in the standard two-brand demo; selecting it before registration correctly throws.

### 4. Validate and inspect

Run `npm run check`, render a uniquely named still/MP4, inspect typography/contrast/safe areas, and run repeat-frame checks before approval. Keep new brand code independent from unrelated compositions. Do not add remote fonts/logos or new dependencies merely to introduce a brand.

For future AI agents: author data modules, use `satisfies` contracts, register explicitly, add validation fixtures, and request human creative approval. Do not bypass validators, replace another brand's ID, alter shared components for company-specific exceptions, or add arbitrary CSS/functions to JSON.

## Preview and render examples

From the repository root:

```sh
npm run studio
```

Select `ThemeShowcase`, `ThemeAuroraCinematic`, `ThemeAuroraMinimal`, `ThemeEmberCinematic`, or `ThemeEmberMinimal`. Cinematic defaults use elegant motion; minimal comparison defaults use energetic motion. They share the same scene. `CodeToVideoIntro` remains available.

To change inputProps without adding a schema/UI dependency, pass a versioned JSON file to the existing CLI. For Studio:

```sh
npm run studio --workspace=@code-to-video/studio -- --props=../../examples/themes/ember-minimal.json
```

The file path is relative to `apps/studio` because npm runs workspace commands there. All new theme compositions validate selectors; the original intro does not consume theme props. Phase 3B moved authoritative Studio defaults to explicit literal registrations in `Root.tsx` so Studio can extract/save them; `showcase-themes.ts` retains example selections/test fixtures and app registry initialization. Do not reintroduce computed defaultProps/IDs for editable compositions. No new dropdown editor or JSON-schema form UI was added. See [the warning investigation](COMPONENT_SYSTEM.md#studio-warning-cause-and-resolution).

Two root shortcuts render dedicated files with concurrency 1 and overwrite protection:

```sh
npm run render:aurora
npm run render:ember
```

Outputs: `renders/ThemeAuroraCinematic.mp4` and `renders/ThemeEmberMinimal.mp4`. Archive an existing output before rerunning. The original `npm run render` still targets only the intro and was not used to overwrite its existing MP4.

For arbitrary selection through actual render inputProps:

```sh
npm exec --workspace=@code-to-video/studio -- remotion render src/index.ts ThemeShowcase ../../renders/MyThemeStudy.mp4 --props=../../examples/themes/ember-minimal.json --codec=h264 --concurrency=1 --disallow-parallel-encoding --overwrite=false
```

`calculateMetadata` and the component boundary validate selections and reject unknown IDs. For scene-specific changes, add an `overrides` object to a copy of the selection JSON, for example `"overrides": {"radii": {"card": 12}, "motion": {"intensity": 0.5}}`.

## Validation and limits

`npm run check` covers both workspaces. `npm run test:frames` preserves the intro check. `npm run test:themes` renders real inputProps combinations to unique ignored directories, validates PNG headers/dimensions, checks brand/style/motion differences and repeated independent frames, and verifies that an unknown brand fails without creating output. Run render checks sequentially; simultaneous CLI bundles can contend for webpack cache files.

Two 6-second MP4s were rendered at concurrency 1 and independently probed/fully decoded. Detailed execution evidence is in [ROADMAP.md](ROADMAP.md). Rendered sample frames demonstrate visible cinematic/minimal differences, not a formal contrast audit or approved visual-regression baseline.

Typography in the demos still uses system fonts, so cross-machine line breaks/pixels are not guaranteed. Phase 3B adds opt-in local loading/readiness in UI, but no licensed font assets or real-font capture fixture; see [the font strategy](COMPONENT_SYSTEM.md#font-strategy-and-minimal-loading-support). Logo IDs are not resolved to media yet. Future glassmorphism/claymorphism may reuse tokens for simple appearances; true blur/material/lighting behavior needs measured video-native components and carefully versioned token additions. It is not implemented by naming a new preset. The showcase uses a fixed composition layout; extreme valid token values may still overflow. No many-brand performance benchmark or cross-platform render guarantee has been established.

Phase 3C update: a separate reliability fixture now explicitly opts into two verified OFL local faces and real readiness/layout checks. This does not replace Aurora/Ember's system-font tokens. Existing-composition QA records a system-font portability warning rather than claiming glyph coverage. See [RENDERING_RELIABILITY.md](RENDERING_RELIABILITY.md) for the new workflow and pending baseline approval.
