# Code to Video — Technical Blueprint

**RELEASE_V1 preparation:** private artifact staging/auditing, clean local consumer install/render validation, hoisted tooling resolution, browser-free CI, dependency/license inventory, onboarding and draft notes/version policy are implemented. Owner selected first-party MIT (2026 Rorn Bunthong), with KrungTech separately credited. This is not a tagged/public release: root remains private at 0.1.0, engine compatibility remains 0.1.x/schema 1, and third-party/final name/version/visual/CI/release decisions remain pending. Existing third-party terms are preserved, not reclassified or approved; Studio branding is unchanged. See [RELEASE_V1.md](RELEASE_V1.md).

**END_TO_END_QA update:** isolated source-install and standalone production automation is implemented through `npm run qa:e2e`: source/lock/runtime/browser provenance, an external scene edit, MP4 timing/decode, independent repeat frames, four exact preflight rejections and `qa:all`. Pending baseline approvals retain nonzero full-gate exits. This does not certify a published npm installation, cross-machine equality or human visual acceptance. See [END_TO_END_QA.md](END_TO_END_QA.md) for actual evidence and remaining gates.

**CLI_TEMPLATES update:** an optional compiled local CLI provides safe create, preview and explicit-output MP4 rendering via the shared project host. Two authored theme-aware templates (title-card and three-point explainer) scaffold schema version 1 projects outside the framework. Existing showcases and browser exports remain unchanged; no dependency, AI workflow, upload or publishing was added. Source and compiled package files use an explicit allowlist. Public installation/release and human visual acceptance remain pending. See [CLI_TEMPLATES.md](CLI_TEMPLATES.md).

**PROJECT_INFRASTRUCTURE update:** version 1 external manifests, explicit theme initialization, Node-only realpath containment, bounded asset copying into ignored session caches, separate literal Studio registration and one standalone MP4 path are implemented. Existing fifteen showcases remain unchanged. Browser-safe contracts live in `packages/projects/src`; Node loading stays in `load.ts` and host scripts. This implements the bounded independent-project milestone, not the broader production-media/AI/template proposals described below. See [PROJECT_INFRASTRUCTURE.md](PROJECT_INFRASTRUCTURE.md). Sample and earlier visual review remain pending. Historical boundaries below describe their original phases.

## 1. Delivery status

**Phase 3D.4A update:** explicit user authorization adds a bounded, theme-aware clay 2.5D material system, deterministic motion and one 9-second showcase. Existing APIs and thirteen earlier compositions remain. Public contracts and focused evidence: [CLAY_MATERIALS.md](CLAY_MATERIALS.md). This phase does not implement general 3D, external models, AI, external-project storage or baseline approval.

**Phase 3D.3 update:** explicit user authorization adds deterministic video-native data visualizations and one illustrative showcase to the existing packages. Pure scale/validation utilities, bounded component APIs and focused render evidence are documented in [DATA_VISUALIZATION.md](DATA_VISUALIZATION.md). Thirteen compositions are registered. This work does not approve existing visual baselines or authorize Phase 3D.4/4.

**Phase 3D.2 update:** explicit user authorization added icons, deterministic Dynamic Island and one showcase within the existing packages, preserving the prior eleven compositions (twelve total). Optional icon packages are host-owned, not core UI dependencies. APIs, notices and targeted validation: [ICONS_AND_DYNAMIC_ISLAND.md](ICONS_AND_DYNAMIC_ISLAND.md). Human baseline approval remains pending; Phase 3D.3/4/5 are not authorized by this delivery.

**Phase 3D.1 finalization:** a scene-local informational-label contrast correction and rendered-background regression gate accompany a byte-preserving human-review package. No baseline was approved and no subsequent milestone began. Current handoff: [PHASE_3D1_FINALIZATION.md](PHASE_3D1_FINALIZATION.md).

**Phase 3D.1 update:** advanced surface configuration, four theme-aware presets, real backdrop filtering with explicit simulated-frost fallback, deterministic material effects and one 10-second showcase are implemented in existing packages. All ten earlier compositions remain (eleven total). Renderer-backed material/alpha/repeat tests and a representative benchmark are documented in [ADVANCED_SURFACES.md](ADVANCED_SURFACES.md). The explicit Phase 3D.1 authorization does not approve any Phase 3C/new visual candidate or authorize Phase 3D.2, Phase 4 or Phase 5.

