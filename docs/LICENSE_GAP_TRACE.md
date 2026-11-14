# Preview dependency notice trace — November 14, 2026

This traces the existing inventory warnings. **It is not legal clearance or an assertion that missing metadata means unlicensed software.** The raw scanner remains unchanged: it specifically counts root-level LICENSE/COPYING/NOTICE files, not every README/source header.

Source inventory: 299 lock entries, 250 installed, eight absent license declarations and twenty installed packages without a root-level license text. Final tested consumer lock: 297 entries/eight absent declarations; its actual lockfile is retained with the consumer report. Do not equate these two dependency graphs.

## Five non-Remotion missing-root-text cases

| Package/version | Evidence traced | Notice preserved | Disposition |
| --- | --- | --- | --- |
| `@esbuild/darwin-arm64@0.28.1` | Binary package declares MIT; installed same-version `esbuild/LICENSE.md` contains the full Evan Wallace MIT notice. | [ESBUILD.txt](licenses/ESBUILD.txt) | Same-version parent notice traced; not a claim about every binary dependency. |
| `esrecurse@4.3.0` | Full BSD-2-Clause notice appears in installed `esrecurse.js` header and README license section. | [ESRECURSE.txt](licenses/ESRECURSE.txt) | Full notice found despite root-file warning. |
| `glob-to-regexp@0.4.1` | Full BSD-2-Clause notice appears in installed README license section. | [GLOB_TO_REGEXP.txt](licenses/GLOB_TO_REGEXP.txt) | Full notice found despite root-file warning. |
| `kiwi-schema@0.5.0` | npm metadata declares MIT and identifies gitHead `1b96d916f9b7bf9ce54d3db3491735a73cce7dec`; that exact source tree contains [LICENSE.md](https://github.com/evanw/kiwi/blob/1b96d916f9b7bf9ce54d3db3491735a73cce7dec/LICENSE.md). | [KIWI_SCHEMA.txt](licenses/KIWI_SCHEMA.txt) | Exact published-source revision notice traced; original `LICENSE` lookup failed because the name is `LICENSE.md`. |
| `svg-parser@2.1.0` | npm metadata and README declare MIT; gitHead `4cdc36283a99f7b686bdf8fc56afa2561e49e6fc`. Exact source tree has no standalone LICENSE; README says only “MIT.” | No invented full notice/copyright substituted. | **Full notice gap remains**; consult upstream/reviewer if needed. |

The four preserved texts carry the original notices, not a newly selected license. No executable dependency/font/media code was downloaded or modified to fill these gaps.

## Fifteen Remotion installed missing-root-text cases

All are version **4.0.541**:

- Eleven declare **MIT** in their package metadata: `@remotion/captions`, `codemods`, `elevenlabs`, `licensing`, `openai-whisper`, `streaming`, `studio`, `studio-server`, `studio-shared`, `timeline-utils`, `zod-types`.
- Two declare **Remotion License**: `@remotion/sdk`, `@remotion/studio-protocol`.
- Two omit a declared license: `@remotion/media`, `@remotion/compositor-darwin-arm64`.

The exact [upstream v4.0.541 tree](https://github.com/remotion-dev/remotion/tree/v4.0.541) was inspected. Its [root Remotion license](licenses/REMOTION.md) exists, but the above package directories do not supply standalone full license notices in that tree. **Do not silently replace their declarations with MIT or claim that the root license conclusively resolves every package/component's terms.** Owner individual eligibility is recorded separately; ambiguity about distribution/component scope remains a reviewer/upstream question.

Seven compositor platform packages plus `@remotion/media` account for the eight absent license declarations. Only Darwin arm64 is installed here; do not claim the other six platform binaries were executed or separately certified.

### Compositor/FFmpeg is not a single MIT component

- Installed FFmpeg n7.1 reports **GPL v2 or later** with its local dylib path configured.
- The tagged upstream compositor FFmpeg [build notice](https://github.com/remotion-dev/remotion/blob/v4.0.541/packages/compositor/ffmpeg/build/LICENSE) is GPLv2-or-later.
- The tagged [wrapper notice](https://github.com/remotion-dev/remotion/blob/v4.0.541/packages/compositor/ffmpeg/wrapper/LICENSE) is WTFPL v2. That does **not** relicense FFmpeg or the rest of the compositor.
- [Official FFmpeg licensing/source-build guidance](https://www.remotion.dev/docs/miscellaneous/ffmpeg-license) also distinguishes copyright from codec patents.

Our archive does not include these binaries or Remotion implementation code. npm retrieves dependencies separately. This boundary is useful evidence, not an automatic legal ruling about every distribution.

## Other obligations visible in the actual inventory

The graph is **not MIT-only**. It includes MPL-2.0 `mediabunny`/encoder packages, CC-BY-4.0 `caniuse-lite` data, Python-2.0 `argparse`, Apache/BSD/ISC and other declarations. Their installed license texts remain with their respective dependencies. Preserve notices and review any obligations before modifying or redistributing covered source/binaries; our MIT does not override them. These dependencies are not embedded in our tarball.

## Recommended final owner decision

Preserve all verified notices, keep unmodified dependencies separately installed, publish only first-party MIT code/templates and clearly disclose Remotion's separate terms. Obtain an owner/reviewer disposition of the remaining full-text/component-scope gaps; if uncertain, use the [prepared clarification request](REMOTION_CLARIFICATION_DRAFT.md). No request has been sent.
