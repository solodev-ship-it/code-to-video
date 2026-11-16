# Trying the persistence preview

## Availability

The new0.1.1 scoped preview is prepared for early technical testing and is **not on npm**. The published
0.1.0 preview still has its known selected-project Save/persistence limitations.
Do not use `npx @krungtech/code-to-video@0.1.1` until a separately approved release
has actually been published. Source users can try the fixes now.

Use Node24.7+ within24.x and npm11. Source/build probes pass all nine combinations
of Ubuntu/macOS/Windows and Node22/24/26 at ba9435b. Node22/26 remain experimental
and are rejected by the public operational CLI. The same staged archive passes installed create/typecheck, HTTP Save, graceful
stop/restart, saved-input H2641280×720/30FPS/60-frame render and full decode on
Linux x64, Windows x64 and macOS arm64 ([run43806163663](https://github.com/solodev-ship-it/code-to-video/actions/runs/43806163663), source5823e32).
This is a bounded smoke test, not arbitrary codec/media/hardware certification
or a cross-machine pixel promise.

## From source

With the reviewed repository checked out and the supported runtime selected:

```sh
npm ci
npm run build:cli
node bin/code-to-video.mjs doctor
node bin/code-to-video.mjs create ../my-first-video --template title-card
node bin/code-to-video.mjs preview ../my-first-video
```

Open the printed Studio URL. Edit a content prop in the Schema editor, then leave
the field. Wait for `Project props saved` in the host terminal. The project-owned
`studio-props.json` must stay with the project. Refresh/restart and check the edit.

Provision Chromium once before rendering (`npm run browser:ensure` from source).
Browser setup downloads software; video frame rendering uses the provisioned
browser. Render to a new output filename:

```sh
node bin/code-to-video.mjs render ../my-first-video TitleCard --output ../my-first-video/outputs/title-v1.mp4
```

## From a reviewed archive

The final preparation report supplies the exact0.1.1 `.tgz` path and SHA256.
The tested shared archive SHA256 is `cbe5d821eb9831eb64f212cf448dbeb98843f4e2311168221d49423628e8402d`.
A final documentation-only repack may have a new archive hash; its runtime entries
and package metadata must match the tested archive before reusing this evidence.
Create an empty directory outside the repository and install that archive with
`npm install /absolute/path/to/krungtech-code-to-video-0.1.1.tgz`.
Use `npx --no-install code-to-video doctor`, then the same create/preview/render
commands. Do not request the unpublished version from the registry.

The current workflows keep ephemeral synthetic test evidence as CI artifacts;
these are qualification artifacts, not an approved public package release.
A fresh machine needs a renderer browser provisioned before rendering. After the
archive install, `npx --no-install remotion browser ensure` provisions it for that
consumer. Keep sufficient disk space for dependencies, Chromium and renders.

## Limits

This is an early technical preview: CLI project creation, Studio content editing,
local rendering and two starter templates. Metadata edits remain session-only;
theme/assets belong in the source manifest. Do not edit manifest/sidecar concurrently
with preview. See [persistence and recovery](PERSISTENT_PROJECT_EDITING.md).
No AI narration, general timeline editor or automatic fact/rights approval.
Review [third-party notices](../THIRD_PARTY_NOTICES.md) and local font/layout needs.