**Phase 3C implements rendering reliability and visual QA on the existing theme/component system.** Versioned local fonts, exact face readiness, opt-in browser text/safe-area diagnostics, PNG visual capture/comparison, explicit approval and JSON quality gates are implemented without a new workspace. A small licensed local-font fixture is included; existing scene implementations and theme typography defaults are preserved. **Human baseline approval remains pending and the aggregate visual gate is intentionally blocked until approval.** Complete templates, core orchestration, external loading/staging, audio/captions and AI workflows remain planned. See README/roadmap for executed evidence and limits.

## 2. Vision and goals

Build a professional, open, modular production framework for documentaries, explainers, product videos, corporate communication, and social content. A beginner should eventually install, preview, edit, and render a sample locally; an experienced developer should be able to build bespoke cinematic scenes without fighting a restrictive template system.

Priorities are deterministic frames, maintainable code, accessible onboarding, reusable visual systems, explicit creative decisions, and reproducible outputs. AI is an optional production assistant, not a prerequisite for rendering. A minimal local project must not require an account or cloud service.

Non-goals for Phase 1 were a dashboard, scene implementation, agent automation, a separate project repository, media generation, cloud rendering, and a generalized plugin platform. Phase 2 adds only the local sample scene and its rendering/tooling; the other exclusions remain.

## 3. System architecture

Separate three concerns:

1. **Authoring and production:** human or optional agents create research, scripts, storyboards, asset plans, and approvals.
2. **Host-side preparation:** load trusted project configuration, validate schemas, resolve assets, stage approved files, and build serializable composition inputs.
3. **Frame rendering:** React/Remotion consumes fixed inputs, registered scene code, theme data, and assets without workflow services or mutable external state.

`apps/studio` integrates Remotion. `packages/core` owns scene orchestration and timing; `packages/ui` owns video-native visuals; `packages/themes` owns visual-system data. `schemas` defines shared contracts. `workflows` and `agents` remain outside the rendering dependency graph. [ARCHITECTURE.md](ARCHITECTURE.md) specifies module boundaries and conceptual interfaces.

## 4. Technology and dependency strategy

- TypeScript is the primary implementation language; React and Remotion are the target composition stack.
- Choose a supported Node release, one workspace-capable package manager, and mutually compatible React/Remotion versions in Phase 2 after checking current upstream requirements.
- Implemented selection: npm workspaces; Node 24.x (minimum/tested 24.7.0), npm 11.x (tested 11.18.0); React/DOM 19.3.1, Remotion/CLI 4.0.541, TypeScript 5.9.3. Studio, themes, and UI are functional packages. Handwritten validation, Node's built-in tests, and installed TypeScript for test-only JSX avoid additional testing/UI/animation dependencies. Phases 3A/3B add local workspace links, no new external package versions.
- Pin direct dependencies and commit one lockfile. Keep Remotion packages aligned, document the browser/renderer environment, and record versions in render provenance.
- Phase 3C declares existing renderer/bundler 4.0.541 dependencies explicitly for Node QA and adds pngjs 7.0.0, pixelmatch 8.0.0, and PNG type definitions for real image comparison. React/TypeScript/Remotion versions are not upgraded; these QA dependencies do not enter browser UI code.
- Introduce a schema-validation library only when implementing validation. Select the simplest suitable test and lint tools at the same time; no foundation package installation.
- Optional icon, chart, web-UI, and agent adapters must not inflate the mandatory starter dependency graph.
- Review maintenance, licenses, browser compatibility, deterministic behavior, and bundle weight before adopting a dependency. No assumption that all Remotion usage is license-free.

## 5. Workspace strategy

The intended modular workspace consists of `apps/studio`, `packages/core`, `packages/ui`, `packages/themes`, plus supporting directories documented in the architecture. Phase 2 introduces the root workspace definition and only the manifests required by actual implementation. Do not publish empty packages or create an unused package per concept.

