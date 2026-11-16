# Your first video

**Status:** `0.1.1` is prepared but not published. The registry commands below work after publication. To try it now, use the [source or local archive](PREVIEW_TESTING.md).

## 1. Set up once

Use **Node 24.7+ within 24.x**, **npm 11**, and a new folder with several GiB free.

```sh
npm init -y
npm install @krungtech/code-to-video@0.1.1
npx code-to-video doctor
npx remotion browser ensure
```

The browser command downloads Chromium once. Keep this tools folder in place;
your projects use it. No global install or AI key is needed.

## 2. Create and edit

```sh
npx code-to-video create my-first-video
npx code-to-video preview my-first-video
```

Open the Studio URL printed in the terminal. In the Schema panel, edit the title
or other text, then leave the field. Wait for **Project props saved** in the terminal.
Edits stay in your project's `studio-props.json`; keep that file with the project.

## 3. Render

Stop preview with **Ctrl+C**, then:

```sh
npx code-to-video render my-first-video TitleCard --output my-first-video/outputs/title-v1.mp4
```

Open the MP4 in `my-first-video/outputs/`. Choose a new filename next time.

## Another template

```sh
npx code-to-video create my-explainer --template explainer
npx code-to-video preview my-explainer
```

Render it with composition ID `ThreePointExplainer` instead of `TitleCard`.

## If something goes wrong

- **Runtime error:** run `npx code-to-video doctor`; use Node 24/npm 11.
- **Output exists:** choose a new MP4 filename.
- **Save conflict:** stop preview and follow [recovery steps](PERSISTENT_PROJECT_EDITING.md#conflict-and-recovery-rules).

Text edits save; theme/assets belong in `code-to-video.project.json`. Timing and
size edits in Studio are session-only. Avoid editing the manifest while preview
is open. Run trusted project code and keep Studio on a trusted network.
Review your sample copy and [dependency terms](../THIRD_PARTY_NOTICES.md) before production.
