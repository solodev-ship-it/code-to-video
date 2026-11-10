# Architecture

**CLI_TEMPLATES update:** an optional compiled local CLI provides safe create, preview and explicit-output MP4 rendering via the shared project host. Two authored theme-aware templates (title-card and three-point explainer) scaffold schema version 1 projects outside the framework. Existing showcases and browser exports remain unchanged; no dependency, AI workflow, upload or publishing was added. Source and compiled package files use an explicit allowlist. Public installation/release and human visual acceptance remain pending. See [CLI_TEMPLATES.md](CLI_TEMPLATES.md).

**PROJECT_INFRASTRUCTURE update:** version 1 external manifests, explicit theme initialization, Node-only realpath containment, bounded asset copying into ignored session caches, separate literal Studio registration and one standalone MP4 path are implemented. Existing fifteen showcases remain unchanged. Browser-safe contracts live in `packages/projects/src`; Node loading stays in `load.ts` and host scripts. This implements the bounded independent-project milestone, not the broader production-media/AI/template proposals described below. See [PROJECT_INFRASTRUCTURE.md](PROJECT_INFRASTRUCTURE.md). Sample and earlier visual review remain pending. Historical boundaries below describe their original phases.

## Status and scope

Phase 3D.4A adds pure immutable clay appearance/motion data at `@code-to-video/ui/clay`, three independent React components in the existing UI workspace, one authored Studio showcase, and a focused Node-only render suite. It does not change theme registration, glass, icon, island or chart contracts, and adds no dependency or 3D runtime. Fourteen compositions are registered. See [CLAY_MATERIALS.md](CLAY_MATERIALS.md); visual approval remains pending.

Phase 3D.3 adds pure validated chart math under `@code-to-video/ui/charts`, independent video-native chart/timeline/number components, one authored showcase, and a focused Node-only render check. Theme, surface, island and existing scene contracts remain intact. See [DATA_VISUALIZATION.md](DATA_VISUALIZATION.md). There are thirteen registered compositions; human visual approval remains pending.

Phase 3D.2 adds an app-owned icon registry, optional SVG adapter protocols, pure sequential island timing, and composable island components to the existing UI workspace. Only Studio depends on Lucide/Phosphor and imports selected icon modules directly. The new showcase brings composition count to twelve; no renderer/QA, font or theme contract is replaced. See [ICONS_AND_DYNAMIC_ISLAND.md](ICONS_AND_DYNAMIC_ISLAND.md).

Phase 3D.1 adds advanced surfaces to the existing UI/studio workspaces, following Phase 3C's opt-in rendering reliability and separate Node QA tooling. No workspace is added. `packages/core`, shared project schemas, and production workflows remain placeholders. Interfaces below are **proposed responsibilities or contracts** unless explicitly marked implemented. The [blueprint](CODE_TO_VIDEO_BLUEPRINT.md) defines requirements; the [roadmap](ROADMAP.md) defines delivery gates.

### Phase 2 boundary (preserved)

`src/index.ts` registers `RemotionRoot`; `Root.tsx` retains `CodeToVideoIntro` with validated metadata from `project.ts`. `CodeToVideoIntro.tsx` remains unchanged, deriving visual state from frame/FPS and pure functions in `motion.ts`. Its sample-local design values are not a reusable theme API. The local project validator remains app-local, not a package in `schemas` or `core`.

Root npm scripts delegate to the workspace CLI, with output under ignored `renders/`. `scripts/check-frames.mjs` preserves the intro's independent frame check. Unit tests use Node's built-in runner and TypeScript stripping. No workflow, AI, external project loading, asset staging, or web UI runtime exists. Studio is upstream tooling, including its documented LAN exposure; it is not a custom dashboard or authenticated service.

### Implemented Phase 3A boundary

The pure `@code-to-video/themes` entry exports contracts, validators, framework defaults, registry construction, resolution, and frame/color helpers. It imports neither React nor Remotion. `/presets` exports example data only; `/react` supplies provider/hook integration with the existing React peer. Source TypeScript exports suit this private workspace; published build outputs are deferred.

