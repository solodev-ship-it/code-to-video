# Phase 3D.1 finalization and human visual-review handoff

## A. Current repository health

The focused contrast correction and review package are implemented. No Phase 3D.2 work, dependency installation, theme rewrite or baseline approval is included. The original implementation evidence remains in [PHASE_3D1_REPORT.md](PHASE_3D1_REPORT.md); this document supersedes its open glass-label contrast issue, not its historical results.

Audit before editing: `npm run check` exited 0 with the existing **163 tests**. Git still resolves to `/Users/HaruMalik`; project-scoped status is `?? ./`, not a clean independent project repository.

## B. Original 14 candidates and preservation

Frozen review source: `phase3d1-final-all-visual`, the latest complete original-case capture at the beginning of this task. Every PNG was hash-checked against its capture report before copying. Full-resolution copies retain the exact original bytes, not re-encoded pixels. Source images and the baseline directory are never destinations of this workflow.

| Case ID | State |
| --- | --- |
| `aurora-finance-cinematic-f15` | Entrance |
| `aurora-finance-cinematic-f90` | Settled |
| `aurora-finance-cinematic-f260` | Fade |
| `aurora-finance-minimal-f15` | Entrance |
| `aurora-finance-minimal-f90` | Settled |
| `aurora-finance-minimal-f260` | Fade |
| `ember-studio-cinematic-f15` | Entrance |
| `ember-studio-cinematic-f90` | Settled |
| `ember-studio-cinematic-f260` | Fade |
| `ember-studio-minimal-f15` | Entrance |
| `ember-studio-minimal-f90` | Settled |
| `ember-studio-minimal-f260` | Fade |
| `intro-settled` | Existing intro smoke |
| `component-settled` | Existing component smoke |

The package `manifest.json` contains all full SHA-256 hashes, source run/path, frame, dimensions and per-image inspection notes. `SHA256SUMS.txt` also covers contact sheets, evidence, notes, index and manifest. Thumbnails are explicitly review-only, never comparison inputs or baseline replacements.

## C. Pixel inspection

All 14 original PNGs, both historical glass PNGs, both corrected glass PNGs and the four labeled contact sheets were inspected as actual image pixels using the available image reader. No obvious accidental clipping, unintended wrap or broken hierarchy was seen. This is agent inspection, **not human approval**.

- Original frame-15 titles are intentionally partly transparent during entrance. Frame 260 intentionally fades the scene. Neither is a settled small-text contrast certification.
- The original Ember QUALITY labels remain coral and visibly lighter than the main text. They are preserved historical fixtures with a contrast review concern; this local glass correction does not silently fix/certify those older scenes. A human can reject an original candidate instead of approving it to make the gate green.
- Corrected glass retains its layout, material hierarchy, subtle patterns and accent-colored decorative bars/borders. Informational labels are now foreground-colored. No obvious new clipping or shadow truncation was seen in the settled candidates.
- System-font portability, visible glyph ink/shaping and other aspect ratios/backends remain outside a universal guarantee.

## D. Ember investigation and smallest correction

The original 3.46–3.81:1 values compared accent tokens with nearby settled-card pixels; they were not measurements of every actual letter location. The kicker (`MATERIAL STUDIES`) and indexed card eyebrows (`ATMOSPHERE`, `HIERARCHY`, `RESTRAINT`) carry ordinary information, not purely decorative marks, so the correction targets **4.5:1** small-text contrast.

`apps/studio/src/GlassLabel.tsx` is a scene-local span that uses the existing `theme.colors.foreground`. The showcase supplies it through the existing ReactNode eyebrow slot and kicker content. Global colors, shared `VideoCard`/`VideoText`, surface presets and public component APIs are unchanged. No brand-ID conditional is used in rendering; cyan/coral remain available for decorative signal bars, patterns and borders. No extra backing was necessary for the measured built-in presets/backgrounds.

### Measurement and regression policy

`scripts/qa/glass-contrast.ts` uses actual Remotion PNGs paired with otherwise identical glyph-hidden PNGs. A still-only browser probe records each label's composition-relative line box, nominal semantic color and inherited opacity. The test evaluates WCAG sRGB contrast against **every underlying composited pixel in that exact box**, taking the minimum, not an average or nearby sample. It requires opaque text/background and fully settled opacity. A separate visible-ink assertion rejects absent or incorrectly colored labels.

