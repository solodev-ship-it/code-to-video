# Implementation Roadmap

## Status

Phases 1–3B provide the working starter, themes and video-native primitives. Phase 3C's technical rendering-reliability and visual-QA system is implemented and locally validated; **human visual baseline approval remains pending**. Explicit authorization permitted independent Phase 3D.1 surfaces and Phase 3D.2 icons/Dynamic Island without approving those baselines. Phase 3D.3 and Phases 4–6 remain planned. Each phase requires authorization; [the blueprint](CODE_TO_VIDEO_BLUEPRINT.md) is the requirements reference.

## Phase 1 — Foundation

**Dependencies:** none.

**Deliverables:** requested module directories, README, blueprint, architecture, roadmap, agent rules, and scoped ignore policy.

**Acceptance tests:** inspect actual filesystem tree; verify all requested files and links; verify consistent planned/implemented labels; confirm no manifests, installed packages, scenes, media, automation, dashboard, remote, or separate project repository were added.

**Exit:** human architecture review. Git currently resolves to an enclosing repository; decide project-local repository ownership separately rather than modifying an unrelated repository.

## Phase 2 — Minimal local starter

**Dependencies:** approved Phase 1; permission to install the actual starter dependencies.

**Deliverables:** minimal workspace manifests and lockfile; compatible TypeScript/React/Remotion setup; basic project/scene configuration validation; deterministic timing helper; one tiny local sample; Remotion Studio integration; actual local preview/render commands; tested beginner instructions and baseline checks.

**Implementation sequence (original plan; actual outcomes and remaining gate below):**

1. Confirm foundation approval, supported initial test platform, and whether a project-local Git repository should be initialized. Do not create a remote or alter the enclosing repository.
2. Check upstream requirements; select and document a supported Node version, one workspace package manager, aligned Remotion packages, and compatible React/TypeScript versions. Review license constraints.
3. Add only necessary root/module manifests, a lockfile, TypeScript configuration, and minimal test/lint tooling. Document the actual dependency purpose and installation procedure.
4. Implement and test the smallest versioned project/scene validation subset: dimensions, integer FPS, scene IDs and frame intervals, supported schema version, and clear invalid-input errors. Defer unused production contracts.
5. Implement minimal frame-timing helpers and one self-contained composition using simple local content. Wire composition registration to Remotion Studio; avoid third-party UI adapters and large assets.
6. Add working commands for validation, type checking, tests, local preview, and rendering the sample. Make output locations explicit and ignored. Do not invent an external-project loader yet.
7. Add a render smoke test and a repeated-frame comparison in a documented pinned environment; check independent/out-of-order frame behavior.
8. Test a clean install → preview → edit → render walkthrough on the stated platform without cloud credentials. Record output metadata and all check results; update status documentation accurately and request review.

**Acceptance tests:** clean install from lockfile; no unresolved workspace imports; type checks and schema/timing tests pass, including invalid inputs; preview opens; sample renders with expected dimensions, FPS, and duration; repeat sampled frames match in the pinned environment; no service credentials or remote content required. Test commands become part of the documentation only when implemented.

### Executed validation — November 9, 2026

- Environment: macOS 26.6.2, arm64; Node 24.7.0; npm 11.18.0; Git 2.54.0; renderer Chrome Headless Shell 158.0.8127.2.
- `npm install --cache .cache/npm`, then `npm ci --cache .cache/npm`: passed; 246 packages installed, audit reported zero vulnerabilities. npm warned about esbuild's unapproved lifecycle script; bundling worked with its platform binary, without broad script approval.
- `npm run check` after the lockfile reinstall: passed strict TypeScript and 21 unit tests, including invalid configurations and independent timing calculations.
- `npm run compositions`: discovered `CodeToVideoIntro`, 1920×1080, 30 FPS, 150 frames / 5 seconds.
- `npm run studio` with `BROWSER=none`: bundled and served HTML at localhost:3000, HTTP 200; test server stopped afterward. This is a readiness smoke test, not a manual playback/edit walkthrough. Upstream Studio advertises a LAN address; trusted-network guidance is in README.
- `npm run render`: passed with concurrency 1 and parallel encoding disabled. `renders/CodeToVideoIntro.mp4` exists, 234,525 bytes. System `ffprobe` counted 150 frames and confirmed H.264, 1920×1080, 30/1 FPS, 5.000 seconds. System `ffmpeg -v error -i renders/CodeToVideoIntro.mp4 -f null -` decoded the full file successfully.
- `npm run test:frames`: passed eight independent still renders; repeated frames 0, 45, 90, and 149 matched in nonsequential order. Frame 90 was inspected for readable layout; this is not a human-approved baseline or cross-platform determinism guarantee.
- `npm run browser:ensure`: passed. `npm exec --workspace=@code-to-video/studio -- remotion versions`: all installed Remotion packages match 4.0.541.

