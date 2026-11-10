# Rendering Reliability and Visual QA — Phase 3C

Phase 3D.1 adds a separate `npm run qa:surfaces -- UNIQUE` suite using this unchanged capture/report/approval infrastructure. It does not add cases to the original matrix or approve/replace references. The composition total is now eleven, with ten editable literal defaults. Material metrics, performance and candidate evidence: [ADVANCED_SURFACES.md](ADVANCED_SURFACES.md). Historical Phase 3C counts below describe that milestone.

## Status and boundaries

Phase 3C implements local-font verification, opt-in browser layout diagnostics, versioned visual cases, exact/perceptual PNG comparison, explicit baseline approval, cross-theme checks, reproducibility checks, and MP4 smoke verification. **Technical checks are separate from visual approval. No real visual baseline has been approved by the coding agent.** Missing baselines intentionally fail comparison and the complete release gate.

The original nine compositions remain intact. One literal `ReliabilityFixture` registration is added, parameterized by theme and fixture kind instead of duplicating scenes. There are now ten compositions, nine with editable literal defaultProps. No independent project store, cloud service, AI automation, scene-template engine, or new workspace is introduced.

### Modules

| Location | Responsibility |
| --- | --- |
| `packages/ui/src/fonts.ts` | Backward-compatible public font facade |
| `font-loading.ts`, `font-manifest.ts`, `font-loader.ts` | Legacy load API, versioned definitions/requirements, explicitly owned deduplicating loader |
| `LocalFontGate.tsx` | Remotion readiness handling and `useLocalFontsReady` context |
| `packages/ui/src/diagnostics/` | Browser-safe geometry, measurement, findings and optional artifact probe |
| `apps/studio/src/qa/` | One authored fixture and explicit local-font manifest |
| `apps/studio/public/fonts/atkinson/` | Two unmodified OFL faces, full license and pinned/hash-verified provenance |
| `scripts/qa/` | Node-only assets, capture, comparison, approval, reports and command orchestration |
| `tests/reliability/` | Fast Node-only QA tests; browser not required |
| `tests/visual/cases.ts` | Versioned shared brand/style/frame matrix |

Filesystem, process, PNG comparison and renderer dependencies never enter browser UI exports. No theme or motion engine is rewritten. Existing APIs are retained; diagnostics/margins, font requirements, loader ownership and asset resolution are opt-in extensions. Remotion/React/TypeScript remain pinned to 4.0.541/19.3.1/5.9.3.

## Setup and commands

### Choose the smallest sufficient validation level

| Level | When | Commands / scope |
| --- | --- | --- |
| **1 — Fast development (default)** | Ordinary implementation changes | `npm run check`: strict TypeScript, existing fast tests and Studio extraction/save checks. No browser renders. Documentation-only edits additionally need local-link/status checks, not a full render pipeline. |
| **2 — Visual component validation** | Changed visuals, composition registration, fonts, layout or motion | `npm run compositions`, Studio preview and only renderer tests affected by the change. Discovery bundles/starts browser tooling but does not capture all baseline cases. A new component does not automatically require the complete 14-case baseline suite. |
| **3 — Full release validation** | Major changes, milestone completion, release preparation | `npm run qa:all -- --run release-UNIQUE`: all existing font, layout, theme, MP4/determinism, category-bound negative and approved-reference checks. Separately run material QA if affected; `qa:all` does not silently include `qa:surfaces`. |

**Do not automatically run `qa:all` after every implementation.** Run `check` after ordinary code changes; run targeted renderer tests when changing visuals. Do not rerun passing expensive checks unless affected source/assets/props, dependencies, settings or the environment changed, or the milestone/release explicitly needs fresh evidence. Record which revision/environment a reused result covers; reuse is a developer decision, not a new cache or a bypass inside the commands. All existing suites, assertions, thresholds and nonzero exits remain intact.

For Level 2, choose the relevant scope, not every row:

