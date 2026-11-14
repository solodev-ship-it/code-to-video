# Third-party notices — release preparation

First-party framework code is licensed under [MIT](LICENSE), copyright (c) 2026 Rorn Bunthong, as explicitly selected by the owner. KrungTech is separately credited in the README, not named as copyright owner. This license applies to authored framework code, **not** Remotion, other dependencies, bundled third-party fonts/icons or their trademarks. Third-party review and release acceptance remain pending.

The selected preview is a free CLI/templates distribution with unmodified Remotion, not a white-labeled editor. See the [preview-specific review checklist](docs/PREVIEW_LICENSE_REVIEW.md) for version-specific evidence and remaining owner/reviewer decisions.

- **Remotion 4.0.541:** conditional Remotion license, not MIT. The installed `remotion/LICENSE.md` was read and is preserved verbatim in [docs/licenses/REMOTION.md](docs/licenses/REMOTION.md). Human review must address company-license eligibility and restrictions on derivatives/resale/relicensing. Framework license selection cannot override Remotion's terms. Other Remotion packages/binary components retain their own package license files.
- **FFmpeg/compositor:** installed macOS arm64 FFmpeg n7.1 reports GPL v2 or later. See [upstream licensing/build sources](https://www.remotion.dev/docs/miscellaneous/ffmpeg-license). Binaries are installed as dependencies, not embedded in this tarball. Do not describe them as MIT or assume a copyright license also grants codec patent rights.
- **Lucide React 1.71.0:** ISC plus MIT notices for Feather-derived icons. Full notice: [LUCIDE.txt](docs/licenses/LUCIDE.txt).
- **Phosphor React 2.1.10:** MIT. Full notice: [PHOSPHOR.txt](docs/licenses/PHOSPHOR.txt).
- **Atkinson Hyperlegible:** unmodified QA fixture only, SIL OFL 1.1; [OFL](apps/studio/public/fonts/atkinson/OFL.txt), [provenance/hashes](apps/studio/public/fonts/atkinson/PROVENANCE.json). Do not apply this attestation to unrelated fonts. System fonts used by other scenes are not bundled or guaranteed portable.
- **Ring PNG sample:** authored local synthetic example; [asset notice](apps/studio/public/advanced-effects/LICENSE.txt) stays beside the eight images. No downloaded stock media, narration or music is added.
- **React/React DOM, TypeScript, PNG/pixel and build tooling:** package manifests and installed license texts are inventoried by `npm run release:inventory`. That report includes exact lockfile versions/integrities, text hashes and absent platform-specific optional packages. It is an inventory, not a completed legal review.

Dependencies are installed normally from their pinned npm packages; this candidate does not bundle their code into the archive. License texts/attributions still need review for the chosen final distribution. No browser binary is redistributed; browser provisioning is a separate setup operation with its own terms.
