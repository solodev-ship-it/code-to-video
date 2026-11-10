# End-to-end production QA

This gate validates a **local source checkout**, not a published npm package. AI stays off. Run with Node 24.7+ (24.x), npm 11.x, a pre-provisioned Remotion browser, and `ffmpeg`/`ffprobe` on PATH. Human visual review is separate. Never approve baselines merely to make the gate pass.

## Manual reproduction (write procedure first)

1. Use a fresh copy of framework source plus the committed lockfile, without `node_modules`, generated output, secrets or private management/production files. Record its revision, source hashes, lockfile hash, OS/architecture, Node and npm versions. Do not run `npm ci` over a working checkout with user dependencies.
2. In that copy, run `npm ci --prefer-offline --no-audit --no-fund`, `npm run check`, and `npm run build:cli`. This still installs from the lockfile into a fresh dependency directory; a populated npm download cache is allowed. Record failed attempts too. Allow several GiB of free disk space for dependencies and full-gate captures. Browser provisioning is a setup operation: set `REMOTION_BROWSER_EXECUTABLE` to the existing pinned binary (or run `npm run browser:ensure` before rendering). No asset/browser acquisition occurs in frames.
3. From a directory outside the framework copy, run:

   ```sh
   node /absolute/path/to/framework/bin/code-to-video.mjs create ./sample --template title-card --id EndToEndSample
   ```

4. Edit only `sample/code-to-video.project.json`: set the title to `Local production check` and subtitle to `Edited outside the framework. No AI services required.` Keep sample labeling. In `sample/compositions/TitleCard.tsx`, change `width:96` to `width:160` (the scene-local accent rule). Record before/after source hashes; framework source must remain unchanged.
5. From `sample/`, run `node /absolute/path/to/framework/bin/code-to-video.mjs render . TitleCard --output outputs/EndToEndSample.mp4`. Confirm H.264, 1920×1080, 30 FPS, 180 decoded frames, six seconds, nonzero size, and full `ffmpeg -v error -i outputs/EndToEndSample.mp4 -f null -` decode. Record SHA-256.
6. Capture independent PNGs at frames 15 and 90, then frame 90 again through the same generated project entry. Require exact decoded-pixel equality of the two frame-90 renders and a nonzero difference between entry/settled frames. Record browser/version/render settings; cross-machine equality is not promised. System-font compatibility is not verified glyph coverage.
7. On separate copies of the project, run the named negative cases below through the actual CLI. Require no output file or new staging directory. Do not accept crashes, signals, timeouts, or generic nonzero status as expected rejections.
8. Run `npm run qa:all -- --run e2e-UNIQUE` in the clean framework. It must retain its actual nonzero exit if references are unapproved. A blocked baseline gate is **not** a passing full gate. Retain logs and structured comparison reports; unexpected capture/metadata/pixel/environment errors remain failures.
9. Watch the output and review these notes. Interactive Studio play/scrub/Save is a separate manual check; rendering or HTTP readiness does not prove it.

## Expected failure categories (defined before automation)

| Case | Deliberate mutation/request | Required CLI evidence |
| --- | --- | --- |
| `missing-asset` | Add image `MissingAsset` at `assets/missing.png`, do not create it | Exact `code-to-video: assets/missing.png: missing file` |
| `invalid-manifest` | Set `schemaVersion` to 999 | Exact `code-to-video: schemaVersion: unsupported version; expected 1 (no migration)` |
| `unknown-composition` | Request `NotRegistered` | Exact `code-to-video: render requires a manifest composition id` |
| `incompatible-framework` | Set `framework.version` to `99.0.0` | Exact compatible-version validator error naming installed version and `0.1.x` |

Each case requires CLI exit **1**, no signal, its own exact diagnostic line, no extra error lines (after ANSI removal), and absence of the intended MP4 and new staging directories. A changed upstream error protocol must fail closed and be reviewed. Additional unit fixtures must demonstrate that GPU errors, opaque wrappers, successful commands and missing evidence are not accepted.

## Status

Tooling and technical acceptance are complete; **human review is PENDING**. After scoped cache cleanup, the failed aggregate stages completed successfully and comparison was reached. The full quality gate correctly remains **blocked with exit 1 solely for 14 unapproved visual references**. No baseline was approved automatically. The original ENOSPC failure remains historical evidence, not a pass. Registry installation/publishing remains RELEASE_V1 work.

## Automated reproduction

`npm run qa:e2e` creates a new `renders/e2e-checks/e2e-*` directory containing a source-only framework copy and a standalone `sample/` beside it. It installs from the unchanged lockfile, runs the fast checks/build, edits the external sample, renders/fully decodes it, captures independent frames and exercises all four CLI rejections before invoking `qa:all`. Tracked and unignored source files are copied; symlinks and secret-like paths are rejected. Keep unrelated untracked files out of the checkout when taking the source snapshot.

It preserves `report.json`, source SHA-256 records, runtime/browser/lockfile provenance, command logs, source/sample files, PNGs and the MP4 under that ignored run. No project repository is initialized. Failed attempts are retained for diagnosis; the command does not erase previous runs. Review disk capacity before running it.

The command exits **0** only if both standalone checks and the aggregate gate pass. Missing approved references produce report status **blocked** and exit **1**, but only if the full gate reached its structured comparison and every failed comparison is specifically `MISSING_BASELINE`. Unexpected crashes, drift, incomplete reports, critical diagnostics, pixels or other failures remain **failed**, never relabeled as pending approval. The browser-free `npm run check` tests these adapters without performing installations or browser renders.

## Executed evidence — November 10, 2026