Use one coherent TypeScript configuration strategy with explicit browser versus Node boundaries. Keep internal dependency direction acyclic. A future CLI begins as small host tooling in `scripts`; promote it to a package only when necessary. Studio means Remotion Studio integration, not a new dashboard.

## 6. Independent projects, storage, and asset resolution

The engine contains reusable code and small licensed examples, not a growing library of production media. Future independent project roots may live in a sibling directory, another disk, or a separately managed repository. No such repository is created now.

Each external project will own its configuration, scripts/storyboards, asset manifest, media, optional trusted scene code, production records, and outputs. Large media may be managed outside Git or via a separately chosen project-level storage strategy. Never require engine Git to track it.

Planned resolution rules:

1. Select an explicit project root and validate its supported schema version.
2. Resolve logical asset IDs through a manifest. Relative paths are relative to the project root, not shell location. Absolute paths require explicit allowlisting and must not leak into portable configuration.
3. Canonicalize paths, including symlinks; reject escapes from approved roots, unsupported inputs, missing files, and ambiguous IDs. Reject remote fetching by default.
4. Stage approved assets into a controlled browser-readable public location or serve them through a narrowly scoped local mechanism. Choose the concrete mechanism during implementation; a filesystem path alone is not a Remotion browser URL.
5. Record content hashes, metadata, and resolved logical URLs. Stage before render; never discover or download media during frame evaluation.
6. Keep staging, caches, and outputs distinct from source. Cleanup only engine-owned generated paths with explicit scope; never delete source assets.

Phase 2 uses a tiny in-repository example. Full external-root loading, containment checks, and staging land in Phase 4. Ignoring large media is a safety net, not proof that all asset sizes or licenses have been checked.

## 7. Project and scene schemas

These are proposed shared data requirements, not implemented public JSON schemas or final shared field names. The Phase 2 in-app subset lives in `apps/studio/src/project.ts`: schemaVersion 1, IDs, dimensions, FPS, and scene start/duration intervals. The starter requires even dimensions for H.264 and contiguous ordered scenes without gaps/overlaps. It does not dynamically assemble scene code or implement external project loading. Add shared contracts with versioned fixtures when later milestones need them.

| Contract | Planned information and validation |
| --- | --- |
| Project | Schema version, stable ID, title, frame size, positive integer FPS, theme reference, ordered scenes, asset references, output preferences |
| Scene | Stable ID, template/custom registration key, nonnegative integer start frame, positive duration in frames, typed content, asset references, optional theme overrides |
| Theme (Phase 3A implemented subset) | Version 1 brand/style/motion/selection contracts, semantic colors, system-font typography, bounded style/motion tokens, scene overrides; shared project integration/font readiness remain planned |
| Asset | Stable ID, kind, approved source location, rights/provenance, content hash, relevant duration/dimensions and font metadata |
| Captions/audio | Explicit frame-aligned cues/tracks, text or asset references, locale, levels, timing, and review status |
| Production/approval | Artifact version/hash, stage, decision, reviewer, reason, and audit timestamp |
| Render provenance | Input and asset hashes, engine revision, lockfile/environment versions, selected composition, render options, output reference |

Reject unsupported versions, duplicate IDs, unresolved references, invalid dimensions, and invalid timing with actionable diagnostics. Use a documented interval convention: scene and cue ranges are `[startFrame, startFrame + durationInFrames)`. Define overlap/transition policy explicitly rather than guessing intent. Project duration is derived from the validated timeline; avoid competing duration authorities.

Convert seconds-based inputs to frames once using a documented rounding policy; frame integers are authoritative thereafter. Version migrations must be explicit, backed up or non-destructive, and reviewable. Project JSON never names arbitrary code to execute. Secrets do not belong in these contracts.

## 8. Scene templates and creative freedom

Templates will provide typed inputs and reusable layouts, not a fixed scene vocabulary. Custom React scenes remain first-class and use the same timing, theme, asset, and validation boundaries. Register trusted scene code explicitly at build time. Do not implement runtime execution of code strings from configuration.

