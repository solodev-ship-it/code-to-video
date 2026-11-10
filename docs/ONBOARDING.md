# Local authoring without an AI account

This is a private **0.1.0 preparation build**, not a published v1. Node **>=24.7.0 <25**, npm **>=11 <12** (tested 24.7.0/11.18.0) are required. Tested rendering platform: macOS/Darwin 25.6.0 arm64; other platforms need their own checks. Allow several GiB of free space. Review [third-party terms](../THIRD_PARTY_NOTICES.md) before production use.

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
