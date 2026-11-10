# Data visualization — Phase 3D.3

The UI workspace exports `VideoBarChart`, `VideoLineChart`, `VideoAreaChart`, `VideoDonutChart`, `VideoProgressChart`, `VideoTimeline`, and `VideoNumber`. Pure data/geometry helpers are at `@code-to-video/ui/charts`. All components consume `VideoThemeProvider`, semantic color roles, and explicit frame/FPS inputs. No network data, charting library, or new package is required.

## Data and scale rules

- Bars take `{categories, series: [{id, label, values, color?}]}`. Every series needs exactly one finite value per category. A zero baseline is mandatory, including with signed values; explicit domains omitting any value or zero are rejected. Vertical and horizontal layouts are supported.
- Lines and areas take series with strictly increasing numeric `{x, y}` observations. X spacing is numeric, preserving irregular intervals. `linear` joins observations; `step` uses horizontal/vertical connectors. Markers and labels appear only at supplied observations. Area fills to zero; explicit domains cannot crop observations.
- Donuts take nonnegative `{id, label, value, color?}` segments. Fractions are normalized without overflow in intermediate sums. Zero totals show a neutral ring. An unrepresentable total is labeled rather than displayed as infinity.
- Progress takes a finite value inside its range (default `[0, 1]`). Out-of-range input throws.
- Timelines take ordered `{id, at, label, title, description?, highlight?}` events. `at` is all numeric values in an authored unit or all validated `YYYY-MM-DD` UTC dates. Default spacing is proportional to intervals. `spacing="events"` explicitly selects equal event spacing and identifies that layout in the accessible label.
- Empty datasets have neutral output. Normalizers copy and freeze valid data; sparse, nonfinite, duplicate, mismatched, and oversized data fail. Sources/provenance remain scene metadata rather than rendered or fetched chart data.

## Motion, formatting, and use

Chart components take `frame`, `fps`, and optional `animation: {startSeconds?, durationSeconds?, staggerSeconds?, easing?, reducedMotion?}`. They reuse existing frame-based motion. Reduced motion snaps visual values at the scheduled start. `VideoNumber` takes `from`, `to`, `frame`, `startFrame`, `endFrame`, and optional reduced motion; every display value is computed from endpoints without cumulative drift.

`formatChartValue` is locale-independent with explicit decimals, grouping, percent and currency options. Currency requires a three-letter code. Very small nonzero values use scientific notation. Tick labels fall back to exact numeric strings if rounding would collide. These display conventions do not verify a statistic or convert physical units.

```tsx
import {VideoBarChart, VideoGlassSurface} from '@code-to-video/ui';

// Within a VideoThemeProvider; frame/fps come from Remotion at the scene boundary.
<VideoGlassSurface style={{width: 900, height: 510, padding: 24}}>
  <VideoBarChart width={850} height={440} frame={frame} fps={fps}
    data={{categories: ['A', 'B'], series: [{id: 'example', label: 'Illustrative units', values: [12, -4]}]}}
    animation={{durationSeconds: 1.2, reducedMotion}} />
</VideoGlassSurface>
```

Charts work inside ordinary `VideoSurface` as well. `VideoDynamicIsland` accepts React children, so an appropriately sized `VideoNumber` or `VideoProgressChart` fits its expanded content without changing the island API. Timeline callers may supply an icon or custom description renderer.

## Limits and verification

SVG renders axes, paths, bars, and rings; timeline/progress/number use React layout. Dimensions are explicit composition pixels. Dense categories, long labels, many series and extreme domains can collide and need authored review. Limits: 64 categories, 8 series, 2,000 points per line series, 32 donut segments, 32 events. Four default semantic series colors exist; further series need explicit roles. No auto fitting, localization, missing-observation inference, contrast certification, or cross-machine font guarantee is claimed.

`DataVisualizationShowcase` is a 1920×1080, 30 FPS, 450-frame composition with explicitly illustrative values. Aurora Finance/Cinematic is the default; inputProps can select Ember Studio/Minimal. `npm run check`, `npm run compositions`, and `npm run qa:charts` cover contracts, discovery and targeted render evidence. `qa:charts` writes ignored candidate PNGs, exact repeats, a decoded MP4 and a report under `renders/chart-checks/`. These are human-review candidates, not approved baselines. Future AI workflows may prepare candidate data and provenance, but human factual review is required before production use; AI and external-project loading are not implemented here.

Executed November 10, 2026 on macOS/arm64: `npm run check` passed strict TypeScript, 200 fast tests and twelve Studio-editable literal registrations. `npm run compositions` found thirteen compositions. Studio served HTTP 200 on localhost:3001. `npm run qa:charts` passed eight representative stills, four exact independent PNG repeat pairs, progressing bar/line comparisons and full H.264/1920×1080/30 FPS/450-frame/15-second MP4 decoding. The final MP4 is 1,446,207 bytes. Report and candidates: `renders/chart-checks/charts-1794300010282-a189ce/`. Earlier failed, interrupted and superseded runs remain in separate ignored directories; they are not passing evidence. Candidate screenshots were inspected for legibility, chronology, legends and centered donut text, but human visual approval is still outstanding.