Start with one minimal sample in Phase 2. Phase 3 adds a small, justified template set, reusable primitives, and one custom-scene example. Shared layout, typography, and motion helpers should help custom work without forcing every scene into a universal schema.

Phase 3B's implemented subset is video-native typography/title, card/surface, stack/grid/safe-area primitives and a custom component showcase. Complete scene templates are explicitly deferred by the current scope. Structural variants remain authored React compositions of primitives, not brand/style conditionals or arbitrary JSON code. Details are in [COMPONENT_SYSTEM.md](COMPONENT_SYSTEM.md).

## 9. Multi-brand themes and visual systems

Separate brand identity from scene content and rendering mechanics. Shared components must not hardcode brand colors or fonts. Phase 3A implements explicit precedence: **framework defaults → visual style → brand identity → motion personality → scene overrides**. Brand colors override style default colors; style owns surfaces/effects/layout, brand owns typography/identity, and motion owns timing/springs. Scene overrides use allowed partial token groups, never unrestricted recursive merging. There is no extra project-override layer in this implementation. Resolve validated immutable snapshots outside per-frame work. This supersedes the earlier provisional brand/project ordering.

Implemented in `packages/themes`: isolated explicit registries with duplicate/unknown-ID errors, optional sealing, serializable version 1 configuration and frozen resolved output; Aurora Finance/Ember Studio brands, cinematic/minimal styles, elegant/energetic motion, and a separate React provider/hook. The third-brand tutorial and safe extension policy are in [THEME_SYSTEM.md](THEME_SYSTEM.md). The app showcase uses the same scene for all selections, without style-ID branches. The original intro intentionally remains sample-local and unchanged.

Typography plans include locally available licensed fonts, explicit weights, line heights, fallback policy, script coverage, and readiness checks. Detect missing fonts before rendering; do not silently change line breaks through network-loaded fallbacks.

Phase 3B adds explicit local-font definitions with human license attestation, same-origin public paths, browser FontFace loading, and an optional Remotion capture gate with bounded failure handling. No font files were obtained or bundled; demos continue to use system stacks. Mocked loader tests do not establish real-font cross-browser capture reliability, glyph coverage, or license correctness. Those remain future acceptance work.

Phase 3C extends that API with a versioned immutable manifest, exact required family/weight/style checks and an owned promise lifecycle with timeout/retry semantics. Two small, unmodified OFL-licensed Atkinson Hyperlegible faces now serve as a real QA fixture; upstream license/provenance/hashes are included. The original brands retain their system stacks and are reported in compatibility mode. Font availability is verified in headless rendering, not equated with all-language glyph/shaping correctness. See [RENDERING_RELIABILITY.md](RENDERING_RELIABILITY.md).

Visual-style presets may coordinate spacing, texture, contrast, borders, and composition rules. Motion presets specify frame-based timing and easing, independent of brand identity. Provide safe-area tokens for multiple aspect ratios and human review for readability and contrast.

Icons use deterministic SVG paths where possible. Lucide and Phosphor remain optional adapters rather than mandatory UI dependencies. Web interaction patterns inspired by shadcn must be adapted deliberately for video; focus state, portals, CSS transitions, and event-driven layout are not video animation primitives. Phase 3D.3 charts use explicit data and frame-derived animation. The Phase 3D.2 Dynamic Island is video-native and optional for a minimal starter.

## 10. Deterministic animation requirements

- Derive all visual animation from Remotion's current frame and composition FPS through deterministic calculations, interpolation, or frame-driven springs.
- No wall-clock time, unseeded randomness, timers, CSS transitions/keyframes, requestAnimationFrame loops, live network data, or mutable global counters in rendered scenes.
- Seed any procedural variation explicitly and store the seed with project inputs.
- Do not rely on component mount order, evaluation order, or sequential frame rendering. Rendering a frame independently or out of order must produce equivalent content.
- Resolve fonts/assets before frames are captured; use Remotion-supported readiness mechanisms when required, with bounded failure handling.
- Use explicit dimensions and stable layout. Pin the renderer environment and do not promise pixel-identical results across different OS/browser/font stacks.