The tests cover **44 rendered combinations / 176 labels**: Aurora/Ember × cinematic/minimal, showcase frames 90/180/299, all four surface presets over dark/light/grid/high-frequency backgrounds, true blur and simulated-frost fallback. Four additional showcase repeat pairs validate these probes without changing the original 46-pair material suite. The original Ember accent is a causal negative control rejected by the same 4.5:1 assertion.

- Worst stress-matrix minimum: **Aurora 6.468:1; Ember 6.858:1**.
- Corrected Ember settled showcase labels: **10.649–12.816:1** minimum across their respective line boxes.
- Re-evaluating the old accent color at these exact glyph-hidden boxes gives **3.196–3.846:1**, explaining why the older nearby samples (3.46–3.81:1) were insufficient as a measurement policy. Both methods identify the same failure; the new gate is spatially stricter.
- These are nominal opaque text-color contrast measurements, not antialiased-edge contrast, fade-entrance legibility, whole-frame accessibility compliance or a promise for arbitrary future footage/overrides.

Before/after decoded-pixel inspection found **zero changed pixels outside the four label boxes** (with a two-pixel antialiasing margin) for both named glass candidates. The change is limited to informational label ink, not the material, typography sizing or layout. Evidence: `tests/visual/reports/phase3d1-review-label-only-diff.json`.

New fast tests reject old accent contrast, isolated bad backdrop pixels, invalid/translucent measurements, transparent backgrounds and missing visible ink. No pixel threshold was relaxed.

## E. Validation evidence

The corrected surface run is `phase3d1-review-surfaces-b`; its capture and material reports are under `tests/visual/reports/`. It passed **46 exact-repeat PNG pairs**, parallel/out-of-order equality, blur/border/shadow/alpha checks, the 176-label contrast gate and a new **1920×1080 / 30 FPS / 300-frame / 10-second H.264 MP4**, fully decoded by ffmpeg. The new MP4 is 772,178 bytes; historical MP4s were not overwritten.

An initial new harness run (`phase3d1-review-surfaces-a`) exited 1 because it accidentally supplied the sampling `frame` as an inputProp; the existing strict validator correctly rejected `selection.frame`. The harness now keeps frame selection separate from composition props. This was not treated as an expected material rejection; the failed report/log remains available. The subsequent full surface run exited 0.

Final command exits and preservation evidence are recorded in `tests/visual/reports/phase3d1-review-integrity.json` and `.cache/phase3d1-review-exits.json`. The final validation summary is appended below after command completion.

## F. Human approval workflow — commands not executed

The unchanged CLI requires explicit `--run`, `--case`, `--reviewer`, `--reason`; checks candidate identity/hash/dimensions/environment evidence and error-severity layout findings; and refuses existing destinations unless `--replace` is explicitly supplied. Baseline PNG/JSON writes remain sequential, not transactional, so inspect both files after any human-approved operation. No real baseline exists or was created by this task.

A read-only preflight verified all 14 named candidates' identity/hash/dimensions, nonfailed status, environment evidence, absence of critical layouts and size limits: **11,056,732 total PNG bytes**, below the 20 MiB reference budget, with each file below 2 MiB. It supplied no reviewer/reason and executed no approval. Evidence: `tests/visual/reports/phase3d1-review-approval-preflight.json`.

The exact 14 individual commands are in the review package's `HUMAN_APPROVAL_COMMANDS.md`. Each uses the frozen run that supplied the reviewed full-resolution copy. Set `REVIEWER` to the actual human identity and `REASON` to that person's truthful case-specific decision before **each accepted case**. Shell parameter guards reject unset/empty values. No placeholder reviewer or approval evidence was fabricated. Do not approve a candidate with unresolved issues just to make `qa:all` green.

Example command shape (not executed):

```sh
npm run qa:visual:approve -- --run phase3d1-final-all-visual --case ember-studio-minimal-f90 --reviewer "${REVIEWER:?Set actual human reviewer}" --reason "${REASON:?Set truthful case-specific reason}"
```

After actual approval of all accepted required original cases:

```sh
npm run qa:visual:compare -- --run phase3d1-final-all-visual
```

