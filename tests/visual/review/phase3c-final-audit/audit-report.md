# Phase 3C Final Audit — 2026-11-10

## Verdict: FIXES REQUIRED BEFORE APPROVAL

The current images and normal rendering checks show no observed persistent rendering regression. The release-gate negative-test oracle is insufficient: it accepts unrelated per-case failures as expected rejections. Fix and retest that issue before approving references or beginning Phase 3D. No source code, approved baseline, reference image or existing render was modified by this audit. Only permitted QA outputs/caches and this review package were created.

## A. Repository health

- Project directory: `/Users/HaruMalik/Desktop/video-production-workspace/code-to-video`. Git root: `/Users/HaruMalik`.
- Scoped working tree before/after: `?? ./`. The project is untracked under the enclosing repository, not a clean independently versioned project. No Git reset/add/commit/remote operation was performed.
- npm workspaces: `apps/studio`, `packages/themes`, `packages/ui`. Core/schema/workflow placeholders are still planned; no architectural rewrite was made.
- Installed Node `v24.7.0`, npm `11.18.0`; Remotion/CLI/renderer/bundler `4.0.541`, React/React DOM `19.3.1`, TypeScript `5.9.3`, pngjs `7.0.0`, pixelmatch `8.0.0`.
- `npm run check`: strict TypeScript across all three workspaces plus QA tools; 95 tests passed (24 Studio + 32 themes + 30 UI + 9 reliability); none removed/skipped. Studio source extraction/in-memory default saving passed for nine editable literal registrations. The original intro has no editable theme defaults.
- All 10 compositions were discovered: `CodeToVideoIntro`, `ThemeShowcase`, `ThemeAuroraCinematic`, `ThemeAuroraMinimal`, `ThemeEmberCinematic`, `ThemeEmberMinimal`, `ComponentShowcase`, `ComponentAuroraCinematic`, `ComponentEmberMinimal`, `ReliabilityFixture`. All are 1920×1080, 30 FPS; lengths remain 150/180/270 frames as applicable.
- UI/theme compatibility passed existing tests; Node QA imports remain outside browser UI code. Existing nine scene registrations and public APIs are retained.
- 113 protected source/configuration/document/reference files match their pre-audit SHA-256 values. All five existing MP4s match the historical preservation inventory; audit smoke outputs use separate QA directories.
- Discrepancy from prior completion claims: the scripts do not prove that every negative test failed for the *correct* reason (F1), despite printing expected-rejection PASS messages. No version, composition-count or test-count discrepancy was found.

## B. Visual candidate inventory

**Selected fresh audit capture run:** `phase3c-audit-20261110-all-visual`. Capture report: `tests/visual/reports/phase3c-audit-20261110-all-visual-capture.json`. This is the 14-case reference candidate set, not the separate 20-case/40-PNG deterministic theme matrix.
At audit start, the latest pre-existing 14-case run was `all-1794236885161-visual`, not the older `phase3c-final-v2-visual` mentioned in the implementation report. The fresh audit set below is used consistently. All 14 PNG hashes match that latest-at-start set as additional reproduction evidence, not approved-baseline evidence.

Every listed file exists, decodes as a 1920×1080 PNG, and matches the hash in its capture report. All 14 approved PNG baselines and their approval metadata are absent. Full absolute source paths, copied review paths, case keys, dimensions, environment and policies are also in `manifest.json`.

