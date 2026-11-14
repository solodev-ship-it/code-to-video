# v1 release preparation — not a release

## Current direction — November 14, 2026

The owner selected **`@krungtech/code-to-video@0.1.0` public preview**, not stable v1, and a free/open-source CLI/templates distribution using unmodified Remotion. Source metadata stays private/unscoped 0.1.0. `release:pack:preview` now prepares a separate scoped artifact (`private: false`, `publishConfig.access: public`) without publishing; the default `release:pack` still creates the private candidate. Both retain the same exact external dependency pins and archive exclusions. First-party MIT does not clear Remotion/dependency rights.

Clean-consumer testing exposed upstream transitive drift: `@babel/helper-module-transforms@7.29.14` requests unavailable `@babel/traverse@^7.29.14`, causing ETARGET before installation completes. The scoped preview adds an explicit dependency constraint on `@babel/helper-module-transforms@7.29.13`, the version already present in the tested source lock; private packing/source lock/direct runtime versions stay unchanged. This is an evidenced installation fix, not a claim that every transitive dependency is frozen. Final clean-consumer lockfile/evidence must be retained and reviewed.

Fourteen human-reviewed baselines are now installed; exact stored-capture comparison passes. No fresh `qa:all` run or publication is claimed. Isolated Node24.7/npm11.18 is provisioned under ignored `.cache/toolchains/`, activated only for project commands without modifying the global Node26 installation or shell profiles. Official Node archive SHA-256 matched the HTTPS checksum list; no GPG verification was performed. Existing GitHub CI run **42841492482** at committed revision **77c8fc8** completed successfully; new uncommitted scoped changes require a new run before release acceptance. Historical evidence and initial authorization boundaries below are retained; name/version selection and named-baseline approval are no longer pending.

The earlier MIT private candidate was 548,379 compressed bytes / 1,073,138 unpacked bytes (157 files), **excluding installed dependencies, browser and runtime caches**. Local cleanup recovered about 6.59 GB of generated bundle/cache data, not package content. Users do not install private workspace siblings or the full development checkout. Scoped-consumer measurements are recorded below.

## Executed scoped-preview evidence — November 14, 2026

- Fresh supported-runtime `npm run check`: strict TypeScript, **310 tests**, fourteen Studio extraction/save checks; no browser render in that command.
- Scoped candidate `candidate-Fyts61/krungtech-code-to-video-0.1.0.tgz`: **158 files**, **562978 compressed / 1092097 unpacked bytes**, SHA-256 **c75c19e66835f1cfc50a1821a48f8f84fde9dce3ad45f0d9d034a60f10063daa**. Source-root/private/version/lockfile unchanged.
- `qa:package` consumer `candidate-Fyts61/consumer-check-1TWmus/` exits **0**: isolated tarball install without inherited workspace deps, scoped npx help (offline/no-install against the already installed archive), create/typecheck/discovery, real H.264 1920×1080/30 FPS/180-frame/six-second MP4 and full decode. Source-installed frame90 and installed repeat each have **zero differing pixels**. MP4 SHA-256 **27e7dacfbf3f6589bb27021c425185e2949a9f152093630f9532b1a511977ceb**. This tests local archive/scoped command resolution, not an already-published registry install.
- **Logical disk footprint:** installed dependency tree including our package **293445690 bytes**; package itself **1092097 bytes**; shared preprovisioned browser distribution **471144289 bytes**; generated project **5814 bytes / six files** before assets. After checks, the dependency tree plus its generated caches is **521516597 bytes**. Browser was reused outside that tree, not freshly downloaded. Node/npm cache, outputs and production assets are additional; these are not RAM or compressed-download figures.
- Initial consumer `candidate-1hPLKn/consumer-check-BZRFg5` failed ETARGET on upstream Babel drift; retained as failure. The constrained retry above is separate passing evidence. Initial `candidate-Dg0YsP` safely rejected Finder metadata before packing; exclusions now cover `.DS_Store`/AppleDouble without deleting local files.
- Existing hosted CI success covers **77c8fc8 only**. The changed workflow parses locally and includes both private/scoped pack gates, but a new hosted run is still required. No registry publication, tag, full `qa:all`, changed-scene/material rerender or manual installed-Studio walkthrough is claimed.

Evidence-only documentation updates after that successful candidate require a newly audited archive before distribution. They do not justify rerendering unchanged runtime code; verify byte-identical runtime entries and retain the exact consumer-tested archive/report as provenance.