| Changed area | Applicable existing command |
| --- | --- |
| Intro timing/visuals | `npm run test:frames` |
| Theme visuals | `npm run test:themes` |
| Foundation components | `npm run test:components` |
| Font readiness/assets | `npm run qa:fonts` |
| Text/safe-area diagnostics | `npm run qa:layout` |
| Cross-theme reliability fixture | `npm run qa:themes -- --run theme-UNIQUE` |
| Existing video smoke/negative gates | `npm run qa:render -- --run smoke-UNIQUE` |
| Advanced glass/materials/label contrast | `npm run qa:surfaces -- surfaces-UNIQUE` (expensive: includes matrix, benchmark and MP4; not an every-edit default) |

For a small scene edit, preview and render a deliberate frame first rather than invoking a complete material suite:

```sh
npm run studio
# Select GlassmorphismShowcase (or the affected composition), play and scrub.
# Ctrl+C stops Studio. Use the trusted-network precautions in README.
npm exec --workspace=@code-to-video/studio -- remotion still src/index.ts GlassmorphismShowcase ../../renders/glass-dev-UNIQUE.png --frame=180 --image-format=png --overwrite=false
```

A preview/single still is not evidence for PNG determinism, contrast or MP4 decode. Run the relevant stronger suite when those properties are affected. Use unique output names and run expensive browser suites sequentially.

**Candidate reuse:** do not repeatedly regenerate unchanged baseline candidates merely to rediscover missing approval. The original 14 verified candidates already live in `tests/visual/current/phase3d1-final-all-visual/`, with review copies/contact sheets under `renders/review-packages/phase3d1-human-review/`. Compare that named run without rendering again; recapture only when inputs/output/environment need revision or a full milestone gate is deliberately requested. Hash verification alone is not human review. The [exact 14 approval commands](BASELINE_APPROVAL.md) require an actual reviewer and truthful case-specific reason and must never be run automatically.

### Interpreting terminal output

- **Technical tests passed:** the technical stages completed; this does not imply baseline approval or a fully passing release gate.
- **`PASS — expected rejection`:** a negative fixture matched its explicit category and causal/diagnostic evidence. Its preceding raw failed capture is intentional evidence, not a successful render. A failed status alone never qualifies.
- **Known cleanup warning:** Remotion may print `Target.closeTarget` during intentional negative selection cleanup. The warning is not filtered or universally ignored; the verified primary outcome determines the result. The same warning alongside an unrelated/unexpected renderer failure does not excuse that failure.
- **`BASELINE APPROVAL PENDING … MISSING_BASELINE`:** candidates have no approved reference. Comparison/full-gate exits remain nonzero. Review existing candidates; rerendering does not grant approval.
- **Genuine failure:** unexpected render/font/layout errors, GPU/browser failures, environment drift, invalid approval metadata or pixel differences retain their errors/reports and nonzero exits. Do not label every visual comparison failure as missing approval.

Use the documented Node 24/npm 11 workspace setup:

```sh
npm ci
npm run browser:ensure
npm run check
```

Browser acquisition is a **setup** operation. The QA runner searches the framework's existing Remotion browser caches, or uses an explicit `REMOTION_BROWSER_EXECUTABLE`. It does not download a browser during a QA render. Font/image content is local; provenance URLs are documentation, not runtime fetches. Independent MP4 QA requires `ffprobe` and `ffmpeg` on PATH; the normal renderer itself does not require a global FFmpeg install.

| Command | Scope | Success meaning |
| --- | --- | --- |
| `npm run check` | Strict TypeScript, all fast tests, Studio extraction/save regression | Code/API checks passed, not visual approval |
| `npm run qa:fonts` | Asset hashes, actual local-font render, missing-face failure | Exact required local faces work; expected failure was detected |
| `npm run qa:layout` | Passing and intentionally failing browser fixtures | The detector distinguishes expected good/bad layouts |
| `npm run qa:visual:capture -- --run review-a` | Capture current PNG candidates | Captured, **unapproved**, not a visual-regression pass |
| `npm run qa:visual:compare -- --run review-a` | Compare candidates against approved references | Zero unexpected differences in the same environment, approved metadata valid |
| `npm run qa:visual:approve -- ...` | Explicit single-case human approval | Writes only the named reviewed baseline |
| `npm run qa:themes -- --run matrix-a` | Four themes, animation states and edge copy, independent repeats | Local fonts/layout/determinism and distinct theme output passed |
| `npm run qa:render -- --run smoke-a` | Existing PNG repeats, new intro MP4/decode and negative quality gates | Existing work still renders; genuine failures are rejected |
| `npm run qa:all -- --run release-a` | Technical suites, capture and approved-baseline comparison | Full quality gate passed; **fails until baselines are approved** |