| # | Case ID | Composition | Brand / style | Frame | Dimensions | Bytes | Approved PNG / metadata |
|---|---|---|---|---:|---|---:|---|
| 1 | `aurora-finance-cinematic-f15` | `ReliabilityFixture` | aurora-finance / cinematic | 15 | 1920×1080 | 1,337,826 | absent / absent |
| 2 | `aurora-finance-cinematic-f90` | `ReliabilityFixture` | aurora-finance / cinematic | 90 | 1920×1080 | 1,329,263 | absent / absent |
| 3 | `aurora-finance-cinematic-f260` | `ReliabilityFixture` | aurora-finance / cinematic | 260 | 1920×1080 | 1,442,266 | absent / absent |
| 4 | `aurora-finance-minimal-f15` | `ReliabilityFixture` | aurora-finance / minimal | 15 | 1920×1080 | 110,730 | absent / absent |
| 5 | `aurora-finance-minimal-f90` | `ReliabilityFixture` | aurora-finance / minimal | 90 | 1920×1080 | 110,967 | absent / absent |
| 6 | `aurora-finance-minimal-f260` | `ReliabilityFixture` | aurora-finance / minimal | 260 | 1920×1080 | 111,524 | absent / absent |
| 7 | `ember-studio-cinematic-f15` | `ReliabilityFixture` | ember-studio / cinematic | 15 | 1920×1080 | 1,295,681 | absent / absent |
| 8 | `ember-studio-cinematic-f90` | `ReliabilityFixture` | ember-studio / cinematic | 90 | 1920×1080 | 1,288,257 | absent / absent |
| 9 | `ember-studio-cinematic-f260` | `ReliabilityFixture` | ember-studio / cinematic | 260 | 1920×1080 | 1,408,198 | absent / absent |
| 10 | `ember-studio-minimal-f15` | `ReliabilityFixture` | ember-studio / minimal | 15 | 1920×1080 | 109,906 | absent / absent |
| 11 | `ember-studio-minimal-f90` | `ReliabilityFixture` | ember-studio / minimal | 90 | 1920×1080 | 110,225 | absent / absent |
| 12 | `ember-studio-minimal-f260` | `ReliabilityFixture` | ember-studio / minimal | 260 | 1920×1080 | 109,061 | absent / absent |
| 13 | `intro-settled` | `CodeToVideoIntro` | N/A (intro-local) / N/A (intro-local) | 90 | 1920×1080 | 1,043,839 | absent / absent |
| 14 | `component-settled` | `ComponentShowcase` | aurora-finance / cinematic | 180 | 1920×1080 | 1,248,989 | absent / absent |

### Exact source PNG paths and checksums

**01 — aurora-finance-cinematic-f15**
- PNG: `tests/visual/current/phase3c-audit-20261110-all-visual/aurora-finance-cinematic-f15-655881f294b5.png`
- SHA-256: `2fd80a50d26ed9847f45a22e07bc6e0f5da6bc89ef80ddc2f8827e6986168858`

**02 — aurora-finance-cinematic-f90**
- PNG: `tests/visual/current/phase3c-audit-20261110-all-visual/aurora-finance-cinematic-f90-9ecec3f42f85.png`
- SHA-256: `51a7e7bd9c30cf72dbf63625cbc958abf982dfce8fd14af41eee885b558bc5bd`

**03 — aurora-finance-cinematic-f260**
- PNG: `tests/visual/current/phase3c-audit-20261110-all-visual/aurora-finance-cinematic-f260-97c14d4a2133.png`
- SHA-256: `cf3b956364abbad5396b4a41820e77752ef0b8ac56396a5df55bba71b39d6279`

**04 — aurora-finance-minimal-f15**
- PNG: `tests/visual/current/phase3c-audit-20261110-all-visual/aurora-finance-minimal-f15-bf9c1f2ce701.png`
- SHA-256: `a6e3ea87f99e3f1d464e2749ed7b17d35bda555498e267d3b007c5c230edbb3c`

**05 — aurora-finance-minimal-f90**
- PNG: `tests/visual/current/phase3c-audit-20261110-all-visual/aurora-finance-minimal-f90-0eaf14010580.png`
- SHA-256: `e21a19307b6d1d92ad75d243a6bce106498b8e666af4e11b17e561546192c68f`

**06 — aurora-finance-minimal-f260**
- PNG: `tests/visual/current/phase3c-audit-20261110-all-visual/aurora-finance-minimal-f260-35de5faf66d1.png`
- SHA-256: `91dc86a525caa9834c33d6cb7adafd63ac7b737a3e27ee99ebf2ae383b8585a4`

**07 — ember-studio-cinematic-f15**
- PNG: `tests/visual/current/phase3c-audit-20261110-all-visual/ember-studio-cinematic-f15-8321c5aafe2b.png`
- SHA-256: `8e00238f09b5954665306aa88584895ad9d5edc1172850fa3531b19eee94109a`