**Scope decisions:** no empty packages, schema library, linter framework, custom CLI, external project loader, bundled font, or third-party UI/animation dependency was needed. Minimal validation and timing functions remain app-local until reuse justifies extraction. npm/CLI transitive dependencies do not imply implemented AI, caption, or template features. No Git initialization/remote or separate project repository was created; enclosing repository ownership remains unresolved.

**Gate update:** Phase 2 is complete and visually approved by the user. Other operating systems, an independent beginner walkthrough, and a fresh-machine browser experience have not been tested by the coding agent; these remain broader onboarding limitations, not claimed results.

## Phase 3 — Reusable visual system

**Dependencies:** stable local starter and validated timing/data contracts.

**Deliverables:** semantic theme resolution, local font readiness, at least two brand fixtures, video-native primitives, a small useful template set, and a custom React scene example. Add an icon or chart adapter only for a demonstrated need; keep web-only UI separate.

**Acceptance tests:** swap brands without edits to shared components; reject incomplete/invalid theme data; verify font readiness and text layout; render template and custom scenes; compare approved frames; confirm video dependency graph excludes web-interaction requirements. No Dynamic Island requirement at this gate.

### Phase 3A — Extensible multi-brand design system (implemented)

**Deliverables:** real themes workspace; strict TypeScript contracts and handwritten version 1 validation; explicit isolated registries with duplicate/unknown-ID errors and sealing; pure immutable resolution; separate React context; Aurora Finance and Ember Studio brands; cinematic/minimal styles; elegant/energetic motion; bounded scene overrides; one theme-aware scene with `ThemeShowcase` plus four preset registrations; actual inputProps support; third-brand source example and extension tutorial. No third-party dependency was added.

**Architecture decision:** keep theme contracts/validation inside the implemented themes package. Precedence is defaults → style → brand → motion → scene, with explicit property ownership and known shallow group merges. No arbitrary recursive merge, shared package singleton, plugin discovery, per-frame registration, or style-ID conditionals. Original intro source/configuration/helpers remain unchanged.

**Executed validation — November 9, 2026:**

- `npm install --ignore-scripts --cache .cache/npm`: added only the local themes workspace link; subsequent `npm ci --ignore-scripts --cache .cache/npm` successfully reinstalled the lockfile (247 packages). Audit reported zero vulnerabilities. Existing external package versions are unchanged.
- `npm run check`: strict TypeScript in both workspaces passed; **55 tests passed** (21 original, 2 showcase integration, 32 theme tests). Coverage includes registration, duplicates, missing/unknown IDs, colors/ranges, JSON-only inputs, version errors, precedence, deep freeze/isolation, serialization, deterministic timing, different brands/styles, and independently registered third brand/style/motion modules.
- `npm run compositions`: original intro plus `ThemeShowcase`, `ThemeAuroraCinematic`, `ThemeAuroraMinimal`, `ThemeEmberCinematic`, `ThemeEmberMinimal` are discoverable. New themes are 1920×1080, 30 FPS, 180 frames / 6 seconds.
- `npm run test:frames`: intro repeated independent frames passed. Concurrent discovery initially caused a nonfatal webpack cache-write warning; subsequent render checks were run sequentially to avoid cache contention.
- `npm run test:themes`: nine real inputProps still renders generated valid full-HD PNGs for Aurora cinematic, Aurora minimal, and Ember minimal; repeated out-of-order frames matched. Changing only motion altered an early frame. A tenth attempted render with an unknown brand failed clearly and produced no output. Output directories are unique under ignored `renders/theme-checks/`; final successful run: `run-i6Z8MN`.
- `npm run render:aurora`, `npm run render:ember`: succeeded at concurrency 1 with overwrite protection. `ThemeAuroraCinematic.mp4` is **599,712 bytes**; `ThemeEmberMinimal.mp4` is **308,400 bytes**. System ffprobe confirmed H.264, 1920×1080, 30/1 FPS, 180 frames, exactly 6 seconds for both; full ffmpeg decoding passed. Three settled sample PNGs were inspected for layout and visual differentiation; formal human approval remains outstanding.
- `npm run browser:ensure` and `remotion versions`: browser ready, all Remotion packages still 4.0.541. The pre-existing intro MP4 was not overwritten.
- Root Studio startup and the documented Studio `--props` JSON command both returned HTTP 200; smoke-test servers were stopped. Manual interactive theme playback was not performed.
- Preservation SHA-256: intro source `90b094aa8d40a26769768a0b9393b6c6e78f8fa4d78b15fffc22829a385bd127`; original intro MP4 `b06e5f8cd9b33de84b3ca97951ff5781b780805a35a4bab3e33b224d3c5fcb12`. These match the pre-task baseline.