Run slow suites sequentially. CLI bundles can contend for the shared webpack cache. Run labels must be unique simple alphanumeric/hyphen identifiers. The runner refuses to overwrite an existing capture run. Omitting a run for capture/suites generates a unique timestamp label; compare/approve require an explicit existing capture run. Node orchestration timestamps never affect frame animation.

## 3C.1 — Local fonts

### Manifest and licensing

`validateFontManifest(unknown)` accepts version 1 manifests with `faces`. Each face adds a stable unique `id` to the existing `LocalFontDefinition`: family, local public asset path (`src`), integer weight, normal/italic style, and existing explicit redistribution attestation. Optional `licenseId`, `licenseDocumentation`, and `attribution` record provenance. Duplicate IDs or family/weight/style definitions fail. Missing requirements fail before capture. Remote URLs and traversal are rejected.

The small QA fixture uses unmodified Atkinson Hyperlegible regular (54,348 bytes) and bold (55,256 bytes). The upstream **SIL Open Font License 1.1**, copyright and redistribution conditions were read before downloading. The complete original `OFL.txt` is included. `PROVENANCE.json` pins Google Fonts commit `95f4904fc8bcf26d3420fe315560c96417c6dec7`, source URLs, sizes, and SHA-256 hashes. Downloads were verified against upstream Git blob hashes. Font files are not sold separately, renamed derivatives, or proprietary assets. Do not copy these licensing assertions to unrelated fonts.

`qa:fonts` verifies committed font/license hashes, contained asset paths, supported file headers, real browser FontFace loading at both weights, and a missing-file render failure. License metadata remains an attestation; automation does not give legal advice or verify arbitrary third-party rights.

### Readiness and lifecycle

`createLocalFontLoader({environment?, timeoutMs?, resolveAsset?})` owns a per-instance promise map. Concurrent/completed requests for the same face/source are reused. Conflicting sources for one face are rejected. Rejected/timed-out promises are evicted for retry. Late completion after timeout does not register a face; `clear()` resets that loader lifecycle. There is no application-wide singleton or hidden shared mutable registry.

Production browser readiness checks both an **explicit loaded FontFace** with the expected family/weight/style and `document.fonts.check` for that exact descriptor. `document.fonts.ready` alone is never treated as evidence. This verifies face availability, not coverage/shaping of every glyph. Successful registered faces remain in that document for its lifetime; `clear()` does not unload document fonts. Keep one loader/gate per composition rather than mounting one per text element.

`LocalFontGate` retains its old props and adds optional `requiredFaces`, `loader`, and `resolveAsset`. It uses bounded Remotion delay handling, cancels renders on failure, and releases owned handles on cleanup. `useLocalFontsReady()` lets a nested `LayoutProbe` wait for readiness with its own bounded handle.

Remotion assets need `staticFile` mapping; a root public path is not automatically the renderer's served URL:

```tsx
import {staticFile} from 'remotion';
import {LocalFontGate} from '@code-to-video/ui';

// Keep the resolver and manifest/requirement arrays stable outside frame code.
const resolveAsset = (src: string) => staticFile(src.slice(1));
// <LocalFontGate fonts={manifest.faces} requiredFaces={required}
//   resolveAsset={resolveAsset}><YourScene /></LocalFontGate>
```

The browser resolver rejects a result that leaves the local origin. Legacy `loadLocalFonts` remains available and retains its non-cached batch behavior; it does not silently acquire the new lifecycle or rewrite existing asset paths.