**08 — ember-studio-cinematic-f90**
- PNG: `tests/visual/current/phase3c-audit-20261110-all-visual/ember-studio-cinematic-f90-885b73996ee4.png`
- SHA-256: `6c5cdc6bc68d518ee3347595e2098519b9d96a84addae0329967daee1dd8f0ee`

**09 — ember-studio-cinematic-f260**
- PNG: `tests/visual/current/phase3c-audit-20261110-all-visual/ember-studio-cinematic-f260-96a1adc45e01.png`
- SHA-256: `13f15a9fc74280eb3cbd9e7f260028d5420a417988547087c12080a5c106da2a`

**10 — ember-studio-minimal-f15**
- PNG: `tests/visual/current/phase3c-audit-20261110-all-visual/ember-studio-minimal-f15-a7a5e3c5bb06.png`
- SHA-256: `7d82f7eb1b7887753e6d44566597f0e2d1094d965da21fd60ced3aedc05c38a9`

**11 — ember-studio-minimal-f90**
- PNG: `tests/visual/current/phase3c-audit-20261110-all-visual/ember-studio-minimal-f90-12873488c449.png`
- SHA-256: `a5576d540834c80916accb47154d71709e8bd169e239d855455d80514777c5a1`

**12 — ember-studio-minimal-f260**
- PNG: `tests/visual/current/phase3c-audit-20261110-all-visual/ember-studio-minimal-f260-c116502b5c9c.png`
- SHA-256: `8729dbf6ba2d17c6077eb5eaba296f8d18bb07e46c88addf90249c86711896c4`

**13 — intro-settled**
- PNG: `tests/visual/current/phase3c-audit-20261110-all-visual/intro-settled-893f3fb0b8da.png`
- SHA-256: `a8a30dd31ad53da51bb57e6aa68937971b1a2c856739af02d010ec760b1932e1`

**14 — component-settled**
- PNG: `tests/visual/current/phase3c-audit-20261110-all-visual/component-settled-9170e52ad8da.png`
- SHA-256: `cf996f9e4a9a6aeab592014cf053546392f93179fe68b8fc627a4dbe23f647e4`

## C. Actual visual inspection

All 14 full-size PNGs were opened in the image viewer individually, and the labeled contact sheet was inspected afterward. These are specific pixel-inspection findings, not deductions solely from passing tests. No image was marked approved. Sampled stills can establish plausible stages, not certify complete temporal animation quality.

### 01. aurora-finance-cinematic-f15
Navy gradient/grid and rounded filled cards match cinematic styling. Title is very faint and slightly lower during the elegant entrance; subtitle and card text are already legible. No visible persistent clipping, missing assets or unexpected wrap. Human should review whether this deliberately weak early title contrast suits the intended pacing.

### 02. aurora-finance-cinematic-f90
Settled white single-line title, intentional two-line subtitle and two aligned cards are readable within the safe area. No obvious glyph breakage, clipping or missing asset. Cyan accent and navy surface treatment match Aurora cinematic.

### 03. aurora-finance-cinematic-f260
Whole content stack is visibly faded while the grid/gradient remains. This matches the coded 60% outro opacity; no displaced or clipped text. Reduced caption contrast is intentional during exit, not a settled-state result.

### 04. aurora-finance-minimal-f15
Flat dark navy, near-square outlined cards and no grid/glow distinguish minimal. Title is partially faded and slightly lower; it is more visible than cinematic because energetic easing differs. Card edges and two-line subtitle are intact.

### 05. aurora-finance-minimal-f90
Settled title and intentional two-line subtitle fit. Two equal outlined panels align; cyan accents and white/muted blue text remain coherent. No obvious overflow, unexpected wrap, missing glyphs or assets.

### 06. aurora-finance-minimal-f260
Content fades uniformly over the flat navy canvas; title remains contained and the outlines/captions soften as expected. No unexpected blank or lost panel; this is an exit sample.

### 07. ember-studio-cinematic-f15
Warm peach/off-white gradient, grid, rounded cards and coral labels match Ember cinematic. Title is deliberately very faint at the early elegant entrance, while subtitle/cards are present. No visible clipping or tofu; early title readability remains a creative-review choice.

