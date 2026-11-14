# Local authoring without an AI account

This is a private **0.1.0 preparation build**, not a published v1. Node **>=24.7.0 <25**, npm **>=11 <12** (tested 24.7.0/11.18.0) are required. Tested rendering platform: macOS/Darwin 25.6.0 arm64; other platforms need their own checks. Allow several GiB of free space. Review [third-party terms](../THIRD_PARTY_NOTICES.md) before production use.

## Scoped 0.1.0 preview — prepared, not yet published

`npm run release:pack:preview` prepares `@krungtech/code-to-video@0.1.0` with public access metadata; it never publishes. The source workspace stays private and the logical manifest `framework.name` stays `code-to-video`. Use the exact scoped `.tgz` path printed by that command for local installation, following the archive workflow below. `npm run qa:package -- /absolute/path/to/report.json` validates either the private or scoped archive in an isolated consumer; retain its logs/consumer lockfile before release.

**Only after registry publication**, the intended quick-start commands are:

```sh
npx @krungtech/code-to-video@0.1.0 create my-first-video
npx @krungtech/code-to-video@0.1.0 preview my-first-video --port 3014
npx @krungtech/code-to-video@0.1.0 render my-first-video TitleCard --output my-first-video/outputs/title-v1.mp4
```

Do not use those commands as evidence that the package is already on npm. Node/npm and renderer-browser setup are still prerequisites; `create` itself does not install packages or copy the engine into the project.

For repeated work, prefer a **persistent shared tools installation** rather than relying on the lifetime of npm's `npx` cache:

```sh
# After publication, from your chosen production workspace:
npm install --prefix ./video-tools @krungtech/code-to-video@0.1.0
./video-tools/node_modules/.bin/code-to-video create ./my-first-video
./video-tools/node_modules/.bin/code-to-video preview ./my-first-video --port 3014
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

## Private archive consumer path

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
