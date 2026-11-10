# Independent video projects — schema version 1

The later [CLI_TEMPLATES](CLI_TEMPLATES.md) milestone adds an optional compiled local binary and two scaffolds on top of this unchanged manifest contract. Shared host orchestration now lives in `scripts/project-host.ts`; `project-runner.ts` preserves the npm entry. Historical infrastructure-only boundaries below describe its original delivery.

The local framework now loads a selected project outside the engine repository, adds its compositions to Studio, and renders a manifest composition to MP4. This private source integration does not require a management sibling, a published package, AI services or a new CLI binary. Production media and project source remain outside engine Git. Existing fifteen showcases are unchanged.

## Local use

Run from the framework root with the existing dependencies/browser installed:

```sh
CODE_TO_VIDEO_PROJECT=/absolute/path/to/my-project npm run studio
CODE_TO_VIDEO_PROJECT=/absolute/path/to/my-project npm run compositions
CODE_TO_VIDEO_PROJECT=/absolute/path/to/my-project npm run render:project -- MyScene renders/my-project/MyScene-v1.mp4
```

Relative project roots resolve from the caller's working directory. With the variable unset, `npm run studio` and `npm run compositions` use the original Studio entry/public directory. Workspace-level scripts still select only the original showcases; use root scripts for project selection. `npm run render` remains the original intro shortcut. The project render accepts exactly a manifest composition id and a new path beneath ignored `renders/`; it fixes H.264/yuv420p, concurrency 1, parallel encoding off and overwrite off. Use even dimensions. Never move production originals into the framework to make a render work.

## Manifest and source contract

```text
my-project/
  code-to-video.project.json
  assets/mark.svg
  compositions/MyScene.tsx
  compositions/themes.ts       # optional trusted initialization
```

```json
{
  "schemaVersion": 1,
  "id": "MyProject",
  "title": "An independent project",
  "framework": {"name": "code-to-video", "version": "0.1.0"},
  "width": 1280, "height": 720, "fps": 30,
  "theme": {"brandId": "aurora-finance", "styleId": "minimal", "motionId": "elegant"},
  "assets": [{"id": "mark", "path": "assets/mark.svg", "type": "image"}],
  "compositions": [{"id": "MyScene", "durationInFrames": 60, "props": {"title": "Hello"}}]
}
```

Each `compositions/<id>.tsx` default-exports a React component. IDs start with a letter and use letters, digits and hyphens. Duplicate asset/composition IDs and collisions with showcase IDs fail. Props are finite inert JSON data; reserved `brandId`, `styleId`, `motionId` and `assets` inputs come from the loader. No functions, URLs, arbitrary theme CSS or evaluated code belong in manifest data. Unknown contract fields fail; arbitrary data keys are allowed inside `props`. Width, height, FPS and duration use the starter's positive-safe-integer rule; width/height must also be even. This is not a promise that arbitrarily huge values are renderable.

The wrapper supplies a resolved `VideoThemeProvider` and props including the three theme ids and an `assets` map. Read tokens with `useVideoTheme()` and use `staticFile(assets.mark)` for an `Img`/media source. Each id maps to a staged project-relative public path, such as `project-assets/assets/mark.svg`. Asset `type` is `image`, `video`, `audio` or `font`; it is a declared category, not byte/codec/license verification. Shared paths can have multiple ids. No media is fetched during frames. Missing files and non-files fail preflight.

Theme precedence stays defaults → style → brand → motion → scene overrides. Default initialization explicitly registers the existing Aurora/Ember, cinematic/minimal and elegant/energetic presets. For additional typed configuration, optional `compositions/themes.ts` exports `registerThemes(registry: ThemeRegistry): void`. It registers extra typed data using existing methods before the registry is sealed. The module runs in both Node preflight and browser startup; keep it pure, deterministic, browser-safe TypeScript without JSX. Unknown/duplicate theme IDs fail. In Node, its runtime imports must resolve from the project's own dependencies or explicit framework source paths; type-only imports are erased. No automatic theme discovery or fallback brand exists. Scene code can explicitly resolve bounded overrides with the existing theme API when inputs change.