### 08. ember-studio-cinematic-f90
Dark settled heading and two-line subtitle are clear over the warm cinematic canvas. Rounded panel padding/edges align; text appears intact. Coral labels/borders are subtler than Aurora accents and should receive human contrast review, without a formal contrast-certification claim.

### 09. ember-studio-cinematic-f260
Expected fade-out over the warm gradient; text and panel fills become pale while geometry remains stable. No obvious crop or missing asset. Lower label contrast is exit-related.

### 10. ember-studio-minimal-f15
Flat warm off-white canvas, charcoal typography, coral labels and squared outlined cards are visibly distinct from cinematic. Partially faded title is readable and offset slightly downward during entrance. No unexpected wrapping or clipping.

### 11. ember-studio-minimal-f90
Settled charcoal title, deliberate two-line subtitle and clean two-card grid fit safely. Flat surfaces and thin borders match minimal. No obvious broken glyphs, missing assets or misalignment.

### 12. ember-studio-minimal-f260
A uniform exit fade lightens title, copy and outlines over the flat off-white background. No geometric jump or clipped content is apparent; small coral labels are faint as expected for this sampled exit.

### 13. intro-settled
Centered CODE TO VIDEO title/subtitle, mint accent line and dots are clean and balanced on the dark background. No obvious clipping, wrap, missing glyphs or assets. This uses the original intro art direction/system-font stack, not an Aurora/Ember selection.

### 14. component-settled
Title/subtitle, three aligned cards, four labeled motion examples and footer are all visible and contained. Aurora cinematic colors/rounded panels/grid are coherent. No obvious cropping or missing assets. This is one settled frame; motion smoothness cannot be concluded from it alone.

### Cross-theme and animation observations

- Aurora keeps navy/cyan; Ember keeps warm off-white/charcoal/coral. Cinematic has gradient/grid/glow/rounded filled panels; minimal has flat backgrounds and near-square outlined panels.
- The reliability fixture explicitly maps both brands to the same local Atkinson family and 400/700 weights. It is not a test of Ember's original Georgia heading stack. Those original theme tokens remain untouched.
- Source timing corroborates the images: at frame 15, the title has approximately 0.108 opacity with elegant easing or 0.657 with energetic easing; by frame 90 it is settled. At frame 260 the whole content stack has coded opacity 0.6. The differing entry visibility is therefore plausible, not a missing asset.
- The 12 reliability images have actual browser layout artifacts with no reported diagnostics. Measured title weight is 700 and subtitle weight 400 with `fontReady: true`. Card text has no explicit font requirement. The two existing-composition candidates are not instrumented for layout; their empty diagnostic arrays must not be mistaken for measured layout passes.
- The subtitle deliberately occupies two lines. Card descriptions use different semantic tones (foreground on the left custom slot, muted on the right description slot); this is a human consistency-review choice, not evidence of a font failure.
- No obvious persistent text overflow/clipping, missing ASCII glyphs, broken alignments, missing assets, incorrect palette or unexpected blank region was seen. Faint entry/exit text, subtle Ember labels and continuous-motion pacing still require creative review. No formal WCAG contrast or language-shaping certification is claimed.

## D. QA execution results

Exact commands, timestamps, logs and process exit codes are preserved in `execution-results.json` and `logs/`. The audit/run label follows the current 2026-11-10 review date; raw process timestamps are preserved exactly as recorded in UTC (2026-11-09T17:28 through 17:32), not rewritten. No install, baseline approval, or source modification was performed.

| Command | Exit | Observed result |
|---|---:|---|
| `npm run check` | 0 | Strict TypeScript + all 95 tests + nine editable-default extraction/save checks passed. |
| `npm run compositions` | 0 | All 10 expected compositions discovered; no defaultProps extraction warning. |
| `npm run qa:fonts` | 0 | Real local font success, exact 400/700 readiness, hash verification and expected missing-font rejection passed. |
| `npm run qa:layout` | 0 | Real browser passing/failing layouts, safe areas, exemptions and 1080p/720p fixtures passed. |
| `npm run qa:themes -- --run phase3c-audit-20261110-themes` | 0 | 20 cases × independent repeat = 40 PNGs; exact pixel equality, all four themes, optional/non-ASCII fixtures passed. |
| `npm run qa:render -- --run phase3c-audit-20261110-render` | 0 | Existing intro/component exact repeat PNGs; fresh 1080p/30 FPS/5-second H.264 MP4 metadata and full decode passed; three negative cases failed with expected messages in this run. |
| `npm run qa:all -- --run phase3c-audit-20261110-all` | 1 | Technical suites and 14 candidate captures completed; final comparison returned 14 MISSING_BASELINE results. Nonzero exit is the expected human-approval blocker, not an observed positive-render failure. |