**Limits:** system fonts only; no bundled fonts/readiness enforcement, full material effects, structural-variant registry, reusable UI library, external media/project loader, AI automation, or cross-platform guarantee. The fixed showcase layout is not guaranteed to fit every extreme valid token combination. Large-registry performance has not been benchmarked. Final checks and preservation hashes are recorded during task completion.

### Phase 3B — Video-native component foundation (implemented)

**Dependencies:** working Phase 3A contracts and explicit user authorization for Phase 3B.

**Delivered scope:** real UI workspace with `VideoText`, `AnimatedTitle`, `VideoCard`, `VideoSurface`, `VideoStack`, `VideoGrid`, `VideoSafeArea`; reusable `VideoMotion`; pure fade/slide/scale/reveal plus stagger scheduling; explicit reduced motion; opt-in same-origin FontFace loader/license metadata and Remotion readiness gate. Shared component showcase has three registrations at 1920×1080, 30 FPS, 270 frames / 9 seconds and supports both existing brands/styles through validated inputProps.

**Scope adjustment:** the current user task explicitly defers complete scene templates. Fonts are supported through a minimal opt-in API, not newly downloaded/bundled binaries. Human license approval and a real licensed capture fixture remain prerequisites for stronger font guarantees. No core restructuring, theme contract changes, remote registry, advanced chart/material feature, or new third-party package is needed.

**Studio warning investigation:** reproduced `Could not find or extract defaultProps for composition "ThemeEmberMinimal"` using the actual CLI 4.0.541 source extractor. Computed IDs/defaults inside `.map()` work for rendering but cannot be statically edited. Replaced the five theme registrations with explicit IDs/inline literal defaultProps; new component registrations follow the same rule. All continue sharing the existing scene components. The real extractor and an in-memory codemod save round trip now pass for all eight editable compositions. No warning suppression or dependency patch is used. Manual browser Save was not performed.

**Executed validation — November 9, 2026:**

- `npm install --ignore-scripts --cache .cache/npm`: added only the local UI workspace link; a subsequent `npm ci --ignore-scripts --cache .cache/npm` successfully reinstalled the lockfile (248 packages). Audit reported zero vulnerabilities. Existing React, TypeScript, and aligned Remotion 4.0.541 versions are retained.
- `npm run check`: strict TypeScript passed for Studio/themes/UI; **76 tests passed** (24 Studio, 32 theme, 20 UI). UI covers SSR output/theme consumption, slots, layouts, independent animation frames, easing/FPS/stagger/reduced motion, and mocked font validation/load/failure handling. All 55 prior tests remain passing. `check` also runs the Studio source-save regression diagnostic.
- `npm run compositions`: all nine registrations are discoverable; original intro and five theme compositions retain their metadata.
- `npm run test:components`: ten valid full-HD PNGs cover all four brand/style pairs, independent repeated frames, and explicit reduced motion; an invalid reduced-motion render fails without output. Settled Aurora cinematic and Ember minimal frames were inspected for readable hierarchy and safe layout, not formal contrast certification or human baseline approval.
- `npm run render:components:aurora`, `npm run render:components:ember`: succeeded at concurrency 1 with parallel encoding disabled and overwrite protection. Outputs are **788,550 bytes** and **597,032 bytes** respectively. System ffprobe counted 270 frames and confirmed H.264, 1920×1080, 30/1 FPS, exactly 9 seconds for both. Full ffmpeg decoding passed.
- `npm run test:frames` and `npm run test:themes`: passed after registration changes; no existing rendered MP4 was overwritten. Preservation hashes are checked at task completion.
- `npm run browser:ensure` and `remotion versions`: browser available, all Remotion packages match 4.0.541. A Studio startup smoke test passed with HTTP 200 on an isolated port, and its process was stopped. The first custom-port attempt exposed a pre-existing hardcoded `--port=3000` in the script that produced duplicate flags; removing the fixed flag preserves Remotion's default port and makes the documented port override work. The retry passed. No manual browser playback/Save click is claimed.