### Existing theme compatibility

Aurora, Ember and the original intro still reference their original system font stacks. Their names are **not rewritten**. QA's new fixture explicitly opts into the licensed local family through supported scene typography overrides. Existing-composition smoke records use `fontPolicy: 'system-compatible'` and report a portability warning rather than falsely asserting exact local font identity or glyph coverage. Use approved font mappings explicitly in future projects.

## 3C.2 — Layout diagnostics

### Opt-in instrumentation

`VideoText` accepts `diagnostics`; `AnimatedTitle` inherits it. `VideoSafeArea` accepts a stable diagnostic ID and optional debug outline. Without these props, no new data attributes, measurement side effects or visible overlays are added to existing scenes.

```tsx
<VideoSafeArea frameSize={{width, height}}
  margins={{unit: 'ratio', top: 0.08, right: 0.08, bottom: 0.08, left: 0.08}}
  diagnostics={{id: 'project-safe'}}>
  <AnimatedTitle frame={frame} fps={fps}
    diagnostics={{id: 'title', maxLines: 1, safeAreaId: 'project-safe',
      expectedFont: {family: 'Atkinson Hyperlegible', weight: 700, style: 'normal'}}}>
    A clear story
  </AnimatedTitle>
</VideoSafeArea>
```

Mount `LayoutProbe` from `@code-to-video/ui/diagnostics/react` explicitly in QA/development scenes with composition ID, selected frame and readiness state. Use its optional `revision` key when changing diagnostic inputs at the same frame. Each measurement cycle owns a separate delay handle/token so an earlier result cannot release a newer cycle. It measures the current document's tagged targets and emits `layout.json` through Remotion's supported artifact mechanism. For direct tooling, `collectLayoutDiagnostics` and pure `evaluateText`/geometry helpers are available from `/diagnostics`. Neither imports Node filesystem/renderer code.

### Findings and policies

Every finding includes a stable code, severity, composition, frame, element ID, readable explanation, corrective action, measured bounds and expected bounds when relevant:

- `TEXT_OVERFLOW`: scroll/client dimensions show content exceeding its box.
- `TEXT_CLIPPED`: overflowing content is hidden/clipped or a layout rectangle exceeds a clipping ancestor.
- `TEXT_UNEXPECTED_WRAP`: Range-derived line-box count violates configured expected/max lines.
- `TEXT_OUTSIDE_SAFE_AREA`: the measured layout rectangle exceeds its selected safe region.
- `FONT_NOT_READY`: the exact required registered local face is unavailable.
- `FONT_FALLBACK_DETECTED`: first declared CSS family differs from the expected face; this is a fallback-risk finding, not proof of per-glyph substitution.

Text policy supports explicit code exemptions with a nonempty reason. Exempt findings stay in JSON as `info` with `exemptionReason`—they are not silently discarded. Missing/duplicate target IDs and missing selected safe areas are errors. The QA runner fails on error-severity findings; warnings remain visible. It does not shrink text or alter layout to hide failures.

### Safe areas and animation

The original `inset` API/default theme page spacing remains unchanged. New `margins` accepts pixel or frame-relative ratio edges with explicit `frameSize`; `safeAreaGeometry` validates dimensions and rejects an empty content region. The browser measures the safe area's actual content box, accounting for padding/borders and axis-aligned scale. Debug outlines are opt-in, never enabled in reference captures. These are author-controlled safe regions, not a broadcast/platform certification.

Select diagnostic frames explicitly. Entrances may legitimately exceed bounds; do not infer a universal safe time from animation duration. The fixture includes an explicit entrance exemption case. Reference cases sample frames 15, 90 and 260 for entry/settled/fade-out. Other scenes should choose their own meaningful frames and policies.

### Measurement limits