Version-specific licensing evidence and the remaining owner/reviewer questions are in [PREVIEW_LICENSE_REVIEW.md](PREVIEW_LICENSE_REVIEW.md). Fresh source inventory still reports 299/250/8/20 package/installed/missing-metadata/missing-root-text counts. No approval was inferred from permissive labels, free distribution or npm organization ownership.

User-authorized scope: private local candidate/install validation, fast-test CI, license inventory, version/manifest policy, release notes and onboarding. The owner subsequently selected **MIT, copyright (c) 2026 Rorn Bunthong**, with separate KrungTech credit; [LICENSE](../LICENSE) and package metadata now record it. Root and new candidates remain **0.1.0, private**. No tag, registry publish, final name/version change, baseline approval, Studio rebranding or AI integration is authorized. See [copyright/branding scope](BRANDING_AND_LICENSING.md).

## Local preparation commands

```sh
npm run check
npm run release:inventory
npm run release:pack
npm run release:pack:preview
npm run qa:package -- /absolute/path/to/candidate/report.json
```

`release:pack` builds the CLI and creates an allowlisted **private** archive under unique ignored `renders/release-checks/candidate-*`. It stages existing source/compiled tooling and flattens already-pinned external dependencies; it does not publish internal workspaces or fetch them from npm. Unit tests, credentials, private management, production media, outputs, dependencies and caches are excluded. The resulting report includes source/archive hashes and exact staged metadata. A successful pack is not a successful consumer installation or a legally approved release.

`release:pack:preview` uses that same staging/audit path but only the owner-selected scoped 0.1.0 public metadata, repository links and public-access configuration. Unknown mode flags/unselected preview versions fail. There is no automatic registry write, Git tag or release job. Do not run `npm publish` from the private workspace root; only a reviewed final staged artifact can become a distribution.

Installed tooling resolves Remotion and React from the package's actual dependency graph, including hoisted installs. Explicit webpack aliases map the included first-party source exports without unpublished `@code-to-video/*` registry packages. Node host logic uses compiled JavaScript. The source workspace architecture and browser UI contracts remain intact.

See [onboarding](ONBOARDING.md), [version policy](VERSIONING.md), [draft notes](RELEASE_NOTES.md), [third-party notices](../THIRD_PARTY_NOTICES.md) and [changelog](../CHANGELOG.md).

## Gates still requiring real decisions/evidence

- First-party MIT has been selected by the owner; review Remotion terms, dependency and asset/font notices separately. Inventory and our MIT selection do not approve third-party rights or Studio white-labeling.
- Confirm final package name/availability, release version and v1 manifest compatibility policy before metadata changes.
- Explicitly accept/defer the named baseline/sample/earlier visual reviews with reasons. Fourteen unapproved references still block the aggregate gate; no threshold is weakened.
- Complete interactive Studio play/scrub/Save and beginner review of the shipped workflow. Save edits a disposable generated entry; persist desired edits in project JSON.
- Run the checked-in CI on the actual release revision/tag. Workflow presence and a local pass are not remote CI success.
- Explicit human authorization for a tag and any registry publish. No automatic publish workflow is supplied.

## CI boundary

The GitHub Actions workflow runs lockfile install, `npm run check`, license inventory and private archive preparation on Node 24.7.0/npm 11.18.0. Permissions are contents-read only; actions are pinned to inspected commit IDs. It has no browser capture, approval, tag or publication job. Browser-dependent QA requires the documented controlled environment; previous exact macOS pixels are not claimed to match Ubuntu. Hosted CI is unverified until this workflow is committed/pushed and runs.

## Current validation

Preparation is implemented and validated locally; the full RELEASE_V1 milestone is **BLOCKED on remaining human decisions/release acceptance**, not marked complete. First-party MIT is now selected and implemented; nothing is tagged/published. Existing tested candidate gmlwBG predates this license decision and remains unchanged historical evidence; new candidates include LICENSE and matching metadata.

## Executed evidence — November 10, 2026