The aggregate MP4 is `tests/visual/current/phase3c-audit-20261110-all-render-mp4/CodeToVideoIntro-smoke.mp4`: H.264, 1920×1080, 30/1 FPS, 150 frames, 5.000 seconds, 234,280 bytes; `evidence/mp4-verification.json` records full decode. PNG exact equality, not MP4 byte equality, is the determinism criterion.

## E. Mixed PASS/FAIL classification

| Message | Classification | Evidence and qualification |
|---|---|---|
| 404 `missing-required.ttf` | Expected negative-test behavior | `font-check.ts:30` requires rejection matching `Required font failed`; this run emitted the expected local 404 after a successful 400/700 render. Unexpected errors in the normal success path throw and fail the command. |
| `Target.closeTarget: No target found for targetId` | Nonfatal upstream cleanup warning in the observed negative paths | Seen twice in standalone render and twice in aggregate logs. Renderer 4.0.541 starts asynchronous page closure and logs a rejected cleanup without awaiting it. Primary selection errors and failed case reports remain available. No log filter or dependency patch was used. |
| Missing composition | Expected rejection in this run | Report explicitly names `NotRegistered` and lists available compositions. **The test oracle checks only failure status**, not that identity. |
| Invalid props | Expected rejection in this run | Report says `Unknown reliability fixture.` Status-only oracle has the same weakness. |
| Critical layout | Expected rejection in this run | Report says `Critical browser layout/font diagnostic.` and contains error-severity overflow/clipping findings. Status-only oracle does not require those specific findings. |
| 14 `MISSING_BASELINE` results | Human approval blocker | All references/metadata are absent, comparison metrics show missing-baseline rather than pixel difference. Capture is not approval. |
| F1 unrelated synthetic error accepted | Genuine implementation defect in QA assurance | A clearly labeled read-only in-memory fault-injection probe supplied `GPU_LOST` instead of each expected failure. The real `failureCheck` still returned success. This is not an actual GPU failure in the audit renders; it proves the oracle can mask an unrelated negative-path regression. |

Unexpected errors in ordinary capture cases set row/report failed and cause a nonzero CLI exit. The exception is the *negative-test harness*: any per-case failed result satisfies its current assertions. Therefore the previous assertion that negative tests prove correct error behavior is too strong.

## F. Baseline approval safety (inspected only)

- Explicit operation and required `--run`, `--case`, `--reviewer`, `--reason`; capture/testing never calls the real approval command.
- Cases are validated through `caseKey`/`validateCase`; failed captures/layout errors, missing environment/hash, changed image bytes, invalid PNG/dimensions and oversized images are rejected.
- Paths are contained and resolved; baseline directories/targets reject symlinks. Default writes use `wx`, and pre-existing references require explicit `--replace` plus review identity/reason.
- References are stored under `tests/visual/baselines/<case-key>.png` with matching JSON containing case/environment/source hash/image hash/approval metadata. Names are deterministic, capture run labels are unique, and repeated pixel output is verified; audit timestamps are intentionally not byte-deterministic metadata.
- Comparison detects changed PNGs, differing dimensions, invalid images and missing baselines separately, and records environment drift independently from pixel metrics.
- Qualification F2: PNG and metadata writes are sequential rather than transactional. Replacement can leave an inconsistent pair on an I/O failure; comparison should fail closed on hash mismatch. Baseline approval metadata is review evidence, not a cryptographic authorization system.
- No `qa:visual:approve` command was executed. Fast unit tests exercise synthetic approval only under ignored `.cache/qa-unit`, never the real baseline directory.

### Exact commands for the 14 candidates — NOT EXECUTED

