# Local production templates

`title-card/TitleCard.tsx` is a six-second opening card. `explainer/ThreePointExplainer.tsx` is an eight-second three-point layout. The CLI copies their source into a new independent project and writes a schema version 1 manifest. Initial copy is explicitly labeled SAMPLE COPY; it is not reviewed production content.

Both reuse the existing theme provider, semantic tokens and frame/FPS motion components, with an explicit reducedMotion prop. No media, font files, network resources or additional dependencies are bundled. Fonts follow the selected existing system-font tokens; inspect layout on the target machine. Templates target 1920×1080 at 30 FPS. Other dimensions, extreme themes and longer copy require authored layout review. Studio Save persistence follows the project loader's disposable-entry rule.

Human review of a named template render remains required. Framework publishing/licensing review belongs to the release gate; these files do not approve third-party fonts/assets or any release.
