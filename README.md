# Code to Video

Create a video project, edit its text in Remotion Studio, and render an MP4.
Built with TypeScript, React and Remotion. No AI account needed.

**Development is paused.** Version **0.1.1** remains the published early preview.
Node 26 support is implemented in source for **0.1.2**, which is not published.
Its release gate remains incomplete because GitHub could not assign the final
macOS ARM64 runner. See [compatibility status](docs/NODE_COMPATIBILITY.md).

## Get started

For published 0.1.1, use **Node 24.7+ within 24.x** and **npm 11**.

Open a terminal in a new folder:

```sh
npm init -y
npm install @krungtech/code-to-video@0.1.1
npx code-to-video doctor
npx remotion browser ensure
npx code-to-video create my-first-video
npx code-to-video preview my-first-video
```

Open the printed Studio URL. Edit text in the Schema panel, leave the field,
and wait for **Project props saved** in the terminal.

Stop preview with **Ctrl+C**, then render:

```sh
npx code-to-video render my-first-video TitleCard --output my-first-video/outputs/title-v1.mp4
```

Your six-second video is in `my-first-video/outputs/`. Use a new filename for each render.

## What you get

- A title card and a three-point explainer template.
- Saved content edits that survive refresh and restart.
- Local MP4 rendering, with no cloud service required.

The installed Save/restart/render workflow passes on Linux x64, Windows x64 and
macOS Apple Silicon with Node 24/npm 11. This is a preview; fonts and layouts can
vary. AI narration, captions and a general timeline editor are future work.

## Need more?

[Short guide](docs/ONBOARDING.md) · [Try from source](docs/PREVIEW_TESTING.md) ·
[Save and recovery](docs/PERSISTENT_PROJECT_EDITING.md) · [Release evidence](docs/RELEASE_V1.md) ·
[Architecture](docs/ARCHITECTURE.md) · [Roadmap](docs/ROADMAP.md)

Developed by **Rorn Bunthong — KrungTech**. First-party code is [MIT licensed](LICENSE).
Remotion and other dependencies retain their [own terms and notices](THIRD_PARTY_NOTICES.md).