New glass images remain a separate review set. They are not silently added to `tests/visual/cases.ts` or the original 14-case approval commands.

## G. Review package and artifacts

**Primary handoff:** `renders/review-packages/phase3d1-human-review/`

- `index.html` — local full-resolution image navigation, clearly marked UNAPPROVED.
- `phase3c-originals/` — all 14 byte-identical original PNGs.
- `glass-before/` — two preserved historical glass PNGs for comparison.
- `glass-corrected/` — two regenerated full-resolution glass PNGs.
- `contact-aurora-finance.png`, `contact-ember-studio.png`, `contact-original-smokes.png`, `contact-glass-before-after.png` — labeled contact sheets.
- `manifest.json`, `SHA256SUMS.txt` — inventory and hashes.
- `REVIEW_NOTES.md`, `HUMAN_APPROVAL_COMMANDS.md`, `evidence/` — inspection, guarded human-only commands and source/contrast reports.

Corrected video: `tests/visual/current/phase3d1-review-surfaces-b-media/GlassmorphismShowcase.mp4`.

Reproduction: `python3 scripts/qa/review-package.py renders/review-packages/NEW-UNIQUE-LABEL`. It refuses an existing package directory, copies images byte-for-byte and uses the QA host's already-installed Pillow 12.3.0 only for review thumbnails. No package was installed and Pillow is not a rendering-core or npm-test dependency. An earlier draft package remains preserved at `renders/review-packages/phase3d1-visual-finalization/`; the named primary handoff has the corrected ASCII contact-sheet title labels.

## H. Git ownership recommendation — no migration performed

`code-to-video` remains inside an enclosing home-directory repository, not independently versioned. Scoped Git inspection is appropriate; a parent-wide reset/cleanup or configuration change is not. No `git init`, remote operation, history rewrite, directory move or sibling-project mutation was performed.

Future recommendation, requiring separate explicit authorization:

1. Back up and inventory the engine, parent tracked paths/history and production assets; agree who owns each repository and which history must be retained.
2. Establish `code-to-video` as the independent reusable-engine repository, with its own reviewed source/license/lockfile history and ignored generated media/caches/secrets.
3. Establish `video-projects` separately only when its ownership/storage policy is approved. Keep project content/configuration/rights/provenance separate from engine releases; choose an intentional large-media strategy rather than committing raw video by default. Per-production repositories may later be preferable to one aggregate history.
4. Plan the parent/nested-repository boundary deliberately with the owner; do not remove parent index entries, move directories or create nested repositories automatically. Verify the future Git roots and asset backups before any authorized migration.

This is governance advice, not implementation of Phase 4 external-project loading.

## I. Remaining blockers and limitations

- Human acceptance/rejection of original and corrected candidates remains required. Missing approved baselines must keep `qa:all` nonzero.
- Original legacy Ember coral labels and intentionally dim entrance/fade states are explicitly flagged for human review; no unrelated scene was changed.
- Tested contrast is limited to built-in opaque theme colors, the stated presets/backgrounds and settled frames. New footage, transparency, fonts, script shaping, aspect ratios and rendering backends require new checks.
- Expected missing-font 404 and upstream negative-path `Target.closeTarget` warnings remain visible; they must not be confused with unexpected errors.
- Enclosing Git ownership is still unresolved. No human approval or production-release certification is implied by technical readiness.

## J. Verdict

**READY FOR HUMAN VISUAL APPROVAL**, subject to the final validation results below. This means the evidence and review handoff are ready for a human decision, **not** that any image is approved or that the aggregate release gate passes.

### Modified files in this focused task

- Scene-only correction/probe: `apps/studio/src/GlassLabel.tsx` (new), `GlassmorphismShowcase.tsx`, `glass-props.ts`, `Root.tsx` (literal default for the optional QA ink-hiding flag).
- QA: `scripts/qa/glass-contrast.ts` (new), `scripts/qa/surfaces.ts`, `tests/reliability/glass-contrast.test.ts` (new), `scripts/qa/review-package.py` (new).
- Documentation: this report, Advanced Surfaces, historical-report handoff note, README, blueprint, architecture and roadmap status pointers. No shared UI component, theme source, approval implementation, case registry, package version or lockfile changed.