Bounding boxes and Range rectangles approximate **layout/line boxes**, not visible glyph ink. Exact ascender/descender clipping, complex masks, arbitrary rotation/3D transforms, decorative shadows, intentional cropping, mixed-size inline runs and complex-script shaping need human inspection. `FONT_FALLBACK_DETECTED` does not establish glyph coverage. Non-ASCII Latin fixtures are tested for containment using a loaded local face; Khmer coverage/shaping is not claimed. No fitting estimate or blind shrink-to-fit mechanism is used.

`qa:layout` demonstrates real passing and intentionally failing titles/paragraphs, tiny containers, wrapping, safe-area violation, exemptions, font-not-ready/fallback risk, optional text, non-ASCII Latin, and 1080p/720p geometry. A successful detector suite means its bad fixtures were **caught**, not that those bad layouts are suitable for delivery. The ordinary capture quality gate rejects critical bad layouts.

## 3C.3 — PNG visual regression

### Cases and artifacts

Each `VisualCase` declares schema version, stable case/composition ID, frame, resolution, FPS, brand/style, font policy and serializable input props. Unknown keys, invalid timing/size, inconsistent identifiers, duplicate case IDs and non-JSON values fail validation. IDs plus canonical case hashes create stable filenames independent of object property order. A caller may supply a JSON case array with `--cases path/to/cases.json`.

```text
tests/visual/
  cases.ts                     tracked deterministic cases
  baselines/                   only explicitly approved small PNG/JSON references
  current/<run>/                generated PNGs, repeated PNGs, layout artifacts, bundle
  diffs/<run>-<attempt>/        generated pixel difference images
  reports/                     generated capture/comparison/operation JSON
```

Current/diff/report directories are ignored. Baselines are not blanket-ignored; **there are currently no approved baseline images**. Approval enforces 2 MiB/image and a 20 MiB reference-image budget. Existing MP4 output files are never overwritten; smoke videos use their own run directory.

### Comparison and environment

Default exact mode checks every RGBA channel with **zero differing pixels permitted**, including anti-aliasing changes. Perceptual mode uses pixelmatch 8.0.0 with anti-alias differences included, an explicit pixel threshold and maximum difference percentage. PNG encoding/decoding uses pngjs 7.0.0. No cropping, resizing, blur, color normalization, ignored regions or automatic baseline updates hide differences.

Comparison reports contain differing pixel count/percentage, image validity/dimension/missing-baseline status and a difference PNG when dimensions permit. Exact mode is strict by default; tolerances must be explicit and are recorded in the report. A permissive threshold is not a substitute for a correct render.

Fingerprints record OS/release, CPU architecture, Node/Remotion versions, actual browser product/revision/user agent, viewport, device scale, FPS, PNG scale and GL backend. Case definitions record composition/frame/brand/style/version/props; reports include a source-and-local-asset hash. Renderer metadata is requested from the installed browser, not guessed from a filename. Some vendor browser builds report a zero revision; their product version is still recorded.

Environment drift is reported separately from pixel metrics and fails the default quality gate even when pixels match. Source changes do not automatically excuse pixel changes. Pin Node, lockfile, OS/architecture, browser binary, fonts and render options on a controlled worker. The tested environment is macOS/Darwin 25.6.0 arm64, Node v24.7.0, Remotion 4.0.541, HeadlessChrome 158.0.8127.2, device scale 1 and `swangle`. Cross-OS equality is not promised.

### Explicit human approval

1. Capture with a new run label.
2. Inspect candidate images, layout/font reports and the environment. Review multiple animation states and all selected theme combinations.
3. Compare: missing baselines must say unapproved and return nonzero.
4. A human approves one named case at a time, supplying identity and reason:

```sh
npm run qa:visual:approve -- --run review-a \
  --case aurora-finance-cinematic-f90 \
  --reviewer "Reviewer name" --reason "Reviewed typography, layout and settled frame"
```

5. Commit only the reviewed limited-size baseline PNG and its approval/environment/hash JSON. Recompare the capture.