`showcase-themes.ts` explicitly constructs and seals an app-owned registry; package imports never populate a singleton. `ThemeShowcase.tsx` resolves when inputs change, provides context, and uses a frame-subscribed child for animation. `Root.tsx` validates theme inputProps through `calculateMetadata` and registers five new 6-second compositions around that same component. `scripts/check-themes.mjs` exercises actual inputProps and immutable-independent frame behavior. The provider itself adds no UI, assets, or frame timers.

Validation remains co-located with the implemented contracts in `packages/themes`, rather than prematurely moving it to an empty `schemas` package. Brand colors/typography, style treatments/layout, and motion timing have explicit ownership; resolution uses only listed shallow merges. Configuration is JSON data, not a plugin mechanism. Details and exact public APIs are in [THEME_SYSTEM.md](THEME_SYSTEM.md).

### Implemented Phase 3B boundary

`@code-to-video/ui` exports seven video-native primitives (`VideoText`, `AnimatedTitle`, `VideoCard`, `VideoSurface`, `VideoStack`, `VideoGrid`, `VideoSafeArea`), a `VideoMotion` wrapper, and opt-in `LocalFontGate`. Components consume the existing provider/resolved contract. Static components do not subscribe to frames; motion receives explicit frame/FPS inputs. The `/motion` subpath owns pure entrance/stagger math reusing theme timing/easing; `/fonts` validates explicit local-font/license metadata and loads browser FontFaces without remote fallback.

`ComponentShowcase.tsx` composes these primitives into one 9-second scene with three registrations and validated theme/reduced-motion inputProps. It shares the existing app-owned theme registry. No full template library or structural registry is introduced. Licensed bundled-font assets are not included; current demos remain system-font-only. Loader behavior is tested with mock faces, not a real licensed success fixture.

Studio source-editing compatibility requires literal composition IDs and inline literal defaultProps. `Root.tsx` now explicitly registers existing theme examples and new component examples rather than mapping over computed IDs/defaults. Scene implementations remain shared and unchanged. `scripts/check-studio-props.mjs` reproduces the previous extractor warning and verifies in-memory extraction/save operations using the pinned CLI's own codemod. This diagnostic is part of `npm run check`, not the rendering dependency graph. See [COMPONENT_SYSTEM.md](COMPONENT_SYSTEM.md) for APIs, fonts, extension patterns, and investigation details.

## Dependency direction

### Phase 3D.1 advanced surfaces

Focused finalization keeps contrast treatment scene-local (`GlassLabel`), with Node-only exact rendered-background/visible-ink checks and a separate unapproved review package. No shared component/theme contract or original case registry changed. See [PHASE_3D1_FINALIZATION.md](PHASE_3D1_FINALIZATION.md).

`packages/ui/src/surfaces.ts` owns pure bounded material data/resolution and reuses existing motion evaluation. `VideoGlassSurface` renders that data; optional appearance props extend `VideoSurface`/`VideoCard` without changing their old paths. No theme schema or singleton is introduced. One `GlassmorphismShowcase` registration brings the composition total to eleven. Node-only `scripts/qa/surfaces.ts` reuses capture/report/renderer infrastructure for 46 exact-repeat cases, causal pixel metrics, a small benchmark and full-HD MP4 verification. Existing visual cases/baselines are not mutated; human approval remains pending. APIs and limits: [ADVANCED_SURFACES.md](ADVANCED_SURFACES.md). No Phase 3D.2/4/5 feature is implied.

### Phase 3C reliability boundary

The existing `/fonts` entry remains compatible and now re-exports versioned manifest/requirements plus an explicitly owned deduplicating loader. `LocalFontGate` supports exact required faces and a trusted local asset resolver; no package singleton or theme typography rewrite is introduced. `/diagnostics` contains browser-safe geometry, measurements and JSON findings; `/diagnostics/react` adds a bounded artifact probe. `VideoText`/`AnimatedTitle` and `VideoSafeArea` instrumentation/margins are optional; their default styling is preserved.

