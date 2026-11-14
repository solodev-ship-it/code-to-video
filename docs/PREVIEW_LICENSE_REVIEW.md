# 0.1.0 preview — third-party review checklist

This is a factual release-review aid, **not legal clearance**. First-party MIT does not grant rights to Remotion, bundled fonts/icons, codec patents or trademarks.

## Selected distribution

- Free first-party CLI/templates, npm target `@krungtech/code-to-video@0.1.0`.
- Unmodified Remotion is installed separately by npm as pinned dependencies. No Remotion code, browser binary or `node_modules` tree is copied into our tarball.
- No rebranded Studio, paid editor, hosted rendering service or AI integration.
- Each user remains responsible for the terms applicable to their use/team. “Free package” must not be described as “Remotion is free for everyone.”

## Evidence inspected November 14, 2026

| Component | Evidence and remaining review |
| --- | --- |
| First-party code | Owner-selected [MIT](../LICENSE), 2026 Rorn Bunthong. KrungTech is separately credited. |
| Remotion 4.0.541 | Installed license preserved in [REMOTION.md](licenses/REMOTION.md); the [exact upstream tag's root license](https://github.com/remotion-dev/remotion/blob/v4.0.541/LICENSE.md) was also read. It permits eligible individuals/small organizations to create videos, and restricts derivatives sold/rented/licensed/relicensed/sublicensed. Confirm owner eligibility and the intended CLI/template distribution against these terms; seek Remotion clarification if uncertain. |
| Current Remotion FAQ | [Official FAQ](https://www.remotion.dev/docs/license/faq) discusses allowed use, independent license obligations, source-available rather than OSI-open-source status, and codec patent exclusions. It also discusses newer terms/5.0; do not silently substitute those for the pinned 4.0.541 license. |
| FFmpeg/compositor | The installed macOS arm64 binary reports FFmpeg n7.1, **GPL v2 or later**, via `ffmpeg -L` with its local dylib directory configured. [Official FFmpeg notice/build sources](https://www.remotion.dev/docs/miscellaneous/ffmpeg-license). Our tarball does not embed the binaries; review the obligations for any later binary redistribution, and separate codec patent questions. No MIT/LGPL-only relabeling. |
| Icons | Lucide ISC/MIT and Phosphor MIT notices preserved in [THIRD_PARTY_NOTICES.md](../THIRD_PARTY_NOTICES.md). |
| Fonts/sample images | Unmodified OFL Atkinson QA faces include license/provenance; synthetic ring sample retains its authored asset notice. No new assets downloaded or relicensed. |
| Inventory gaps | Fresh source-lock inventory reports 299 entries, 250 installed, 8 without declared-license metadata and 20 installed without root-level license text. Missing text/metadata does not establish permission or infringement. Trace package/component upstream terms; all platform variants remain part of review. |

In the inventory, seven compositor platform variants and `@remotion/media` account for missing declared metadata. The upstream media package-specific `LICENSE.md` lookup returned 404; the tagged root Remotion license exists. **Do not infer that missing package metadata is MIT or that it is legally resolved by the root license alone.**

Some dependencies declare permissive licenses but omit root-level text. Retain the exact inventory and final clean-consumer lockfile; installed transitive versions may differ from the source lock. License-file presence alone is not substantive legal review.

## Owner/reviewer decisions still needed

Owner clarification, November 14: the author confirms this is personal work by one individual, with KrungTech used only as their project credit, not a separate company/team. That matches the pinned license's individual eligibility category on the stated facts; it is not blanket legal approval of all dependency/distribution questions. Reassess the applicable terms if the organization, team, distribution or use changes; do not assume future contributors automatically have identical eligibility.

1. Actual owner/use context is now confirmed as one individual. Keep downstream users' separate eligibility obligations visible; do not promise that every future company/team can use Remotion for free.
2. Accept the obligation to preserve notices and clearly explain Remotion's separate license to users; resolve any uncertainty about distributing this local CLI/templates integration with Remotion.
3. Review missing metadata/text cases and final-consumer dependency terms, including compositor/FFmpeg and relevant patent considerations.

Contact Remotion through [their official contact page](https://www.remotion.dev/contact) for unresolved product/distribution questions. No contact, upload or representation on the owner's behalf has been made.