**Known limits:** system fonts remain in demos; font loader tests use mock faces, not a licensed real-font/browser success fixture. No automatic fitting/glyph coverage, platform safe-area certification, font lifecycle manager, published package build, complete templates, Dynamic Island, or advanced materials/charts. The Studio regression diagnostic uses a pinned transitive CLI internal API and must be reviewed on upgrades. New visuals await human approval.

### Phase 3C — Rendering reliability and visual quality assurance (implemented; baseline approval pending)

**Dependencies:** working Phase 3A/3B contracts, pinned Remotion/React/TypeScript versions and reviewed open-font provenance.

**Delivered scope:** versioned local-font manifests, exact required family/weight/style verification, an explicitly owned deduplicating loader with timeout/retry handling, two small unmodified OFL-licensed Atkinson Hyperlegible faces with upstream license/provenance/hashes, opt-in browser layout/safe-area diagnostics, PNG visual capture/comparison, explicit baseline approval, cross-theme validation and machine-readable JSON reports. One literal `ReliabilityFixture` is added; the original nine compositions remain unchanged.

**Architecture/dependency decision:** keep Node filesystem, process, renderer and PNG comparison code under `scripts/qa` and `tests/`, outside browser UI entry points. Root devDependencies declare aligned `@remotion/bundler`/`@remotion/renderer` 4.0.541 plus `pngjs` 7.0.0, `pixelmatch` 8.0.0 and `@types/pngjs` 6.0.5. No existing package version was upgraded.

**Executed validation — November 9, 2026:**

- Baseline audit before edits: confirmed 76 passing tests, strict TypeScript across Studio/themes/UI, nine discoverable compositions, clean Studio default-props extraction and all five pre-existing MP4 hashes.
- `npm install --ignore-scripts --cache .cache/npm` and subsequent `npm ci --ignore-scripts --cache .cache/npm`: succeeded, zero audit vulnerabilities, all Remotion packages remain 4.0.541.
- `npm run check`: strict TypeScript passed for Studio, themes, UI and QA tooling; **95 fast tests passed** (24 Studio, 32 theme, 30 UI, 9 reliability; all 76 baseline tests retained). Studio extraction/in-memory default-props saving passed for all nine editable literal registrations.
- `npm run compositions`: ten compositions discovered (`CodeToVideoIntro`, five theme, three component, `ReliabilityFixture`).
- `npm run qa:fonts`: verified committed font/OFL SHA-256 hashes, loaded both 400 and 700 local faces in headless Chrome, and rejected a missing required font asset during render.
- `npm run qa:layout`: verified real browser passing/failing text overflow, clipping, unexpected wrap, safe-area violation, explicit animation exemption, font-not-ready/fallback findings, optional/non-ASCII copy and 1080p/720p geometry.
- `npm run qa:themes`: rendered 20 parameterized cases across Aurora/Ember × cinematic/minimal, frames 15/90/260 and optional/non-ASCII copy; all 20 independent repeat PNG pairs matched with zero differing pixels (`phase3c-final-v2-themes`).
- `npm run qa:render`: verified exact repeat PNGs for existing intro/component scenes, rendered a fresh 1920×1080/30 FPS/5-second H.264 intro MP4, passed ffprobe metadata and full ffmpeg decode, and verified negative-gate rejection for missing composition, invalid props and critical layout (`phase3c-final-v2-render`).
- `npm run qa:all -- --run phase3c-final-v2`: executed all technical suites, captured 14 visual candidates (`phase3c-final-v2-visual`), and exited nonzero at comparison because all 14 baselines are still `MISSING_BASELINE`. No baseline images were approved automatically.
- Existing intro/theme/component scene files and all five pre-existing MP4s remain unmodified. Sibling `video-projects` and the original documentary were not touched.

