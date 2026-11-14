# Draft 0.1.0 public-preview release notes — NOT RELEASED

Target: **`@krungtech/code-to-video@0.1.0`**, Git tag **`v0.1.0`**, GitHub **pre-release**. No tag, release or npm publication is claimed by this draft. The source workspace remains private at0.1.0; a separately allowlisted scoped artifact is the distribution. This preview is not stable v1. AI automation is not included.

## Implemented and reviewable

- Local TypeScript/React/Remotion authoring with theme-aware video-native UI, bounded surfaces/icons/Dynamic Island/charts/clay and external-media cinematic components.
- Version-1 independent project manifests, contained local assets and trusted custom scene code.
- Local create/preview/render CLI, title-card and three-point explainer templates with explicit sample copy.
- Deterministic frame animation and source/evidence-bound QA; exact repeat pixels do not constitute human approval.
- Private and scoped-public-metadata artifacts, installed-tooling resolution, browser-free CI, dependency notice inventory and onboarding.

## Validation and size

- 310 local fast tests/strict TypeScript and fourteen Studio extraction/save checks pass. Framework9294994 has successful hosted CI43608109589; any newer release revision/tag needs its own applicable CI acceptance.
- Clean scoped tarball install, npx resolution against that installed archive, create/typecheck/discovery, real1080p30/six-second MP4/full decode and exact source-installed/repeat frames passed. Not a registry-install claim.
- Fourteen explicitly human-reviewed baseline references installed; exact stored-capture comparison passes. Earlier aggregate failure reports remain historical; no newly passing full `qa:all` execution is claimed.
- Measured macOS arm64 consumer: ~293MB dependency tree including the ~1.1MB package, ~471MB shared browser, ~6KB initial project before assets. Generated caches brought that dependency tree to ~522MB after checks. Node/npm cache, outputs and media are extra; this is not a RAM/cross-platform guarantee.
- Render evidence: macOS arm64, Node24.7/npm11.18, Chromium158. Ubuntu CI checks source/packages, not cross-platform browser pixels. Other render platforms remain unverified.

See [exact evidence](RELEASE_V1.md) and [onboarding](ONBOARDING.md). After publication, the intended command is `npx @krungtech/code-to-video@0.1.0 create my-first-video`; until then use the reviewed local archive/source workflow.

## Licensing and final owner gate

First-party code:MIT, copyright(c)2026 Rorn Bunthong; KrungTech is the solo author's project credit, not separate company ownership. Remotion is unmodified and has its own conditional terms. Our tarball does not embed its implementation, compositor binaries, Chromium or `node_modules`. Other dependencies/assets retain their own notices and obligations.

Four missing-root-file notices have been traced/preserved; full-text/component-scope gaps remain explicitly documented in [LICENSE_GAP_TRACE.md](LICENSE_GAP_TRACE.md). No copyright/permission was invented. See [the release decision checklist](PREVIEW_RELEASE_CHECKLIST.md); tests, owner individual eligibility and free distribution are not blanket legal clearance.

## Known preview limits

System-font portability and complex-script shaping are not certified. External video is opaque-only; use PNG/PNG sequences for alpha. No general3D runtime, audio/caption production, AI automation, custom dashboard or cloud rendering. Scene source is trusted executable code, not sandboxed. Studio Save edits a disposable generated entry, not the manifest. Studio may advertise LAN access; use trusted networks/firewall.

Generated TypeScript/README paths point to the selected engine installation; moving/removing it or clearing an npx cache can break tooling paths. Prefer a persistent shared tools installation for real work. Output overwrite is refused. Caches/assets/output storage grow with use.

A separate installed-consumer interactive Studio play/scrub/Save walkthrough is not demonstrated by automated render/discovery; the source/local Studio checklist was human accepted. The owner must explicitly review or defer that separate installed-package interactive claim for this preview, without implying it was tested.
