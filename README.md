# Code to Video

A modular, AI-assisted video production framework being built with **TypeScript, React, and Remotion** for documentaries, explainers, product showcases, corporate videos, and social content.

Developed by **Rorn Bunthong — KrungTech**. First-party framework code is [MIT licensed](LICENSE), copyright (c) 2026 Rorn Bunthong. KrungTech is a separate project credit, not an assignment of copyright. Remotion and other dependencies/assets retain their [own terms and notices](THIRD_PARTY_NOTICES.md).

## Current status — CLI and two production templates

**Release preparation:** a private local-install candidate and clean-consumer render check now work; browser-free CI, license inventory and draft release/version/onboarding docs are prepared. This is **not v1 or a registry release**: root remains `0.1.0`/private; first-party MIT is selected, but third-party review, final package/version policy, visual approvals and real CI results remain open. Start with [onboarding](docs/ONBOARDING.md) and [release preparation/evidence](docs/RELEASE_V1.md).

The optional local CLI now creates projects, opens Studio and renders MP4s. Two theme-aware templates are included: a six-second title card and an eight-second three-point explainer, with copy explicitly marked as sample. Start with `npm run build:cli`, then `npm run cli -- --help`. See [CLI and templates](docs/CLI_TEMPLATES.md). The package remains private and unpublished; visual review is pending.

**End-to-end QA:** `npm run qa:e2e` installs the lockfile in an isolated source copy, edits/renders a standalone sample, verifies timing/full decode and exact frame repeats, checks four specific CLI rejections, then runs `qa:all`. It keeps a nonzero exit when visual references are unapproved; no baseline is approved automatically. See [reproduction and evidence](docs/END_TO_END_QA.md). Allow several GiB of free disk space and provision the browser first.

Technical acceptance is complete; human review is pending. The aggregate continuation now reaches comparison and is blocked only by 14 unapproved visual baselines, not the earlier disk-space failure.

Version 1 manifests, contained local assets, theme binding, literal Studio registrations and an external-project MP4 path are implemented. The fifteen existing showcases remain; selected project compositions are added through `CODE_TO_VIDEO_PROJECT`. See [Independent project guide](docs/PROJECT_INFRASTRUCTURE.md) for commands, source contracts and technical evidence. The sample and earlier visual candidates await human review.

**Retained clay materials:** bounded, theme-aware clay appearance data; `VideoClaySurface`, `VideoClayCard`, and `VideoClayShape`; frame-driven reveal, float, press and depth motion; and one 9-second `ClaymorphismShowcase` (**fourteen compositions total**). See [Clay materials](docs/CLAY_MATERIALS.md) for APIs, 2.5D limits and candidate renders. Human visual approval remains pending.

**Phase 3D.3 retained:** seven deterministic chart, timeline, progress and number components plus a 15-second `DataVisualizationShowcase`. The earlier twelve compositions remain (**thirteen total**). See [Data visualization](docs/DATA_VISUALIZATION.md) for data rules, APIs and targeted evidence. Showcase values are illustrative, not real-world statistics.

**Phase 3D.2 retained:** catalog-independent `VideoIcon`, optional Lucide/Phosphor adapters, custom paths, deterministic icon effects, `VideoDynamicIsland` and composable information presentations. `DynamicIslandShowcase` adds one 11-second composition; all earlier eleven remain (**twelve total**). See [Icons and Dynamic Island](docs/ICONS_AND_DYNAMIC_ISLAND.md) for APIs, licensing, targeted render evidence and unapproved screenshots.

Focused finalization has corrected the glass showcase's ordinary label contrast without changing global themes. The [human-review handoff](docs/PHASE_3D1_FINALIZATION.md) documents the original 14 preserved candidates, corrected glass screenshots, contact sheets, SHA-256 manifest and guarded approval commands. All images remain unapproved.

