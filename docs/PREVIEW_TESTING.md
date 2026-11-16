# Try the preview from source or a local archive

`0.1.1` is published and registry-verified. For normal installation,
use the [short guide](ONBOARDING.md).

## From source

Source/candidate testing accepts Node24.7+ within24.x or26.13+ within26.x,
with npm11. Published0.1.1 still requires24; see [compatibility](NODE_COMPATIBILITY.md).
From the repository:

```sh
npm ci
npm run build:cli
npm run browser:ensure
node bin/code-to-video.mjs create ../my-first-video
node bin/code-to-video.mjs preview ../my-first-video
```

Stop preview with Ctrl+C, then:

```sh
node bin/code-to-video.mjs render ../my-first-video TitleCard --output ../my-first-video/outputs/title-v1.mp4
```

## From a reviewed archive

In a new tools folder, replace the path below with the supplied `.tgz`:

```sh
npm init -y
npm install /absolute/path/to/krungtech-code-to-video-0.1.1.tgz
npx remotion browser ensure
```

Continue at [create and edit](ONBOARDING.md#2-create-and-edit).

The same runtime passed installed Save/restart, H.264 720p/30 FPS rendering and
full decode on Linux x64, Windows x64 and macOS arm64 ([test run](https://github.com/solodev-ship-it/code-to-video/actions/runs/43806163663)).
Node 22/26 remain experimental. This does not certify every codec, font or machine.
