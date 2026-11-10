# Phase 3D.4B — Cinematic compositing

This layer composites authored media; it is not a 3D renderer. No runtime or dependencies were added. Human visual approval remains separate from technical verification.

## Public APIs

React exports from @code-to-video/ui:
- Video3DAsset: source, frame, fps, width, height; optional x/y (pixels), scale, rotation (degrees), opacity and envelope.
- VideoDepthLayer: children, frame, startFrame, durationInFrames; depth [-4,4], travelX/Y [-200,200] and reducedMotion. Translates in whole pixels to avoid subpixel compositing drift, using a relative wrapper without perspective or DOM measurement. Nest wrappers for layers.
- VideoLightSweep: frame, startFrame, durationInFrames; semantic colorRole, intensity [0,1], reducedMotion. Absolute overlay; place inside a positioned parent. Clipped to its parent bounds/radius.
- VideoGlow: children, semantic colorRole, intensity [0,1], spread [0,80] pixels, clip. One box shadow around a wrapper, not an alpha-contour bloom. clip=true clips the glow at wrapper bounds; default overflow is visible.

Effects consume the existing theme provider; assets preserve authored colors. No brand branches or changes to theme contracts. Static image/sequence frames use Remotion Img readiness; decode errors remain fatal. Video uses muted OffthreadVideo in a Sequence and requires Remotion frame context. Its frame prop must match the composition-local current frame; video timing is owned by Remotion, not by the explicit frame prop.

Pure @code-to-video/ui/cinematic exports AssetSource, PlaybackPolicy, AssetEnvelope, validateAssetSource, sequenceIndex, cinematicProgress and assetOpacity. Source validation returns a frozen snapshot; memoize source objects outside frame rendering. Configuration is serializable data. Do not pass executable external project code.

## Source and alpha matrix

| Source | Contract | Alpha |
| --- | --- | --- |
| PNG still | type: png, src | RGBA supported |
| PNG sequence | type: sequence, frames, sourceFps, startFrame, policy | RGBA supported |
| MP4 | type: video, src, startFrame, durationInFrames, alpha: opaque | No transparency |
| WebM | Same video contract | Only opaque supported here; codecs must be supported by the pinned pipeline |
| GLB/FBX/OBJ/EXR/ProRes | Unsupported | Convert externally |

Paths are explicit relative paths under the Remotion public directory, with alphanumeric, underscore, hyphen and slash names. URLs, traversal, query strings and arbitrary schemes are rejected. Validation checks metadata, not file bytes/codecs/rights. Node-only verifyCinematicAssets in scripts/qa checks existence and realpath containment (including symlinks); use it before rendering. It does not stage assets or implement Phase 4 storage. Remotion reports missing/decode failures rather than substituting media.

## Frame mapping

Sequence frames is an ordered list, commonly ring-000.png through ring-007.png. Names are not inferred: every frame must be listed. The selected index is floor((frame-startFrame)*sourceFps/compositionFps).
- once: hidden before start and after the final frame's interval.
- hold: first image before start; last image after end.
- loop: hidden before start; modulo frame count thereafter.

Rates are positive finite values up to 240; start is a nonnegative integer. No frame history, random state or network fetch selects frames. Nonintegral source/composition ratios repeat or skip frames without interpolation. Envelope uses a half-open [startFrame,endFrame) interval with linear entry/exit opacity ramps. Duration fields are positive integer frames. Depth and sweep progress clamps to [0,1]; reduced motion disables translation/sweep. Glow is static.

Example (inside a theme provider and Remotion composition):

```tsx
const source = {type: 'sequence', frames: ['shot/000.png', 'shot/001.png'],
  sourceFps: 15, startFrame: 10, policy: 'hold'} as const;
<Video3DAsset source={source} frame={frame} fps={fps}
  width={600} height={600} x={300} y={180}
  envelope={{startFrame: 0, endFrame: 120, fadeInFrames: 12, fadeOutFrames: 12}}/>
```

## External authoring and performance

In Blender or equivalent, author camera/material/light animation externally. Render RGBA PNG with transparent film, a fixed resolution/rate, and sequential zero-padded names. Export straight alpha with clean transparent edges; inspect over both light and dark backgrounds for halos. List the exact frames and their source rate. Prefer PNG sequences for alpha; ordinary H.264 MP4 has no alpha. Flatten onto a deliberate background when exporting opaque video.

Keep production originals outside engine Git. Only explicitly prepared assets under an approved public root are renderable here; root selection/staging is future work. Use small proxies for previews; preserve originals and rights records. Bound image sizes, layer counts and shadow spread; avoid stacking many glows. This is CSS compositing, not physically accurate lighting, depth occlusion, bloom, or motion blur. No custom decoder, live model import or frame interpolation.

AdvancedEffectsShowcase is 1920×1080, 30 FPS, 90 frames. Eight tiny original CC0 RGBA ring studies and their license are in apps/studio/public/advanced-effects. scripts/qa/generate-cinematic-assets.mjs reproduces them with overwrite protection. They are analytic external-style imagery, not Blender renders.

Run npm run check, npm run compositions, npm run qa:cinematic. The focused suite captures entry/sweep/settled frames, independently repeats two frames with exact pixel comparison, verifies source presence, and renders/probes/fully decodes a 3-second 1080p H.264 MP4. Results go to a unique ignored renders/cinematic-checks directory. These captures are unapproved review candidates; no baseline is created or replaced. System-font portability and aesthetic/edge-quality review remain human checks.

## Executed evidence (2026-11-10)

Final npm run check passed: strict TypeScript, 211 tests total (30 Studio, 32 themes, 94 UI, 55 reliability), and Studio source extraction/save checks. Composition discovery listed 15 compositions. Final npm run qa:cinematic passed under HeadlessChrome 158.0.8127.2: three full-HD frames, two independent repeats with zero differing pixels, and a 1920×1080/30 FPS/90-frame H.264 output verified by ffprobe and full ffmpeg decode. Artifacts: renders/cinematic-checks/cinematic-1794308499521-b60d73/report.json and adjacent PNG/MP4 files. Earlier failed runs are retained; no thresholds were relaxed. New documentation local links and output ignore scope were checked.

Interactive Studio preview was attempted but the computer-use browser host was unavailable. Rendered stills were inspected instead. Opaque video input contracts use the existing Remotion pipeline but the focused showcase tests PNG inputs; arbitrary video codec compatibility is not certified by these results. Human review of final entry/sweep/settled images and MP4, plus interactive Studio preview, remains outstanding. Existing baseline approvals remain pending. Technical implementation and targeted automated validation are complete; the full preview/review gate is not claimed complete.