**Pending checkpoint and limits:** human review and explicit `npm run qa:visual:approve` for selected candidates; only then can `qa:visual:compare` and `qa:all` pass. Original compositions retain system-font tokens and report compatibility warnings. Browser layout checks measure layout/line boxes, not visible glyph ink or complex-script shaping; Khmer coverage is not claimed. Remotion 4.0.541 emits an upstream `Target.closeTarget` warning when cleaning up intentional negative-path selection failures; the primary failure is preserved and documented in [RENDERING_RELIABILITY.md](RENDERING_RELIABILITY.md).

### Phase 3C.6 — QA expected-rejection hardening

**Root cause and reproduction:** the final audit found that the three negative render tests accepted any failed status. The unchanged source-preserving `GPU_LOST` audit probe reproduced the false positive before implementation and is rejected after the fix.

**Focused implementation:** explicit expectations now bind each case/props/frame to the intended missing-composition error, specific invalid-props validator, or structured critical-layout findings. A QA-owned `CRITICAL_LAYOUT` error and additive causal metadata preserve stable codes, original errors/stacks and diagnostic context. Unknown failures, missing rejection, opaque/mixed wrappers and missing or wrong evidence fail closed with meaningful mismatch codes. No themes, UI/font/layout implementations, registrations, renderer/comparison algorithms, package versions, baseline images or Git ownership are changed.

**Regression coverage:** 39 new tests exercise all intended categories; GPU loss, browser crashes, timeouts, I/O/arbitrary failures; unexpected success; identity/category/severity/element/frame/exemption mismatches; causal/aggregate/cycle handling; the actual shared harness; and actual CLI nonzero exits using in-memory boundary injection. The original 95 tests remain present.

**Executed validation:** `npm run check` passed strict TypeScript plus **134 tests** (24 Studio, 32 themes, 30 UI, 48 reliability), including all original 95 and the 39 new regressions. `npm run compositions` passed with all ten compositions. `qa:fonts`, `qa:layout`, `qa:themes -- --run phase3c6-themes`, and `qa:render -- --run phase3c6-render` all exited 0. Real negative runs matched the intended missing-composition and validator errors; critical layout carried `CRITICAL_LAYOUT` with the required scoped overflow/clipping findings. `GPU_LOST` and unexpected success fault injections make the actual CLI exit 1.

`npm run qa:all -- --run phase3c6-all` passed its technical stages and captured all 14 candidates, then exited 1 solely for 14 `MISSING_BASELINE` comparisons. Every candidate PNG hash matches the prior audit set; no baseline was approved or overwritten. Twenty cross-theme cases and two existing-composition smoke cases had exact independent repeat pixels; the new H.264 intro MP4 remained 1920×1080, 30 FPS, 150 frames, 5 seconds and passed full decoding. The expected missing-font 404 and upstream cleanup warnings remain visible only in their intentional negative paths.

**Remaining checkpoint:** human baseline approval. Full command exit codes, causal/diagnostic checks and preservation evidence are recorded under ignored `tests/visual/reports/phase3c6-hardening/`. Baseline transactionality, computed font-weight/style coverage, system-font portability and repository ownership were reviewed only; no unrelated fixes are folded into this phase. They are follow-up/governance risks rather than new blockers for reviewing this unchanged candidate set; resolve Git ownership before an independently versioned production release. Phase 3D was not started.

### Phase 3D.1 — Professional glass and advanced surfaces (implemented)

**Visual-QA finalization:** ordinary glass labels now use semantic foreground locally; 176 rendered-label checks exceed 4.5:1 across the supported stress matrix. Original candidates remain preserved and unapproved. The organized human-review handoff and current evidence are in [PHASE_3D1_FINALIZATION.md](PHASE_3D1_FINALIZATION.md). This does not authorize Phase 3D.2.

**Authorization:** explicit user request supersedes the earlier recommendation to gate all Phase 3D work on baseline approval. That human checkpoint remains mandatory for the aggregate visual gate, not a newly introduced material failure.

**Delivered:** immutable bounded appearance resolver, seven material variants, four semantic presets, `VideoGlassSurface`, compatible optional appearance props on existing surfaces/cards, explicit simulated-frost fallback, fixed-seed optional noise, existing-motion-based highlight/illumination/blur evaluation, and one literal 1920×1080/30 FPS/10-second showcase. No dependency installation/version change or theme rewrite.