`apps/studio/src/qa/ReliabilityFixture.tsx` is one literal, parameterized fixture using the existing resolver/components and explicit local typography overrides. Its two small Atkinson Hyperlegible faces are redistributed unmodified with verified OFL license/provenance/hashes under the Studio public directory. Original nine registrations and authored scene implementations remain available; total composition count is ten.

Node-only `scripts/qa` owns file containment/hash checks, cached-browser setup, PNG capture, exact/perceptual comparison, source/environment fingerprints, approval files and CLI exit/report policy. Cases live under `tests/visual`; generated captures/diffs/reports are ignored, while only explicitly approved limited references may be tracked. Fast QA tests live under `tests/reliability`. No Node imports leak into browser package entry points. See [RENDERING_RELIABILITY.md](RENDERING_RELIABILITY.md) for APIs, limitations, CLI and the pending human baseline checkpoint.

Phase 3C.6 hardens only this Node QA boundary: explicit negative-case expectations, structured causal error evidence, and exact layout diagnostic requirements replace status-only rejection assertions. `expected-failure.ts` is shared by the real CLI harness and fast regressions; `errors.ts` adds optional cause metadata without changing schema version 1 or existing error envelopes. Rendered scenes, UI/theme APIs, capture/comparison algorithms and registrations are unchanged.

Planned runtime flow:

```text
external project -> host-side validation and asset staging -> serializable render inputs
                                                              |
                                                         apps/studio
                                                              |
                                                core + video UI + themes

optional agents -> workflows -> validated project artifacts -> same host-side boundary
```

Shared schema contracts sit below consumers. Rendering must not import agent providers, workflow orchestration, host filesystem access, or web-dashboard code. Type-only schema contracts may cross the boundary; filesystem validation and staging stay in host tooling. Themes are data consumed by core and UI, not a dependency on the studio. Optional adapters must not become mandatory imports of the minimal starter.

## Module responsibilities and planned interfaces

### `apps/studio`

- Implemented: Remotion entry point, original intro, five shared-scene theme compositions, three shared-scene component compositions, one parameterized reliability fixture, and preview integration. Broader project selection and orchestration below remain planned.
- Consume validated project data, resolved assets, and themes; expose composition choices to Remotion tooling.
- Keep host-side loading separate from browser composition code. No dashboard is planned for the starter.
- Proposed boundary: project selection and composition metadata in; preview/render-ready composition definitions out.

### `packages/core`

- Own scene timing conventions, composition orchestration, template registration contracts, and deterministic motion utilities.
- Accept serializable, validated project/scene data and resolved asset references.
- Support custom React scene implementations through explicit code registration, not arbitrary module paths from JSON.
- Proposed boundary: typed scene inputs, timing context, theme data, and an approved asset map in; React video composition content out.
- Exclude AI services, filesystem access in frames, and creative approval logic.

### `packages/ui`

- Implemented: typography/title, surfaces/cards, stacks/grids/safe-area primitives, explicit frame-motion wrappers/helpers, and opt-in local-font readiness support. Exact APIs are in `docs/COMPONENT_SYSTEM.md`.
- Maintain explicit sub-boundaries for video components, optional web controls, and optional third-party adapters. Create physical subdirectories only when implementation needs them.
- Implemented boundary: typed visual data, provider-supplied semantic theme tokens, and explicit timing in; deterministic React elements out. Trusted static styles and arbitrary authored React slots preserve custom scene creativity.
- Phase 3C adds versioned local-font manifests/requirements and an owned loader, plus opt-in text/safe-area diagnostics. Browser measurement code is separate from pure evaluation, and Node capture/comparison code is not part of the UI package.
- Lucide and Phosphor SVG adapters are now optional Studio-owned imports; shadcn-inspired styling is not permission to import interactive DOM behavior into video. Dynamic Island is video-native and remains optional for a minimal starter.

### `packages/themes`