**Do not execute until F1 has been repaired/revalidated and a human has inspected the selected candidates.** If repair changes visual source, capture a fresh set and substitute that run. Replace the reviewer placeholder with the actual approving human. These commands name every candidate explicitly and deliberately omit `--replace`.

```sh
npm run qa:visual:approve -- --run phase3c-audit-20261110-all-visual --case aurora-finance-cinematic-f15 --reviewer "<HUMAN_REVIEWER>" --reason "Human-reviewed aurora-finance-cinematic-f15: typography, layout, theme and sampled animation stage"
npm run qa:visual:approve -- --run phase3c-audit-20261110-all-visual --case aurora-finance-cinematic-f90 --reviewer "<HUMAN_REVIEWER>" --reason "Human-reviewed aurora-finance-cinematic-f90: typography, layout, theme and sampled animation stage"
npm run qa:visual:approve -- --run phase3c-audit-20261110-all-visual --case aurora-finance-cinematic-f260 --reviewer "<HUMAN_REVIEWER>" --reason "Human-reviewed aurora-finance-cinematic-f260: typography, layout, theme and sampled animation stage"
npm run qa:visual:approve -- --run phase3c-audit-20261110-all-visual --case aurora-finance-minimal-f15 --reviewer "<HUMAN_REVIEWER>" --reason "Human-reviewed aurora-finance-minimal-f15: typography, layout, theme and sampled animation stage"
npm run qa:visual:approve -- --run phase3c-audit-20261110-all-visual --case aurora-finance-minimal-f90 --reviewer "<HUMAN_REVIEWER>" --reason "Human-reviewed aurora-finance-minimal-f90: typography, layout, theme and sampled animation stage"
npm run qa:visual:approve -- --run phase3c-audit-20261110-all-visual --case aurora-finance-minimal-f260 --reviewer "<HUMAN_REVIEWER>" --reason "Human-reviewed aurora-finance-minimal-f260: typography, layout, theme and sampled animation stage"
npm run qa:visual:approve -- --run phase3c-audit-20261110-all-visual --case ember-studio-cinematic-f15 --reviewer "<HUMAN_REVIEWER>" --reason "Human-reviewed ember-studio-cinematic-f15: typography, layout, theme and sampled animation stage"
npm run qa:visual:approve -- --run phase3c-audit-20261110-all-visual --case ember-studio-cinematic-f90 --reviewer "<HUMAN_REVIEWER>" --reason "Human-reviewed ember-studio-cinematic-f90: typography, layout, theme and sampled animation stage"
npm run qa:visual:approve -- --run phase3c-audit-20261110-all-visual --case ember-studio-cinematic-f260 --reviewer "<HUMAN_REVIEWER>" --reason "Human-reviewed ember-studio-cinematic-f260: typography, layout, theme and sampled animation stage"
npm run qa:visual:approve -- --run phase3c-audit-20261110-all-visual --case ember-studio-minimal-f15 --reviewer "<HUMAN_REVIEWER>" --reason "Human-reviewed ember-studio-minimal-f15: typography, layout, theme and sampled animation stage"
npm run qa:visual:approve -- --run phase3c-audit-20261110-all-visual --case ember-studio-minimal-f90 --reviewer "<HUMAN_REVIEWER>" --reason "Human-reviewed ember-studio-minimal-f90: typography, layout, theme and sampled animation stage"
npm run qa:visual:approve -- --run phase3c-audit-20261110-all-visual --case ember-studio-minimal-f260 --reviewer "<HUMAN_REVIEWER>" --reason "Human-reviewed ember-studio-minimal-f260: typography, layout, theme and sampled animation stage"
npm run qa:visual:approve -- --run phase3c-audit-20261110-all-visual --case intro-settled --reviewer "<HUMAN_REVIEWER>" --reason "Human-reviewed intro-settled: typography, layout, theme and sampled animation stage"
npm run qa:visual:approve -- --run phase3c-audit-20261110-all-visual --case component-settled --reviewer "<HUMAN_REVIEWER>" --reason "Human-reviewed component-settled: typography, layout, theme and sampled animation stage"
```

## G. Review package