Replacement requires explicit `--replace` plus reviewer/reason; it is never part of capture/testing. Candidate hashes/dimensions, case identity, layout error status and paths are checked before approval. Image changes after capture require recapture. Approval metadata itself is not a cryptographic authorization system: protect baseline changes through human Git review/branch policy. Synthetic approval unit tests run only in ignored `.cache/qa-unit`, not the real baseline directory.

Until this human checkpoint occurs, `qa:visual:compare` and `qa:all` correctly remain non-green. Do not reinterpret candidate capture or exact repeat-render success as baseline approval.

## 3C.4 — Cross-theme validation

The shared case matrix covers Aurora/Ember × cinematic/minimal, three animation states and optional/non-ASCII copy. `qa:themes` evaluates 20 cases and repeats each independently: 40 PNGs with exact decoded-pixel comparisons and recorded hashes. It checks required local fonts, measured text/safe-area layout and distinct settled theme output. The same fixture uses the existing resolver and reusable components; no four scene copies or many new registrations are needed.

The old intro/component cases are also retained as system-compatible smoke cases. Their portability warnings remain explicit. Long English titles, multiline subtitle overflow, tiny containers and intentional safe-area failures are negative fixtures, not hidden baseline changes.

## 3C.5 — Reports, failure handling and CI

Capture/comparison JSON contains schema version, timestamp, run/overall status, case ID, composition/frame, brand/style/props, environment, source hash, font/layout findings, comparison options/metrics, errors and relative artifact paths. Suite/operation reports add execution status. Missing fonts, invalid assets/cases/props, missing compositions/output, critical layouts, renderer errors, unapproved references, differences and environment drift produce failures; CLI quality gates return nonzero.

`qa:render` verifies independent intro/component PNGs, then renders a fresh 1920×1080/30 FPS/5-second H.264 intro using concurrency 1 and no parallel encoding. ffprobe checks codec/dimensions/FPS/frame count/duration; ffmpeg decodes the entire file. MP4 byte equality is not used as the determinism criterion. Negative quality gates verify missing composition, invalid props and critical layout rejection with retained failed-case reports.

### 3C.6 — Expected-rejection hardening

The final audit found that `failure-check.ts` accepted any failed capture status. A source-preserving in-memory `GPU_LOST` substitution reproduced this defect before the fix. The hardened harness now uses the same `assertExpectedFailure` implementation in the CLI, fast tests and injected-boundary tests. A failure status alone is never success.

Each negative definition binds an exact case/props/frame identity to an explicit expectation:

- **Missing composition:** the original pinned renderer error must identify `NotRegistered`, include the structured-format available-composition list and a known registered reliability composition, and not list the missing ID as available. No unknown error code or nonstandard exception class is accepted.
- **Invalid props:** the original error must be the specific `Unknown reliability fixture.` validator failure, not a generic validation error, browser error or substring match.
- **Critical layout:** the original QA-owned error must carry `CRITICAL_LAYOUT`. Its code metadata must agree with actual error-severity findings. Both `TEXT_OVERFLOW` and `TEXT_CLIPPED` must target `qa-title` at the expected composition/frame. Additional findings are limited to the fixture's explicit text elements and overflow/clipping/wrapping categories. Font failures, other scopes, warnings, exemptions and missing evidence do not qualify.

The first two errors currently expose text, not stable upstream codes. Their narrowly anchored adapters are deliberately pinned to the current error protocol; they tolerate repeated standard `Error:` formatting, not arbitrary surrounding text. A changed upstream format fails closed and needs review. This is error-category validation in trusted QA code, not a security/authenticity guarantee for arbitrary forged reports.

Capture report schema version 1 retains `CAPTURE_FAILED`/`QA_CAPTURE_FAILED` and existing message fields. Optional `cause` evidence now preserves original names, string/numeric codes, stacks, nested causes, aggregate members and relevant diagnostic/context metadata; source-root paths are redacted as before. No renderer or visual-comparison behavior is rewritten. Old reports remain readable, but a status-only archived failed report is insufficient proof for a new expected-rejection check: rerun it.