**Validation:** 163 fast tests (all original 134 plus 29), strict TypeScript and ten editable Studio extraction/save checks pass. Surface QA run `phase3d1-surfaces-final` passes 46 exact-repeat pairs, parallel/out-of-order equality, causal blur/border/shadow/alpha checks and fully decoded 300-frame H.264 MP4. Blur edge-energy ratio .00666; representative solid/one-glass/three-glass median capture latency 456/570/727 ms on Apple M1 Pro, pinned Chrome/swangle. These timings are not universal GPU guarantees. Candidates remain unapproved. Detailed evidence, retained failed attempts, output paths and limitations: [ADVANCED_SURFACES.md](ADVANCED_SURFACES.md).

**Next:** human review of existing/new candidates; only with separate authorization begin Phase 3D.2 icons and video-native Dynamic Island. No Phase 3D.2 implementation is included.

### Phase 3D.2 — Icons and Dynamic Island (implemented)

Explicitly authorized scope: owned SVG registry, Lucide/Phosphor optional adapters and custom paths; bounded deterministic icon effects; pure sequential compact/expanded/collapsing/hidden state; theme/glass-compatible container; notification/statistic/progress/announcement/media presentations; one literal 1080p/30 FPS/11-second showcase. No phone OS interaction or live data.

Validation: baseline 167 → **185 passing fast tests**, strict TypeScript, **12 discoverable compositions**, eleven Studio-editable literal registrations. Targeted run `phase3d2-targeted-a` passes twelve exact PNG repeat pairs, independent out-of-order equality, actual painted SVG evidence, geometry/phase/backdrop assertions and one fully decoded 330-frame H.264 MP4. Original Phase 3C candidates remain unapproved and unmodified; full `qa:all` and unchanged old expensive suites were deliberately not rerun. Details, licenses and limitations: [ICONS_AND_DYNAMIC_ISLAND.md](ICONS_AND_DYNAMIC_ISLAND.md).

Next: human inspection of the new candidates, then separately authorize Phase 3D.3 data visualizations. No chart framework is delivered here.

### Baseline review and delivery QA policy (still pending)

**Dependencies:** human review/approval of Phase 3C visual baselines.

**Recommended scope:** approve the initial 14-case reference set in the pinned environment; add delivery-profile safe-area presets (16:9, 9:16, 1:1) and explicit script/glyph-coverage fixtures only with verified fonts; then evaluate one small reusable scene template pair before Phase 4 external project storage.

## Phase 4 — Independent projects and production media

**Dependencies:** stable scene/theme contracts and proven local rendering.

**Deliverables:** explicit external project-root selection, versioned asset manifests, controlled staging, source/content hashes, narration/music/effects tracks, reviewed caption cues, render provenance, delivery profiles, and documented media QA targets. Use disposable test fixtures, not a newly created video-projects repository.

**Acceptance tests:** load a project outside the engine without changing source media; validate browser-readable staged assets; reject traversal, symlink escapes, unsupported schemes, missing files, and duplicate IDs; verify caption boundary frames, audio trim/fades, and sync against reviewed fixtures; verify readiness/rights diagnostics, output metadata, and scoped cleanup. Confirm production media and outputs stay outside engine Git.

## Phase 5 — Human-reviewed assisted production

**Dependencies:** stable versioned artifacts and production QA boundaries.

**Deliverables:** manual-first production state machine, research/script/storyboard/asset-plan artifact contracts, revision-bound approvals, explicit missing-input requests, and one optional provider integration only if approved and useful.

**Acceptance tests:** block stages on missing narration/assets/approval; invalidate downstream approval after material changes; reject invalid artifact versions; keep rendering operational with all AI integrations disabled; test provider failure with mocks; verify no unapproved overwrite, external upload, or secret logging.

## Phase 6 — Release hardening

**Dependencies:** Phases 2–5 gates and selected release scope.

**Deliverables:** performance baselines and explicit budgets measured on documented hardware, cache/storage policies, compatibility matrix, migration fixtures, security/license review, provenance guidance, and beginner-tested release documentation.

**Acceptance tests:** clean beginner walkthrough; repeat renders in the pinned environment; performance regression checks against the recorded budget; scoped cache cleanup; secret and large-file checks; dependency and asset license audit; documented supported platforms and limitations; no claim of cross-platform byte-identical encoding.

## Deferred extensions

Optional Lucide/Phosphor/chart adapters, shadcn-inspired web controls, a video-native Dynamic Island, expanded templates, additional AI providers, and cloud rendering require separate scope and acceptance tests. They are not hidden dependencies of the local starter. No dashboard is part of this roadmap's required delivery.