- Implemented: versioned semantic colors, system-font typography settings, spacing/layout and surface/effect tokens, motion/style presets, bounded scene overrides, and runtime validation.
- Implemented public boundary: `createThemeRegistry`; typed `registerBrand`, `registerVisualStyle`, `registerMotionPreset`; optional `seal`; `resolveTheme(registry, selection)` to immutable serializable tokens. Separate React provider/hook consume the resolved snapshot.
- The theme package owns font names/settings only; approved local-face loading/readiness lives in UI. Phase 3C supplies a licensed local QA fixture and exact face/weight checks, not a rewrite of original system-font tokens. Broad glyph/shaping validation, delivery-specific safe-area profiles, full material effects and external asset resolution remain planned. No font downloads occur in animation calculations.

### `schemas`

- Own schema versions, serializable contracts, validation rules, migration policy, and eventually validation fixtures.
- Proposed contracts: project, scene, theme, asset manifest, captions, production status, approval, and render provenance.
- Validation-library choice and package/export layout are deferred to implementation. Keep browser-safe types separate from host-only logic.

### `workflows`

- Describe production stages, required inputs, deliverables, validation gates, and human approvals.
- Proposed boundary: versioned production artifacts and explicit user decisions in; reviewable artifact proposals and stage status out.
- Must work without AI; cloud integrations are optional. No credentials or automation are delivered in Phase 1.

### `agents`

- Hold future agent role instructions, tool policies, and optional provider integration definitions.
- Proposed boundary: scoped tasks and approved artifacts in; changes and evidence for review out.
- Agents may propose work but cannot bypass approvals, execute untrusted project instructions automatically, or become a runtime rendering dependency.

### `examples`

- Implemented: third-brand source tutorial module and two theme selection JSON examples. Other small starter projects/component demonstrations remain planned.
- Proposed consumption boundary: the same validated project format as external projects, with local sample assets where needed.
- Do not create a second configuration dialect or hide missing dependencies behind remote assets.

### `scripts`

- Hold future host-side development commands, checks, controlled asset staging, and a minimal CLI entry point.
- Proposed boundary: explicit local arguments/configuration in; diagnostics, staged files, render invocations, and exit status out.
- Implemented: intro, theme, and component independent-frame checks plus the Studio default-props extraction/save regression diagnostic. A dedicated custom CLI package remains deferred; current developer commands wrap the upstream Remotion CLI through npm.
- Phase 3C `scripts/qa` adds the Node reliability commands without a workspace/service/CLI package abstraction. Approved-baseline mutation is a distinct explicit human operation, never a testing side effect.

### `docs`

- Maintain blueprint requirements, module boundaries, milestone acceptance tests, and later tested onboarding/troubleshooting guides.
- Public contract today: accurate documentation that separates implemented behavior from design intent.

## External video-project boundary

A future project root owns content, media, project-specific code, provenance, and outputs. The engine root owns reusable implementation. Project location is explicit; paths resolve relative to that root, never the process working directory by accident. Asset IDs map to a manifest, then to approved local files and staged browser-readable URLs. Output and cache locations remain explicit and separate from source media.

JSON is data, not executable code. Custom scenes are trusted TypeScript/React code registered through a deliberate build step; rendering untrusted code is outside the minimal starter's security promise. Later external project loading must not silently copy, mutate, or delete source assets.

## Decisions deliberately deferred

npm workspaces, Node 24, pinned dependencies, current developer commands, and the theme package's current source exports are selected and documented. A shared schema library, published-package build/versioning policy, custom CLI syntax, template API, and optional adapters remain deferred. No placeholder package manifests, plugin loaders, distributed queues, cloud requirement, or speculative service layer are introduced.

Phase 3D.4B adds external PNG/sequence/opaque video compositing and depth, sweep and glow components, plus AdvancedEffectsShowcase (15 total compositions). See [cinematic APIs and limits](CINEMATIC_EFFECTS.md). Technical validation is recorded separately; human visual approval remains pending. No real-time 3D engine, Phase 4 staging/storage or Phase 5 automation is included.