- Folder: `tests/visual/review/phase3c-final-audit/`
- Contact sheet: `contact-sheet.png` (2968×3262, 960×540 thumbnails, case/frame labels). All 14 original-resolution PNG copies are under `images/`.
- Inventory: `manifest.json` includes exact source/absolute/copied paths, existence, 1920×1080 dimensions, sizes, full SHA-256, composition, theme/style/frame and missing-approved-baseline status.
- Report: `audit-report.md`; structured findings: `audit-findings.json`, `visual-findings.json`; execution logs/results and copied capture/layout/comparison/repeat/MP4 evidence are included.
- ZIP: `phase3c-final-audit.zip` contains the contact sheet, manifest, this report, all 14 candidates and audit evidence. `archive.sha256` records its checksum after creation.
- This review folder contains generated unapproved artifacts. Do not commit it as approved references; it is not covered by the current `current/diffs/reports` ignore entries. No `.gitignore` change was made during this read-only audit.

## H. Outstanding issues

### F1: Negative-path oracle accepts any per-case failure — high
- Classification: release-gate defect; blocking: True.
- References: `scripts/qa/failure-check.ts:13-16`
- Evidence: Read-only in-memory module-hook injection supplied an unrelated GPU_LOST failure. All three negative tests returned successfully and printed EXPECTED REJECTION. See logs/negative-oracle-check.log.
- Required action: Require distinct expected error identity/code for missing composition and invalid props; require an actual error-severity layout diagnostic for the critical-layout fixture. Add tests proving unrelated renderer failures are rejected.

### F2: PNG and approval metadata are written sequentially, not transactionally — medium
- Classification: baseline-write robustness limitation; blocking: False.
- References: `scripts/qa/baselines.ts:43-45`
- Evidence: Default wx guards prevent silent overwrites. Under explicit replacement, a metadata-write failure after PNG write can leave the pair inconsistent. No baseline writes were attempted in this audit.
- Required action: Before high-assurance release, stage/validate the pair and provide atomic/rollback behavior for replacement. Current hash validation should fail closed on an inconsistent pair.

### F3: Expected font policy does not assert computed weight/style — medium
- Classification: diagnostic scope limitation; blocking: False.
- References: `packages/ui/src/diagnostics/browser.ts:40-48`, `packages/ui/src/diagnostics/evaluate.ts:28-32`
- Evidence: A pure-function audit measurement with required 700 face available but computed weight 400 returned no finding. See computed-font-policy-check.json. This does not mean the actual candidates use incorrect weights.
- Required action: Document this boundary and consider checking computed weight/style against the policy; availability is not proof of the specific rendered face or glyph coverage.

### F4: Project is untracked within a home-directory Git repository — medium
- Classification: repository governance limitation; blocking: False.
- References: `git-before.txt`
- Evidence: git rev-parse --show-toplevel returns /Users/HaruMalik and scoped status is ?? ./. A clean project commit baseline cannot be established from Git.
- Required action: Resolve project-local repository ownership explicitly before release; do not reset, stage or modify the enclosing repository automatically.

### F5: No approved baselines exist — info
- Classification: human checkpoint; blocking: False.
- References: `tests/visual/baselines/.gitkeep`
- Evidence: Missing baselines must fail the visual/full gate. Candidate capture and repeat-render equality are not approval.
- Required action: After fixing F1, rerun and explicitly human-review/approve the named candidates. Never auto-approve to turn the gate green.


No positive-render regression was observed. Visual baselines remain unapproved. Original system-font portability, exact glyph ink/shaping, complete temporal animation quality, and unmeasured legacy layout remain scoped limitations rather than certified results. No Khmer or broad multilingual guarantee is made.

## I. Phase 3C readiness verdict

**FIXES REQUIRED BEFORE APPROVAL**

Normal code/render checks and the candidate images are in good condition, but F1 violates the required assurance that expected negative cases pass only for the correct reason. Fix that focused oracle defect and rerun the audit gates before approval. Do not rewrite architecture or change reference images merely to get green tests. Human visual approval is also still pending; this audit does not grant it.

## J. Phase 3D recommendation

Phase 3D should not start yet. After F1 is repaired, relevant gates are rerun, and a human explicitly approves the baseline set, Phase 3D may proceed with the previously scoped delivery/text/font QA work. This audit implements no Phase 3D changes.