**Wrapped-error rules:** recognized QA transport wrappers may preserve the original normalized message or use the exact context labels `Capture failed.` / `QA capture failed.`. Uncoded standard Error wrappers must preserve the same normalized original message. Opaque/contradictory wrappers, unknown codes, mixed aggregate errors, primitive thrown text, cycles and truncated cause chains are rejected. The original causal error remains attached to mismatch exceptions; it is not replaced by a fabricated expected error.

If a capture succeeds, `ExpectedFailureMismatch` carries `MISSING_EXPECTED_REJECTION`; an unrelated/mismatched/insufficient rejection carries `UNEXPECTED_REJECTION`. Both propagate to the actual CLI and exit nonzero. A capture that throws before producing case evidence is also unexpected, never an expected rejection. Successful checks print `PASS — expected rejection` only after all evidence has been checked. Raw failed-case reports and meaningful browser/font warnings remain visible.

Regression coverage includes the actual CLI orchestration with browser/render boundaries injected only in memory, plus real renderer runs of all three negative fixtures. There is no production fault-injection flag, source rewrite or global console filter. Synthetic CLI reports stay under `.cache/qa-unit`; no approved baseline images are touched.

The additional audit risks were reviewed but not expanded into this fix: baseline PNG/metadata writes remain sequential rather than transactional; computed font weight/style is recorded but not fully asserted against text policy; original system fonts remain cross-machine dependent; and project Git ownership still resolves to an enclosing home-directory repository. They remain explicit follow-up/governance items, not changes to the renderer, fonts, diagnostics or repository ownership. Human visual approval is still required after technical revalidation.

Suggested **release/milestone CI** sequence on a controlled worker (not an every-edit requirement):

```sh
npm ci
npm run check
npm run compositions
npm run qa:all -- --run ci-UNIQUE-BUILD-ID
```

Acquire/cache the known browser during worker provisioning, not from an external content service during rendering. Preserve `tests/visual/reports`, current images and diffs on failure. Do not run approval in CI or automatically accept changed images. No hosted CI provider or cloud account is required by this implementation.

## Troubleshooting and known limits

- **No cached browser:** run `npm run browser:ensure` during setup or explicitly configure a verified local binary. QA intentionally does not auto-download.
- **Font 404:** public asset paths need Remotion `staticFile` resolution. Check the manifest, actual staged files, license/hash records and `resolveAsset`; do not replace the family silently.
- **Missing face/weight/style:** include and require the exact face; a system fallback or a fulfilled `document.fonts.ready` is not enough.
- **Port/path issues:** rely on bundled local serving; the existing Studio port override remains supported. Never hardcode a developer's absolute filesystem path.
- **Missing baseline:** expected until human review. Capture first; approve explicitly; do not increase tolerances to avoid approval.
- **Environment drift:** use the same controlled worker/browser/fonts or review an intentional new environment. Do not label drift as a proven content regression.
- **Expected failure fixtures:** font 404/error logs are intentional evidence. They are asserted, not suppressed.
- **Upstream negative-path cleanup warning:** Remotion 4.0.541 can log `Target.closeTarget: No target found for targetId` while cleaning up a failed composition/metadata selection. The runner preserves the primary failure and reports it; successful captures/MP4 decode still pass. No dependency patch, log filtering or broad upgrade was used to hide this warning.
- **Python TLS setup:** the initial fixture-download attempt encountered the host Python certificate-store error. Acquisition succeeded with Node's verified TLS and upstream blob hashes; certificate verification was not disabled. Font acquisition is not part of runtime QA.
- **Font availability versus typography correctness:** local face loading is verified; per-glyph shaping, full language coverage and exact visible glyph clipping still need dedicated fixtures and human inspection. No Khmer support claim is made.
- **Not a security sandbox:** project React code is trusted executable code. Bounds/path/JSON validation is not a sandbox for unknown plugins or arbitrary code.

Reviewed baselines and delivery-oriented QA policy (language/glyph coverage, text constraints and a modest aspect-ratio matrix) remain pending. Explicit subsequent authorization added independent Phase 3D.1 surfaces, not production orchestration or Phase 4 storage features.
