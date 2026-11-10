# @code-to-video/themes

Implemented in Phase 3A: typed, versioned JSON contracts, handwritten runtime validation, an explicitly constructed registry, immutable resolution, motion/color helpers, fictional presets, and optional React context. No Remotion, filesystem, AI, network, UI-library, or schema-library dependency. React is a peer for the separate context entry point; it is not imported by the pure data API.

This private workspace exposes TypeScript source to the existing bundler and Node 24 test runner. It is not yet a compiled/published npm library. Keep optional React imports on the `/react` subpath.

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
  brandId: 'aurora-finance',
  styleId: 'cinematic',
  motionId: 'elegant',
  overrides: {radii: {card: 16}},
});
```

Registration validates, copies, and deeply freezes data; it rejects duplicate IDs. Unknown or missing IDs fail, with no implicit brand fallback. `seal()` prevents later registration. No preset is registered automatically.

Resolution applies **framework defaults → visual style → brand identity → motion personality → scene overrides**, with explicit ownership: brand colors/typography, style surfaces/layout, and motion timing. Overrides use a documented list of token groups, not recursive merging. Resolved themes are isolated, deeply frozen, serializable snapshots.

Exports from the main entry point include types, `frameworkDefaults`, `createThemeRegistry`, `resolveTheme`, `validateBrand`, `validateVisualStyle`, `validateMotionPreset`, `validateSceneOverrides`, `validateThemeSelection`, `secondsToFrames`, `motionProgress`, and `colorWithOpacity`.

The `/presets` entry exports `auroraFinance`, `emberStudio`, `cinematic`, `minimal`, `elegant`, and `energetic`. The `/react` entry exports `VideoThemeProvider` and `useVideoTheme`; the hook throws outside a provider. Resolve once per configuration change, not per frame.

From the repository root:

```sh
npm run check
npm run test:themes
npm run studio
```

Select `ThemeShowcase` or one of the four named theme comparisons in Studio. See [the complete theme guide](../../docs/THEME_SYSTEM.md) for token bounds, versioning, inputProps, and **How to add a completely new brand or visual style**. The tested third-brand source is [Verdant Health](../../examples/themes/verdant.ts).

System fonts are provisional and not portable visual guarantees; reliable cross-machine text requires explicit licensed/bundled fonts. Logo references are logical asset IDs only; this package never loads logo assets. Phase 3D.1 glass effects consume these unchanged semantic tokens in the UI package, not in theme resolution; see [Advanced Surfaces](../../docs/ADVANCED_SURFACES.md). Clay effects, structural scene variants, component templates, external project loading, and AI automation are not implemented.
