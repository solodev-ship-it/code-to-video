# Local authoring without an AI account

**0.1.0 is a published public preview, not stable v1.** Node **>=24.7.0 <25**, npm **>=11 <12** (tested 24.7.0/11.18.0) are required. Tested rendering platform: macOS/Apple Silicon; other platforms need their own checks. Allow several GiB of free space. Review [third-party terms](../THIRD_PARTY_NOTICES.md) before production use.

## Install the published 0.1.0 preview

[npm 0.1.0](https://www.npmjs.com/package/@krungtech/code-to-video/v/0.1.0) and [GitHub pre-release](https://github.com/solodev-ship-it/code-to-video/releases/tag/v0.1.0) are available. Registry `latest`, archive integrity, actual unversioned npx create, installed-project typecheck, Studio HTTP readiness, MP4/full decode and exact settled-frame comparison were verified November 14, 2026. The source workspace stays private and logical manifest `framework.name` stays `code-to-video`.

From a chosen workspace, using a new project destination:

```sh
npx @krungtech/code-to-video@0.1.0 create my-first-video
npx @krungtech/code-to-video@0.1.0 preview my-first-video --port 3014
npx @krungtech/code-to-video@0.1.0 render my-first-video TitleCard --output my-first-video/outputs/title-v1.mp4
```

Node/npm and renderer-browser setup are prerequisites; `create` itself does not install packages or copy the engine into the project. The verifier reused an existing browser via `REMOTION_BROWSER_EXECUTABLE`; it did not test a fresh browser download. For your own existing browser, export that variable to its absolute executable path before preview/render. Otherwise upstream Remotion first-use setup/cache behavior may acquire a browser and needs internet access. Stop preview with Ctrl+C before rendering if desired.

Automated Studio HTTP readiness is not a separate installed-package manual play/scrub/Save test; that manual walkthrough remains unverified. Release approval accepts this documented preview limit, not a fabricated test result.

For repeated work, prefer a **persistent shared tools installation** rather than relying on the lifetime of npm's `npx` cache:

```sh
# From your chosen production workspace:
npm install --prefix ./video-tools @krungtech/code-to-video@0.1.0
./video-tools/node_modules/.bin/code-to-video create ./my-first-video
./video-tools/node_modules/.bin/code-to-video preview ./my-first-video --port 3014
./video-tools/node_modules/.bin/code-to-video render ./my-first-video TitleCard --output ./my-first-video/outputs/title-v1.mp4
```

The generated TypeScript configuration and README point to the selected engine installation. Moving/removing that installation (including clearing an npx cache) can break those tooling paths; update them explicitly if it moves. No portability/automatic relocation or project-editor Save persistence is promised in this preview.

The package tarball is not total installed size. Dependencies, Chromium, staged assets, bundles and outputs take additional disk space. Reuse one engine/browser across projects; keep production assets and outputs in their projects. File size is not a RAM/performance guarantee; the renderer uses concurrency 1.

Measured macOS arm64 preview-consumer example: ~293 MB dependencies including the ~1.1 MB package, ~471 MB preprovisioned shared browser, and ~6 KB for the initial six-file project before media. Generated caches brought the dependency tree to ~522 MB after the sample checks. Node/npm cache and outputs are extra; this is a local measurement, not a cross-platform storage or RAM guarantee. See [exact evidence](RELEASE_V1.md).

## Supported source checkout path

```sh
npm ci
npm run build:cli
npm run browser:ensure
npm run cli -- --help
```

Browser acquisition is setup, never part of frame evaluation. Alternatively set `REMOTION_BROWSER_EXECUTABLE` to an already provisioned binary. No AI keys, account, private management repository or downloaded content asset is required.

Create a project **outside the framework**, choosing an existing parent directory and a new destination:

```sh
npm run cli -- create ../my-title --template title-card
npm run cli -- preview ../my-title --port 3014
npm run cli -- render ../my-title TitleCard --output ../my-title/outputs/title-v1.mp4
```

Studio is upstream Remotion tooling and may advertise LAN access; use a trusted network/firewall. Selecting project scene/theme code executes trusted code; validation is not a sandbox. Never run unknown code as if the manifest made it safe.

Edit `code-to-video.project.json` for copy/theme/timing and `compositions/TitleCard.tsx` for authored structure. Sample copy is labeled; replace it and review rights/facts before publishing a video. Studio Save updates a disposable cache entry, **not** the source manifest. Explicitly persist intended props in JSON before restarting. No automatic text fitting, narration, audio or captions are supplied.

## Maintainer local-archive consumer path

After `npm run release:pack`, use the exact archive path printed in its report, in a separate empty directory:

```sh
npm init -y
npm install --omit=dev --prefer-offline --no-audit --no-fund /absolute/path/to/code-to-video-0.1.0.tgz
./node_modules/.bin/code-to-video --help
./node_modules/.bin/code-to-video create ./my-title --template title-card
./node_modules/.bin/code-to-video preview ./my-title --port 3014
./node_modules/.bin/code-to-video render ./my-title TitleCard --output ./my-title/outputs/title-v1.mp4
```

Set a verified `REMOTION_BROWSER_EXECUTABLE` before discovery/preview/render to reuse a provisioned browser. Without it, upstream CLI normal setup/cache behavior applies and may acquire a browser. Do not interpret these local-archive commands as registry `npx` availability. A local install test does not check registry identity, licensing or publishing.

## What to review

Play/scrub the full sample; check typography, contrast, clipping, timing and brand selection. `TitleCard` defaults to 1920×1080/30 FPS/180 frames (six seconds). `explainer` registers `ThreePointExplainer`, 240 frames (eight seconds). `ThemeShowcase` and `ThemeAuroraCinematic` intentionally share defaults, as do the corresponding component demos; these are presets, not unique layouts. System-font appearance can differ across machines.

For failures: choose a new output path (never overwrite), check manifest version and local assets, confirm runtime/browser and disk space, then inspect retained command logs. See [CLI limits](CLI_TEMPLATES.md), [source-project contract](PROJECT_INFRASTRUCTURE.md) and [end-to-end evidence](END_TO_END_QA.md). Human baseline approvals remain separate from successful decoding/repeated pixels.