- Fresh root and isolated `npm run check`: exit 0, strict TypeScript, **302 tests**, fourteen Studio extraction/save checks. Node v24.7.0, npm 11.18.0, Darwin 25.6.0 arm64, Chromium 158.0.8127.2. No dependencies were added; install uses the existing lockfile.
- Manual run: `renders/e2e-checks/manual-_bzc0qnw/`. Initial install failed ENOSPC; cached retry installed 253 packages. npm's esbuild allow-scripts warning remains visible; no install-script policy override. First render timed out and exposed upstream CLI ignoring the browser environment setting. After forwarding the explicit CLI browser flag, the manual edit/render/decode and all four rejection diagnostics passed. Only test-owned redundant browser/dependency caches were removed, not user assets.
- First automated run, `e2e-2ro0pL`: clean install passed; an existing test assumed the browser override was absent. Corrected its explicit expected arguments. A development env-typing TypeScript error was also corrected before the final passing checks. Failed attempts remain recorded.
- Final automated run: **`renders/e2e-checks/e2e-ldwVd7/`**. Clean install, isolated check/build, actual CLI create, external manifest/scene edit, project typecheck/discovery and render all passed. H.264 **1920×1080, 30 FPS, 180 frames, six seconds, 349116 bytes**; full decode passed. SHA-256: `a6d4dab0a59800fab0c3ad036bd6a9770b8cd1b9c797e718f53b19874d231fab`.
- Independent settled PNG repeats: **zero differing pixels**. Entry/settled: 64029 differing pixels. Four CLI negative checks each exited 1 with its exact case-bound diagnostic, no output and no new staging directory.
- The nested `qa:all` exited **1**: fonts/layout, all 20 cross-theme exact-repeat cases and intro/component still repeats passed, then MP4 smoke stopped with **ENOSPC**. No baseline comparison report was produced. The wrapper correctly retained overall **failed** (with standalone `technicalStatus: passed`), not a fabricated missing-baseline-only block. See `full-gate.log` and `framework/tests/visual/reports/operation-failed-1794315633926.json` in that run.
- Separately verified all **272 source-snapshot files** remain unchanged. Source snapshot hash: `a660b168c00f5180032e699df3349e8f4bf4af5b7d55f5b4fe1d012839221a81`. Exact source/lock/browser hashes and raw command exits are preserved in the run. New source is uncommitted; no package was published and no baseline was approved.

Review `renders/e2e-checks/e2e-ldwVd7/sample/outputs/EndToEndSample.mp4`, `settled.png`, and these reproduction notes. Agent frame inspection is not human approval. Interactive Studio remains unverified.

### Resume without repeating successful standalone renders

The disk-space resume below was completed on November 10, 2026; see the follow-up evidence. Do not repeat passing renders merely to rediscover missing approval.

Free several GiB of disk space first; do not delete unrelated assets automatically. Reuse the named standalone evidence while its source/assets/settings/environment remain unchanged. From the retained `renders/e2e-checks/e2e-ldwVd7/framework/` checkout, set the same provisioned `REMOTION_BROWSER_EXECUTABLE` and run only the failed aggregate stage with a new label:

```sh
npm run qa:all -- --run e2e-resume-UNIQUE
```

Keep the new result alongside the existing report; do not rewrite failed history. This full-stage rerun is required after the ENOSPC failure, but the completed standalone MP4/frame checks need not be repeated. Review and explicitly authorize any baseline approvals separately. After end-to-end acceptance, the next required milestone is RELEASE_V1 (not yet authorized); AI_PRODUCTION is optional.

## Disk recovery and aggregate continuation — November 10, 2026

User authorized cleanup and aggregate completion. Removed only inspected rebuildable production-webpack, isolated-test webpack/bundle and workspace npm download caches; no source, videos, PNG candidates, reports, fonts or user assets were deleted. The running Studio/development cache was left alone. Cleanup increased measured free space from 592019456 to 1879998464 bytes (about **1.2 GiB reclaimed**); manifest: `renders/e2e-checks/disk-cleanup-resume.json`. About 1.2 GiB remained after QA, so substantial future rendering still needs disk headroom.

Continuation run **`e2e-resume-1794318265833`** reused prior passing standalone/font/layout/theme evidence only after verifying all 272 snapshot files, Node/npm/OS/architecture, lockfile and browser hash unchanged. It reran the failed MP4 stage (1080p/30 FPS/150 frames/five-second H.264 intro, full decode), intro/component exact repeats, three category-bound aggregate negative fixtures, and 14-case candidate capture/comparison. Technical stages passed; all 14 comparison failures are specifically `MISSING_BASELINE`. Known upstream `Target.closeTarget` cleanup warnings on the negative paths remain visible and do not substitute for matching the required causal errors.

The actual continuation command exited **1**, correctly recorded as **blocked**, with `technicalStatus: passed` and human review `PENDING`. It uses the same unchanged aggregate stage functions; it is not a new passing `npm run qa:all` invocation. Reports and comparison:

- `renders/e2e-checks/e2e-ldwVd7/resume-aggregate.log`
- `renders/e2e-checks/e2e-ldwVd7/e2e-resume-1794318265833-report.json`
- `renders/e2e-checks/e2e-ldwVd7/framework/tests/visual/reports/e2e-resume-1794318265833-visual-*`

The prior 302-test result was reused, not rerun: all 238 runtime/test/template/package inputs still match its snapshot; only documentation changed. Source changes, altered settings or environment drift would require affected checks again. Human review of the named candidates/sample and interactive Studio remains outstanding. No baseline was approved or replaced. No additional implementation milestone is authorized.