- `npm run check`: exit 0, strict TypeScript, **307 tests** and fourteen existing Studio extraction/save checks. Five new focused tests cover hoisted tool/type paths, export aliases/upstream shared Config import, private/pinned candidate metadata and archive exclusions. Initial fixture test failed on macOS `/var` versus `/private/var` identity; canonicalized it, then passed. No thresholds weakened.
- `npm run release:inventory`: exit 0, inventory only. Report `renders/release-checks/inventory-Z8vIf5/report.json` covers **299 locked packages, 250 installed, 8 without declared-license metadata and 20 installed without root-level license text**. The missing metadata is compositor variants/`@remotion/media`; missing text/metadata is a manual review task, not an automatic inference of permission or infringement. Optional noninstalled platform entries remain visible. Remotion notice was verified byte-for-byte against installed 4.0.541 license text (SHA-256 `bd65083b940f61904f6ef298aade918a7cad72a3e35bc406e36fab365844b673`).
- `npm run release:pack`: exit 0. Tested private candidate **`renders/release-checks/candidate-gmlwBG/code-to-video-0.1.0.tgz`**, archive SHA-256 **`9ddaad696eeb835ccd08188893507c75a1d84d6b06f3cb056d1ef1bea61333a1`**. Exact source/archive inventory and metadata are in adjacent `report.json`. The archive intentionally contains no first-party license grant; legal/name/version approval remains pending.

  That historical archive predates the owner-selected MIT implementation. Do not distribute it as the current licensed candidate; its installation/render evidence applies to the unchanged runtime, not newly added legal metadata. Generate/audit a new archive for the MIT-bearing artifact.
- `npm run qa:package -- .../candidate-gmlwBG/report.json`: exit **0**. A fresh consumer outside the framework installed normally with `--omit=dev`; no workspaces or unpublished first-party registry packages were used and no inherited workspace dependency fallback was possible. Installed help/create, generated project typecheck, composition discovery and actual MP4 render/full decode passed. The temporary consumer/dependencies were removed only after retaining source snapshots/logs/PNG/video evidence.
- Consumer video: **H.264 1920×1080, 30 FPS, 180 frames, six seconds, 405720 bytes**. SHA-256 **`27e7dacfbf3f6589bb27021c425185e2949a9f152093630f9532b1a511977ceb`**. Source-versus-installed frame 90 and an independent installed repeat both have **zero differing pixels**. Browser Chromium 158.0.8127.2, Node 24.7.0/npm 11.18.0, macOS arm64. Evidence: `renders/release-checks/candidate-gmlwBG/consumer-check-4dqCCr/`.
- First candidate `4J7g3v` packed/installed/helped/created/typechecked, but rendering failed to resolve the first-party alias because an absolute Config module import did not share upstream CLI state. Fixed to the upstream package import, added regression coverage, rebuilt a new candidate and passed the full consumer check. Original failed log/report remain retained, not reclassified.
- `npm run compositions`: exit 0, original fifteen compositions retained (`renders/release-source-compositions.log`). No original scene, theme, font or asset changed. Existing full aggregate evidence at 03edc19 remains explicitly baseline-blocked; unchanged material/full suites were not rerun just to rediscover absent approval. Focused source/installed rendering covers the changed host path.
- CI workflow is local-only/uncommitted, with inspected action commit pins and no publishing step. **No remote CI success is claimed.** Interactive installed Studio play/scrub/Save is unverified; render/discovery are not a substitute.

The candidate records the exact sources at packaging time. Subsequent evidence-only documentation updates do not change tested runtime code; they require a new archive before any real release. The source lockfile inventory is not a promise that every future consumer transitive resolution will be identical. Retain/review the actual final consumer lockfile and terms at release time.

## Owner-selected MIT follow-up

The owner explicitly confirmed personal ownership, MIT, year 2026 and exact holder **Rorn Bunthong**, with separate **KrungTech** README credit. Standard LICENSE and root/three first-party workspace metadata are synchronized; lockfile changes are limited to those four license fields, with dependency versions/integrities unchanged. Our MIT text does not relicense dependencies, bundled third-party assets or Remotion Studio.

Fresh `npm run check` exits 0 with 307 tests and Studio checks. Fresh inventory `renders/release-checks/inventory-IMVFXp/report.json` records MIT/holder and LICENSE hash, while keeping third-party review pending (same 299/250/8/20 package counts). Fresh private candidate **`candidate-Xh0lnb/code-to-video-0.1.0.tgz`** packs/audits successfully: **157 files, 548379 bytes**, SHA-256 **`d24a57c885c4fcb4488442d3dd4e098d31ff5a11774a5c570ed3b600367ca6c6`**. Extracted LICENSE matches the root exactly; metadata preserves MIT, Rorn Bunthong, private and 0.1.0.

All **121 rendering-runtime archive entries** are byte-identical to the previously consumer-tested gmlwBG archive. That installed render/decode/pixel evidence is deliberately reused, not newly rerun; only legal metadata/docs/packaging audit changed. No new browser renders or UI changes were needed. Studio tab/editor branding assessment is documented in [BRANDING_AND_LICENSING.md](BRANDING_AND_LICENSING.md); no logo/title/favicon override was implemented. No commit/push, tag or publish has occurred.