Repeat-frame image comparisons in a pinned environment test visual determinism. Encoded file hashes alone are not a reliable cross-platform determinism test because codecs and container metadata can vary.

## 11. Audio, captions, and sound design

Plan separate narration, music, and effects tracks with explicit start, trim, duration, gain, and fades. Derive envelopes and synchronization from frame timing. Validate media metadata, clipping risk, loudness targets, and rights; do not claim professional mastering from simple gain arithmetic. Decide measurable loudness/peak targets per delivery profile during Phase 4.

Captions use reviewed text, locale, and frame-aligned cue intervals, with separate styling and safe-area placement. Plan a normalized internal cue contract plus import/export for common subtitle formats when needed. Transcription is optional and must not be required for local playback or rendering.

When narration or visual assets are missing, pause the workflow and request the user's files or explicit approval of a temporary alternative. Never silently fabricate a final voiceover or substitute unapproved assets. Audio/caption automation and integrations are not present in Phase 1.

## 12. AI workflow and human checkpoints

The intended sequence is brief → research → script → storyboard → asset plan → scene assembly → captions/sound → QA → render. Humans can execute every step without an AI provider. Each stage will declare required inputs, reviewable outputs, validation evidence, and approval conditions.

Required checkpoints include factual/source review, script approval, storyboard/brand approval, provision or approval of narration, rights and visual-asset approval, rough-cut review, and final delivery approval. Record approval against the exact artifact revision or hash. Material edits invalidate downstream approvals; a previous “approved” flag cannot authorize changed content.

Agents propose bounded changes and expose failures; they do not silently overwrite assets, invent citations, approve their own creative output, publish content, or bypass blocked stages. Provider credentials stay in local environment variables outside Git. Research and external prompts are untrusted input. Workflow records can include audit timestamps, but render frames must not depend on those timestamps.

## 13. Rendering and quality assurance

The future local path is validate → resolve/stage → preview → render → inspect. Expose composition dimensions, FPS, timeline length, theme, and asset readiness before expensive work. Fail early on invalid inputs or missing assets.

Automated checks will cover schema errors, type safety, timing math, deterministic helper behavior, frame sampling, asset containment, and render smoke tests. Add visual regressions only with reviewed baselines and a pinned environment. Human QA covers narrative accuracy, typography, safe areas, transitions, audio/caption sync, brand consistency, and licensing. Automated checks do not replace aesthetic approval.

Phase 3C implements an opt-in subset: actual DOM/scroll/line-box/safe-area findings, exact repeat PNG pixels, cross-theme fixtures, MP4 metadata/decode checks and versioned JSON quality reports. Capture, compare and approval are separate operations. Missing/unapproved baselines, environment drift, unexpected pixels, invalid cases/assets/output and critical layouts fail quality gates. Default comparison is zero-tolerance; no images are silently normalized or approved. Browser/font setup is explicit and local; full media staging and delivery-specific audio QA remain future phases.

Delivery profiles later define aspect ratio, resolution, codec/container, caption strategy, audio targets, and quality/performance tradeoffs. Keep render provenance beside output, outside engine Git. Never imply a render succeeded without checking process status and output validity.

## 14. Performance and storage management

Bound composition complexity, texture sizes, decode load, and concurrent renders. Measure before adding caching or optimization layers. Use proxies/preprocessing only through explicit, non-destructive steps with recorded settings and source hashes. Avoid fetching or reprocessing identical media per frame.

Cache keys must include relevant input, asset, engine, and environment versions. Cache deletion is limited to designated generated roots and must be inspectable. Report disk requirements and actionable out-of-space errors. Add large-file checks before release; broad extension ignores do not catch every binary format.

## 15. Beginner installation and onboarding

Phase 2 supplies README instructions for prerequisites, installing pinned dependencies with npm, previewing the sample in Remotion Studio, editing sample-local text/style data, and rendering locally. Installation, Studio HTTP readiness, and rendering were executed; an independent beginner's interactive walkthrough remains a human review step. Provide exact commands only after they exist and are verified.