**Earlier capabilities retained:** engine/themes/components, Phase 3C reliability tooling, immutable advanced surfaces, four glass presets, explicit fallback and `GlassmorphismShowcase`. Original theme/font defaults remain unchanged. See [Advanced Surfaces](docs/ADVANCED_SURFACES.md) for material APIs and candidate artifacts.

**Pending checkpoint:** visual baseline approval. Candidate capture and exact repeat pixels are **not** human approval; `qa:visual:compare` and `qa:all` intentionally fail while references are unapproved/missing. No real baselines have been approved automatically.

**Still not implemented:** a larger template gallery, comprehensive UI, caption/audio production, AI workflows, dashboard or a published custom CLI. See the [reliability guide](docs/RENDERING_RELIABILITY.md), [component guide](docs/COMPONENT_SYSTEM.md) and [theme guide](docs/THEME_SYSTEM.md). Original system-font token portability and complex-script shaping remain limitations, not silently fixed claims.

## Prerequisites (macOS)

- macOS **15 or later**, per [current Remotion requirements](https://www.remotion.dev/docs#system-requirements).
- Node.js **24.x, at least 24.7.0**, with npm **11.x**. The tests use Node's native TypeScript stripping; this project deliberately requires a newer Node than Remotion's minimum Node 16.
- Git, a terminal, and a browser for Studio. No global Remotion installation is needed.
- Internet access for npm dependencies and the initial Chrome Headless Shell download (~140 MB on the tested platform). Once cached, the sample requires no online content services.

Tested on macOS 26.6.2 / Apple Silicon with Node 24.7.0, npm 11.18.0, Git 2.54.0, and Chrome Headless Shell 158.0.8127.2. Other platforms and fonts have not been validated. Use supported, security-maintained Node 24 patches; `.nvmrc` records the exact tested baseline, not a promise that it is the latest security release.

## Install on macOS

Open Terminal in your existing `code-to-video` folder. If using an already-installed [nvm](https://github.com/nvm-sh/nvm), select the tested runtime:

```sh
nvm install
nvm use
node --version
npm --version
```

Alternatively install Node 24 from [nodejs.org](https://nodejs.org/en/download), ensuring the versions meet the requirements above. Installing Git via Apple's command-line tools, if missing, is done with `xcode-select --install`.

From the repository root:

```sh
npm ci
npm run browser:ensure
npm run check
```

`npm ci` installs the committed lockfile. Do not run `npm install` in each module or install `@remotion/cli` globally. Remotion manages its renderer browser locally; a separate system FFmpeg install is not needed to render.

## Preview in Remotion Studio

```sh
npm run studio
```

Open **http://localhost:3000**, select **CodeToVideoIntro**, and play or scrub the timeline. Stop Studio with **Ctrl+C**. For a terminal-only launch that does not open a browser automatically:

```sh
BROWSER=none npm run studio
```

**Network warning:** upstream Studio advertises a LAN URL as well as localhost. Use a trusted network and firewall; do not port-forward or expose Studio publicly. This starter does not provide authentication or a loopback-binding wrapper.

## Render the sample

```sh
npm run compositions
npm run render
```

Output: **`renders/CodeToVideoIntro.mp4`** — 1920×1080, 30 FPS, 150 frames / 5 seconds, H.264 MP4, intentionally silent. Rendering uses concurrency **1** and disables parallel encoding to reduce memory use. It refuses to overwrite an existing output; deliberately rename/archive your previous render before rerunning.

Preview is interactive browser playback; render captures all frames and encodes a delivery file. One second is 30 frames in this composition, and valid frame indices are 0–149. `renders/` is generated data and ignored by Git.

Edit title/subtitle and sample-local colors in `apps/studio/src/CodeToVideoIntro.tsx`. Metadata lives in `apps/studio/src/project.ts`. The introductory choreography is intentionally designed for this fixed 5-second sample, not a generalized scene template. Changes appear in Studio; run checks and rerender to update the MP4.

## Commands (from repository root)

### Three validation levels

1. **Ordinary development:** `npm run check` — the default; TypeScript, fast tests and Studio extraction, without browser renders.
2. **Visual changes:** `npm run compositions`, preview the affected composition with `npm run studio`, then run only its relevant renderer checks. A new component does not require the entire 14-case baseline suite on every edit.
3. **Major changes, milestones and releases:** `npm run qa:all -- --run release-UNIQUE` — the unchanged full reliability/visual gate, plus separately relevant suites such as `qa:surfaces`.

Do not automatically run `qa:all` after every implementation, repeat passing expensive checks when their inputs/environment are unchanged, regenerate unchanged candidate sets unnecessarily, or auto-approve baselines. Reuse revision-bound evidence appropriately; affected changes still need relevant checks. See the [selection guide and terminal-message meanings](docs/RENDERING_RELIABILITY.md#choose-the-smallest-sufficient-validation-level) and [existing human approval commands](docs/BASELINE_APPROVAL.md).

| Command | Purpose |
| --- | --- |
| `npm run studio` | Start Remotion Studio (default port 3000; use its printed URL) |
| `npm run render` | Render the intro MP4 with concurrency 1 |
| `npm run compositions` | Discover compositions and metadata |
| `npm run browser:ensure` | Download/check Remotion's headless browser |
| `npm run typecheck` | Strict TypeScript validation, no emitted files |
| `npm test` | Configuration and pure timing unit tests |
| `npm run check` | TypeScript, unit/component tests, Studio source-save regression check |
| `npm run test:frames` | Independently render and compare repeated, out-of-order PNG frames |
| `npm run test:themes` | Render/compare theme inputProps; verify unknown-brand rejection |
| `npm run render:aurora` | Render `renders/ThemeAuroraCinematic.mp4`, overwrite-protected |
| `npm run render:ember` | Render `renders/ThemeEmberMinimal.mp4`, overwrite-protected |
| `npm run test:studio-props` | Reproduce old warning and test extraction/in-memory saving |
| `npm run test:components` | Render component frame/theme/reduced-motion checks |
| `npm run render:components:aurora` | Render dedicated Aurora component MP4 |
| `npm run render:components:ember` | Render dedicated Ember component MP4 |
| `npm run qa:fonts` | Real local-font readiness and missing-font failure checks |
| `npm run qa:layout` | Real browser passing/failing layout fixtures |
| `npm run qa:visual:capture -- --run review-a` | Generate unapproved PNG candidates in a fresh run |
| `npm run qa:visual:compare -- --run review-a` | Compare against approved references; missing references fail |
| `npm run qa:visual:approve -- ...` | Explicit named-case human approval; never run automatically |
| `npm run qa:themes` | Four-theme font/layout/exact-repeat matrix |
| `npm run qa:render` | Existing PNG repeats, fresh MP4/decode and negative quality gates |
| `npm run qa:all` | Full release gate; non-green until explicit baseline approval |
| `npm run qa:surfaces -- surfaces-UNIQUE` | Glass/fallback/alpha/layering/repeat checks, benchmark and 1080p showcase MP4 |
| `npm run qa:island -- island-UNIQUE` | Targeted icon/island PNG repeats, geometry/SVG checks and one showcase MP4 |

Frame checks create uniquely named runs under `renders/frame-checks/` and retain images for inspection. They use only the installed CLI and Node built-ins. They compare frames 0, 45, 90, and 149 within the same environment, not across operating systems. This is not yet a reviewed visual-regression baseline.

### Compare themes

Run `npm run studio` and select `ThemeShowcase`, `ThemeAuroraCinematic`, `ThemeAuroraMinimal`, `ThemeEmberCinematic`, or `ThemeEmberMinimal`. Each is 6 seconds, 1920×1080 at 30 FPS, using the same underlying theme-aware scene.

```sh
npm run render:aurora
npm run render:ember
```

Theme IDs can be selected via validated Remotion inputProps. For example:

```sh
npm run studio --workspace=@code-to-video/studio -- --props=../../examples/themes/ember-minimal.json
```

Paths in workspace CLI commands are relative to `apps/studio`. See [How to add a completely new brand or visual style](docs/THEME_SYSTEM.md#how-to-add-a-completely-new-brand-or-visual-style) for the tested third-brand example and registry API. No preset dropdown/form editor was added.

### Preview the component foundation

Run `npm run studio`, then select **ComponentShowcase**, **ComponentAuroraCinematic**, or **ComponentEmberMinimal**. Each is 1920×1080 at 30 FPS, 270 frames / 9 seconds. They share reusable typography, card/surface, stack/grid/safe-area components, and frame-motion utilities. Theme inputProps work as above; component compositions also accept explicit boolean `reducedMotion`.

```sh
npm run render:components:aurora
npm run render:components:ember
```

Existing outputs are protected from overwrite. See [COMPONENT_SYSTEM.md](docs/COMPONENT_SYSTEM.md) for exact props, motion options, font strategy, and the default-props warning investigation. Editable defaults now live as literal objects in `apps/studio/src/Root.tsx`, not computed preset registrations.

## Project structure

```text
apps/studio/
  package.json, tsconfig.json
  src/
    index.ts                 Remotion entry point
    Root.tsx                 Composition registration
    CodeToVideoIntro.tsx     Sample-local design and frame animation
    project.ts               Minimal validated config and duration derivation
    motion.ts                Pure frame math
    project.test.ts, motion.test.ts
    ThemeShowcase.tsx         One shared theme-aware demonstration scene
    showcase-themes.ts        Explicit app registry, defaults, comparison presets
    showcase-themes.test.ts   InputProps and registration checks
    ComponentShowcase.tsx     One scene composed of reusable UI primitives
    component-props.ts        Theme selectors plus explicit reduced-motion validation
    qa/                      One reliability fixture and explicit licensed font manifest
  public/fonts/atkinson/     Two small OFL font faces, full license and provenance hashes
packages/core/               Planned orchestration and timing package
packages/ui/                 Implemented video primitives, motion helpers, local-font support
packages/themes/             Implemented typed registry/resolver, presets, React context
schemas/                     Planned shared versioned schemas
workflows/, agents/          Planned human-reviewed production assistance
examples/themes/             Third-brand source example and two inputProps JSON files
scripts/check-frames.mjs     Actual render determinism check
scripts/check-themes.mjs     Actual theme frame/inputProps check
scripts/check-components.mjs Component theme/frame/reduced-motion check
scripts/check-studio-props.mjs Studio source-save regression diagnostic
docs/                        Blueprint, architecture, and roadmap
scripts/qa/                  Node-only typed capture/comparison/approval/report tooling
tests/reliability/           Fast QA unit tests, no browser required
tests/visual/                Versioned cases; approved references separate from ignored outputs
renders/                     Ignored generated output (created on render)
package.json, package-lock.json, .nvmrc
```

Studio, themes, and UI are the only package workspaces. Do not add empty manifests elsewhere. Project/scene timing validation stays local to the starter; theme contracts live in the theme package. UI consumes those contracts and remains independent of individual projects. No external project loader or dynamic scene-code registration exists.

## Phase 2 validation (historical)

- `npm install` and then lockfile reinstall with `npm ci`: successful; audit reported zero vulnerabilities at installation time.
- `npm run check`: strict TypeScript passed; **21/21 tests passed**.
- Composition discovery: **CodeToVideoIntro**, 1920×1080, 30 FPS, 150 frames.
- Studio startup: HTTP 200 and successful bundle; interactive browser playback has not been manually tested.
- `npm run render`: successful at concurrency 1; output exists, **234,525 bytes**. System `ffprobe` confirmed H.264, 1920×1080, 30/1 FPS, 150 decoded frames, 5.000 seconds; system `ffmpeg` decoded the entire file without errors. These independent verification tools are not runtime prerequisites.
- `npm run test:frames`: repeated independent frames 0, 45, 90, 149 matched. Frame 90 was visually inspected for composition/readability; final creative approval remains human-owned.
- `remotion versions`: all installed Remotion packages match **4.0.541**. React/React DOM **19.3.1**, TypeScript **5.9.3**, React/DOM types **19.3.0**, Node types **24.19.2** are pinned. TypeScript 5.9.3 is intentionally used rather than a new major without a demonstrated need.

## Phase 3A validation (historical)

Strict TypeScript passes in both workspaces; all 21 original tests remain, plus 2 showcase and 32 theme tests (**55 total**). Intro repeat-frame checks pass. Theme PNG checks cover independent inputProps, visible brand/style/motion differences, repeated out-of-order frames, and unknown-brand rejection. Both dedicated theme MP4s rendered and passed system ffprobe/ffmpeg verification: H.264, 1920×1080, 30 FPS, 180 frames, 6 seconds. The intro source and existing MP4 hashes remain unchanged. No new third-party dependency was added, only the local theme workspace link; all Remotion versions remain 4.0.541. Detailed evidence and limitations are in [the roadmap](docs/ROADMAP.md).

## Phase 3B validation (historical)

Strict TypeScript passes in all three workspaces; **76 unit/component tests pass**, including all previous tests. Studio's actual extractor/codemod supports all eight editable registrations. Component frame checks cover all four brand/style pairs, repeated independent frames, reduced motion, and invalid-props rejection; original intro/theme frame checks still pass. Two component MP4s passed independent metadata/full-decode verification: H.264, 1920×1080, 30 FPS, 270 frames, exactly 9 seconds. Existing MP4s were not overwritten. No new external package version was introduced.

Font loading is unit-tested using mock faces; no licensed success fixture was added, and real-font capture is not claimed verified. In-memory Studio save-path checks do not claim a manual browser Save click. Detailed evidence is in [the roadmap](docs/ROADMAP.md).

## Phase 3C validation

Baseline audit reconfirmed the original 76 tests, strict TypeScript and all nine existing compositions before editing. Initial Phase 3C fast checks passed **95 tests** (all original tests retained), strict TypeScript in three workspaces plus QA tools, and extraction/in-memory saving for all nine editable registrations. Discovery now includes ten compositions.

Real-browser font success/failure and layout detector fixtures pass. The shared four-theme matrix covers 20 cases, each rendered twice with exact decoded-PNG equality and hashes. A new 1080p/30 FPS/5-second intro MP4 passed ffprobe metadata and full ffmpeg decoding; original MP4s are not overwritten. Fourteen reference candidates can be captured, but **missing approved references correctly block the visual/full gate**. Known upstream cleanup warnings on intentional renderer failures are documented, not suppressed. No cross-platform pixel or Khmer-shaping guarantee is claimed.

QA browser setup is explicit (`npm run browser:ensure`); the runner reuses the cached browser and never downloads it mid-check. Independent MP4 verification additionally requires ffprobe/ffmpeg on PATH. See [RENDERING_RELIABILITY.md](docs/RENDERING_RELIABILITY.md) for approval commands, JSON reports, artifacts, limits and CI usage.

### Phase 3C.6 — Expected-rejection hardening

The final audit's status-only negative-test defect is fixed in the Node QA layer. Each case now requires its intended original error category and case identity; critical layout rejection additionally requires scoped error-severity overflow/clipping evidence. Unrelated GPU/browser/timeout/I/O failures and unexpected success cannot count as expected rejection. Optional causal metadata preserves original errors without changing report schema version 1. **All 134 fast tests pass**, including 39 new regressions that exercise the real shared matcher/harness and CLI exit behavior. The full technical QA sequence passes; `qa:all` remains blocked only by missing human-approved baselines. All 14 new candidate PNGs match the audited image hashes. No renderer, theme/UI, package version or baseline image was changed. See the [matching rules and limitations](docs/RENDERING_RELIABILITY.md#3c6--expected-rejection-hardening) and [validation record](docs/ROADMAP.md#phase-3c6--qa-expected-rejection-hardening). Human visual approval remains pending.

## Troubleshooting

- **Node/npm mismatch:** check `node --version`, `npm --version`, and your shell's selected runtime. Use the tested baseline or a supported Node 24 patch, then `npm ci`.
- **Missing browser/download failure:** run `npm run browser:ensure`, check disk space, internet/proxy access to `remotion.dev` and `remotion.media`, and retry. Downloads may be needed again after a clean dependency reinstall. Do not disable browser security to work around download errors.
- **Port 3000 busy:** stop the other server, or use `npm run studio --workspace=@code-to-video/studio -- --port=3001`. Use the actual URL printed by Studio.
- **Output already exists:** the render command intentionally does not overwrite. Archive/rename the previous file, or explicitly choose a new output path through the workspace's Remotion CLI.
- **Memory pressure:** concurrency is already 1; stop other renders and heavy applications. Run expensive frame checks separately from production renders.
- **Text differs on another machine:** the sample uses local `Helvetica Neue, Arial, sans-serif`; system fonts can change layout. Licensed bundled font handling and cross-platform baselines are future work.
- **npm lifecycle-script warning:** npm 11.18 reported an unapproved `esbuild` postinstall. The installed platform binary worked in the verified bundle/render; no blanket script approval was added. If your platform cannot bundle, inspect `npm install-scripts ls` and follow your npm version's targeted approval procedure for the locked esbuild package, then rerun checks. Never approve all dependency scripts blindly.
- **Workspace/import errors:** run `npm ci` at the root and keep the lockfile. Do not mix package managers or upgrade one Remotion package independently.

## Planned direction and documentation

Next: human review and explicit approval of candidate baselines, then a narrowly scoped Phase 3D delivery-QA policy (language/glyph coverage and a small aspect-ratio/text matrix). External media projects and AI workflows remain later work; no sibling video-projects folder or original documentary has been modified. Large production media stays outside engine Git.

Read the [blueprint](docs/CODE_TO_VIDEO_BLUEPRINT.md), [architecture](docs/ARCHITECTURE.md), [roadmap](docs/ROADMAP.md), and [agent instructions](AGENTS.md). Git currently resolves to an enclosing repository; no project-local Git initialization or remote was created. Decide ownership explicitly before committing.

No framework license has been selected; “open” describes the intended direction, not a license grant. Review applicable [Remotion terms](https://www.remotion.dev/docs/license), dependency terms, and eventual asset/font rights before distribution or commercial use.

Phase 3D.4B adds external PNG/sequence/opaque video compositing and depth, sweep and glow components, plus AdvancedEffectsShowcase (15 total compositions). See [cinematic APIs and limits](docs/CINEMATIC_EFFECTS.md). Technical validation is recorded separately; human visual approval remains pending. No real-time 3D engine, Phase 4 staging/storage or Phase 5 automation is included.

## Development Workflow

Maintainers who keep this repository beside the private `development-control` directory use that directory for AI-assisted development. This framework stays usable without it. External contributors and framework users do not need that directory.

A maintainer session opened inside this repository can start with:

```text
Read ../development-control/RESUME.md, follow its instructions, inspect the current project state, and continue the next authorized development task. Update progress documentation when finished.
```

If that sibling file is absent, use this README, [AGENTS.md](AGENTS.md), the [blueprint](docs/CODE_TO_VIDEO_BLUEPRINT.md), the [architecture](docs/ARCHITECTURE.md), and the [roadmap](docs/ROADMAP.md). Follow [AGENTS.md](AGENTS.md) for approvals. Do not approve visual baselines automatically.