**Selected project source is trusted executable code. JSON validation does not sandbox it.** Only select a project whose source a human has placed/reviewed. The optional theme module executes during preflight. Project source can depend on the existing React, Remotion, themes and UI packages; webpack resolves these from the selected framework installation. A separate TypeScript project needs corresponding local dependency resolution or explicit `paths`/`typeRoots`, as demonstrated by the external example's tsconfig. Projects elsewhere need no particular sibling directory name. Framework code never imports the production or management directory as a dependency.

## Boundaries and implementation

- Browser-safe contracts: `packages/projects/src/index.ts`, `manifest.ts`, `registry.ts`. `validateProjectManifest(input, registry, frameworkVersion?)` returns a newly owned, deeply frozen plain JSON snapshot. Defaults target framework 0.1.0; the runner reads the installed root version.
- Node preflight: `packages/projects/src/load.ts`, `loadProject(explicitRoot, registry?, frameworkVersion?)`. Realpath containment checks manifest, source entry files and assets, rejecting traversal, absolute paths, schemes, queries, missing files and symlink escapes. Asset names use the existing cinematic safe characters and must start with `assets/`.
- Integration: `scripts/project-host.ts`, `project-runner.ts` and `project-entry.ts`. Only validated assets are copied into unique ignored `.cache/projects/session-*` public directories alongside the original Studio public assets. No source asset is modified. Generated literal composition IDs/defaultProps preserve Studio extraction and source saving without rewriting showcase Root.tsx. Theme resolution is memoized by selection, outside frame work.
- Studio Save edits the disposable generated registration, **not the manifest**. Restart regenerates from the manifest; persist desired changes explicitly in project JSON. No migration or round-trip project editor is implemented.

Version 1 accepts the current `0.1.x` framework line, requires an explicit version and rejects all other schema versions. No migration exists. A later schema needs a written non-destructive migration and must never silently rewrite user files. These source modules are not published packages. Audio/caption production, rights workflows, general storage/staging products, CLI creation/templates and AI automation remain future scope.

## Technical evidence — 2026-11-10

Implemented on framework HEAD `fad0909` plus the uncommitted files from this milestone; Node 24.7.0 and existing Remotion 4.0.541 on macOS arm64. No dependencies were added or installed.

- `npm run check`: strict TypeScript and **252 tests** (30 Studio, 32 themes, 94 UI, 55 reliability, 41 projects), plus fourteen existing Studio extraction/save checks. Project tests include frozen data, all major rejection cases, temporary external fixtures, missing files, manifest/source/asset symlink containment, explicit theme registration, generated literal extraction/save and invalid-project nonzero exit with no output.
- `npm run compositions`: original fifteen compositions. With `CODE_TO_VIDEO_PROJECT=../video-projects/infrastructure-example`, the same fifteen plus `IndependentProjectExample` (1280×720, 30 FPS, 60 frames).
- `npm run render:project -- IndependentProjectExample renders/project-infrastructure/IndependentProjectExample-v1.mp4` with that variable: rendered the external synthetic MIT-licensed example. ffprobe confirmed H.264, 1280×720, 30/1 FPS, 60 counted frames and 2 seconds; full ffmpeg decode passed. Repeating the output path exited 1 with `Output already exists` before rendering.
- External example source and generated entry passed strict TypeScript checks using the example's tsconfig mapping to existing framework dependencies. Studio served HTTP 200 on port 3013. Browser-access host was unavailable; interactive playback/Save is unverified. An extracted settled frame was inspected for layout; this is not human approval.

Machine-readable MP4 evidence and command logs are under ignored `renders/project-infrastructure/`. The external example is not committed into framework Git. Earlier check attempts caught a multi-dot manifest filename rejected by the asset-path rule, macOS `/var` realpath expectation differences in tests, and external React type resolution; these were corrected before the passing checks. No thresholds or baseline approvals changed. `qa:all` and unchanged material suites were not rerun under the scoped milestone validation plan; aggregate baseline approval remains pending. Sample MP4 human review is PENDING.