Use a tiny self-contained sample without external services, keys, or large downloads beyond documented runtime tooling. Explain engine versus video project, frames versus seconds, preview versus final render, and output locations. Include troubleshooting for runtime versions, renderer/browser setup, missing fonts, asset paths, and platform-specific issues. Document which platforms were actually tested rather than claiming universal support.

## 16. Security, licensing, and reproducibility

- Treat project code as executable trusted code; JSON validation is not a sandbox. Do not run unknown scenes automatically.
- Contain asset paths and local serving roots, handle symlinks, reject unsupported URL schemes, and avoid shell interpolation of project values.
- Network access is opt-in during preparation; local starter rendering must not depend on external content services after dependency/browser setup. Engine-owned future local servers should bind to loopback by default. Known upstream exception: Remotion Studio 4.0.541 advertises a LAN address; the starter uses the unmodified CLI and documents trusted-network/firewall precautions rather than claiming loopback isolation or authentication.
- Keep secrets and private client material out of Git, logs, screenshots, and sample inputs. Do not send media to AI services without informed approval.
- Select the framework license before release. Track asset/font/icon/music licenses, source URLs, attribution, and usage permissions. Review applicable Remotion commercial terms separately.
- Record engine revision, runtime/dependency versions, configuration, asset hashes, seeds, and render settings. Document environmental limits on reproducibility and never commit secrets in provenance.

## 17. Phased roadmap and acceptance criteria

| Phase | Deliverable | Acceptance gate |
| --- | --- | --- |
| 1 — Foundation | Directory skeleton, README, blueprint, architecture, roadmap, agent policy, ignores | Requested files exist; links/status align; no runtime implementation, dependencies, media, or separate project repository introduced |
| 2 — Minimal local starter | Actual workspace setup, pinned dependencies, minimal validation, one local sample, Studio preview and local render path | Fresh-install walkthrough works on documented test platform; type/schema tests pass; sample renders; repeat frame checks pass; no cloud credentials needed |
| 3 — Reusable visual system | Theme contracts, two brands, video primitives, small template set, custom scene example | Brand swap without shared-code edits; invalid tokens rejected; template and custom scene render; video imports exclude web-only adapters |
| 4 — Production media | External project loading/staging, media manifests, narration/music/effects, captions, delivery QA | External root loads without source mutation; traversal/symlink escapes rejected; missing inputs fail clearly; caption/audio sync and rights/readiness reviews pass |
| 5 — Assisted production | Manual-first workflow state, approval records, optional agent integration | Missing approvals block progression; edits invalidate approval; no provider needed to render; mock-provider tests cover failure/privacy boundaries |
| 6 — Release hardening | Profiling, reproducibility evidence, license and security checks, beginner release guide | Measured baseline and budget met; clean onboarding and repeat renders pass; dependency/license review complete; known limitations documented |

Detailed deliverables, dependencies, acceptance tests, and the exact Phase 2 sequence are in [ROADMAP.md](ROADMAP.md). Later features are not implicitly delivered when an earlier phase ends. Phase 3D.2 explicitly added optional icon adapters and Dynamic Island; Phase 3D.3 explicitly added data visualizations.

Phase 3 is split: **3A** delivers the theme contracts/registry/resolver and showcase. Phase 3A alone does not imply completion of the full Phase 3 gate.
Phase 3B now implements the focused component/motion foundation and minimal opt-in font loading, without complete templates or bundled-font fixtures. **3C** is recommended for human-approved font fixtures, text/safe-area QA, and reviewed visual regression. The broader Phase 3 gate is not implicitly complete.

Phase 3C now implements the technical reliability mechanisms and supplies candidate images. This does not retroactively approve them or complete human visual review. Explicit user authorization subsequently permitted independent Phase 3D.1 advanced-surface work while retaining the pending baseline checkpoint; no Phase 4 project-storage work is implied.

Phase 3D.4B adds external PNG/sequence/opaque video compositing and depth, sweep and glow components, plus AdvancedEffectsShowcase (15 total compositions). See [cinematic APIs and limits](CINEMATIC_EFFECTS.md). Technical validation is recorded separately; human visual approval remains pending. No real-time 3D engine, Phase 4 staging/storage or Phase 5 automation is included.
