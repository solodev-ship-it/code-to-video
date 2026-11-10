import {useVideoTheme} from '@code-to-video/themes/react';
import type {ColorRole} from '@code-to-video/themes';
import type {ReactNode} from 'react';
import {chartNumber, chartProgress, formatChartValue, formatTickLabels, generateTicks, mapCoordinate, normalizeDonut, normalizeXYSeries,
  numericDomain, seriesRole, unitRatio, validateBarData, validateDomain} from './charts.ts';
import type {BarData, ChartAnimation, Domain, DonutDatum, NumberFormat, XYSeries} from './charts.ts';

type ChartBase = {width: number; height: number; frame: number; fps: number; animation?: ChartAnimation; title?: string};
const margin = {left: 78, right: 24, top: 30, bottom: 62};
function size(width: number, height: number) {
  if (![width, height].every(Number.isFinite) || width < 200 || height < 160 || width > 4096 || height > 4096) throw new Error('Chart size must fit within 200–4096 by 160–4096 pixels.');
}
function textProps(fontFamily: string, fontSize: number, fill: string) {return {fontFamily, fontSize, fill};}
function label(value: number, format?: NumberFormat) {return formatChartValue(value, format);}
function roleColor(colors: Record<ColorRole, string>, index: number, role?: ColorRole) {return colors[seriesRole(index, role)];}
function Empty({width, height, title}: {width: number; height: number; title: string}) {
  const t = useVideoTheme();
  return <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`${title}: no data`}>
    <text x={width / 2} y={height / 2} textAnchor="middle" {...textProps(t.typography.fontFamily, 22, t.colors.mutedForeground)}>No data supplied</text>
  </svg>;
}
export type VideoBarChartProps = ChartBase & {data: BarData; orientation?: 'vertical' | 'horizontal'; domain?: Domain;
  grid?: boolean; showValues?: boolean; format?: NumberFormat; barGap?: number; cornerRadius?: number};
export function VideoBarChart({width, height, frame, fps, data: input, animation, title = 'Bar chart', orientation = 'vertical',
  domain: explicit, grid = true, showValues = true, format, barGap = 6, cornerRadius = 5}: VideoBarChartProps) {
  const t = useVideoTheme(); size(width, height);
  if (!['vertical', 'horizontal'].includes(orientation) || !Number.isFinite(barGap) || barGap < 0 || barGap > 30 ||
    !Number.isFinite(cornerRadius) || cornerRadius < 0 || cornerRadius > 30) throw new Error('Invalid bar layout options.');
  const data = validateBarData(input);
  if (!data.categories.length || !data.series.length) return <Empty width={width} height={height} title={title}/>;
  const values = data.series.flatMap((s) => s.values);
  const domain = numericDomain(values, true, explicit)!; const zero = unitRatio(0, domain);
  const plotW = width - margin.left - margin.right, plotH = height - margin.top - margin.bottom;
  const ticks = generateTicks(domain); const tickLabels = formatTickLabels(ticks, format);
  const group = (orientation === 'vertical' ? plotW : plotH) / data.categories.length;
  const slot = Math.max(1, (group - 20) / data.series.length - barGap);
  const axis = orientation === 'vertical' ? margin.top + (1 - zero) * plotH : margin.left + zero * plotW;
  return <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label={title}>
    {data.series.map((s, i) => <g key={`legend-${s.id}`}><circle cx={margin.left + i * (plotW / data.series.length) + 5} cy={14} r={5} fill={roleColor(t.colors, i, s.color)}/>
      <text x={margin.left + i * (plotW / data.series.length) + 17} y={19} {...textProps(t.typography.fontFamily, 15, t.colors.foreground)}>{s.label}</text></g>)}
    {ticks.map((tick, i) => {const p = unitRatio(tick, domain); const coordinate = orientation === 'vertical' ? margin.top + (1 - p) * plotH : margin.left + p * plotW;
      return <g key={tick}><line x1={orientation === 'vertical' ? margin.left : coordinate} x2={orientation === 'vertical' ? width - margin.right : coordinate}
        y1={orientation === 'vertical' ? coordinate : margin.top} y2={orientation === 'vertical' ? coordinate : height - margin.bottom}
        stroke={t.colors.mutedForeground} strokeOpacity={grid ? 0.22 : 0} />
        <text x={orientation === 'vertical' ? margin.left - 12 : coordinate} y={orientation === 'vertical' ? coordinate + 5 : height - margin.bottom + 28}
          textAnchor={orientation === 'vertical' ? 'end' : 'middle'} {...textProps(t.typography.fontFamily, 15, t.colors.mutedForeground)}>{tickLabels[i]}</text></g>;})}
    <line x1={orientation === 'vertical' ? margin.left : axis} x2={orientation === 'vertical' ? width - margin.right : axis}
      y1={orientation === 'vertical' ? axis : margin.top} y2={orientation === 'vertical' ? axis : height - margin.bottom} stroke={t.colors.foreground} strokeOpacity={0.65}/>
    {data.categories.map((category, ci) => <g key={category}>
      <text x={orientation === 'vertical' ? margin.left + group * (ci + 0.5) : margin.left - 12}
        y={orientation === 'vertical' ? height - 14 : margin.top + group * (ci + 0.5) + 5}
        textAnchor={orientation === 'vertical' ? 'middle' : 'end'} {...textProps(t.typography.fontFamily, 16, t.colors.foreground)}>{category}</text>
      {data.series.map((s, si) => {const value = s.values[ci]!; const p = chartProgress(frame, fps, t.motion, animation, ci * data.series.length + si);
        const ratio = zero + (unitRatio(value, domain) - zero) * p; const color = roleColor(t.colors, si, s.color);
        const offset = margin.left + group * ci + 10 + si * (slot + barGap);
        const cross = margin.top + group * ci + 10 + si * (slot + barGap);
        const end = orientation === 'vertical' ? margin.top + (1 - ratio) * plotH : margin.left + ratio * plotW;
        const length = Math.abs(end - axis); const negative = value < 0;
        return <g key={s.id}><rect x={orientation === 'vertical' ? offset : Math.min(axis, end)} y={orientation === 'vertical' ? Math.min(axis, end) : cross}
          width={orientation === 'vertical' ? slot : length} height={orientation === 'vertical' ? length : slot} rx={cornerRadius} fill={color} />
          {showValues && p > 0.7 && <text x={orientation === 'vertical' ? offset + slot / 2 : end + (negative ? -8 : 8)}
            y={orientation === 'vertical' ? end + (negative ? 22 : -9) : cross + slot / 2 + 5}
            textAnchor={orientation === 'vertical' ? 'middle' : negative ? 'end' : 'start'} {...textProps(t.typography.fontFamily, 15, t.colors.foreground)}>{label(value, format)}</text>}</g>;})}</g>)}
  </svg>;
}

export type VideoLineChartProps = ChartBase & {series: readonly XYSeries[]; xDomain?: Domain; yDomain?: Domain; area?: boolean;
  showMarkers?: boolean; showValues?: boolean; grid?: boolean; format?: NumberFormat; interpolation?: 'linear' | 'step'};
export function VideoLineChart({width, height, frame, fps, series: input, animation, title = 'Line chart', xDomain: xExplicit,
  yDomain: yExplicit, area = false, showMarkers = true, showValues = false, grid = true, format, interpolation = 'linear'}: VideoLineChartProps) {
  const t = useVideoTheme(); size(width, height);
  if (!['linear', 'step'].includes(interpolation)) throw new Error('Unknown line interpolation.');
  const series = normalizeXYSeries(input); const points = series.flatMap((s) => s.points);
  if (!points.length) return <Empty width={width} height={height} title={title}/>;
  const xd = numericDomain(points.map((p) => p.x), false, xExplicit)!;
  const yd = numericDomain(points.map((p) => p.y), area, yExplicit)!;
  const x0 = margin.left, x1 = width - margin.right, y0 = height - margin.bottom, y1 = margin.top;
  const x = (v: number) => mapCoordinate(v, xd, [x0, x1]); const y = (v: number) => mapCoordinate(v, yd, [y0, y1]);
  const xTicks = generateTicks(xd), yTicks = generateTicks(yd);
  const xLabels = formatTickLabels(xTicks), yLabels = formatTickLabels(yTicks, format);
  const reveal = (index: number) => chartProgress(frame, fps, t.motion, animation, index);
  return <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label={title}>
    {series.map((s, i) => <g key={`legend-${s.id}`}><circle cx={x0 + i * ((x1 - x0) / series.length) + 5} cy={14} r={5} fill={roleColor(t.colors, i, s.color)}/>
      <text x={x0 + i * ((x1 - x0) / series.length) + 17} y={19} {...textProps(t.typography.fontFamily, 15, t.colors.foreground)}>{s.label}</text></g>)}
    {yTicks.map((tick, i) => <g key={tick}><line x1={x0} x2={x1} y1={y(tick)} y2={y(tick)} stroke={t.colors.mutedForeground} strokeOpacity={grid ? 0.22 : 0}/>
      <text x={x0 - 12} y={y(tick) + 5} textAnchor="end" {...textProps(t.typography.fontFamily, 15, t.colors.mutedForeground)}>{yLabels[i]}</text></g>)}
    {xTicks.map((tick, i) => <text key={tick} x={x(tick)} y={height - 15} textAnchor="middle" {...textProps(t.typography.fontFamily, 15, t.colors.mutedForeground)}>{xLabels[i]}</text>)}
    {series.map((s, si) => {const progress = reveal(si); const color = roleColor(t.colors, si, s.color);
      const last = (s.points.length - 1) * progress; const complete = Math.floor(last); const fraction = last - complete;
      const visible = s.points.slice(0, Math.min(s.points.length, complete + 1)).map((p) => ({x: x(p.x), y: y(p.y)}));
      if (fraction > 0 && s.points[complete + 1]) {const a = s.points[complete]!, b = s.points[complete + 1]!;
        visible.push({x: x(a.x + (b.x - a.x) * fraction), y: interpolation === 'step' ? y(a.y) : y(a.y + (b.y - a.y) * fraction)});}
      const path = visible.map((p, i) => `${i ? interpolation === 'step' ? `H${p.x} V` : 'L' : 'M'}${i && interpolation === 'step' ? p.y : `${p.x} ${p.y}`}`).join(' ');
      const base = y(Math.max(yd[0], Math.min(yd[1], 0)));
      const areaPath = visible.length > 1 ? `${path} L${visible.at(-1)!.x} ${base} L${visible[0]!.x} ${base} Z` : '';
      return <g key={s.id}>{area && areaPath && <path d={areaPath} fill={color} fillOpacity={0.15}/>}<path d={path} fill="none" stroke={color} strokeWidth={4} strokeLinejoin="round" strokeLinecap="round"/>
        {showMarkers && s.points.slice(0, complete + 1).map((p, i) => <circle key={i} cx={x(p.x)} cy={y(p.y)} r={5} fill={color} stroke={t.colors.background} strokeWidth={2}/>)}
        {showValues && s.points.slice(0, complete + 1).map((p, i) => <text key={i} x={x(p.x)} y={y(p.y) - 12} textAnchor="middle" {...textProps(t.typography.fontFamily, 14, t.colors.foreground)}>{label(p.y, format)}</text>)}
      </g>;})}
  </svg>;
}
export function VideoAreaChart(props: Omit<VideoLineChartProps, 'area'>) {return <VideoLineChart {...props} area/>;}

export type VideoDonutChartProps = ChartBase & {data: readonly DonutDatum[]; ringThickness?: number; centerLabel?: ReactNode; format?: NumberFormat};
export function VideoDonutChart({width, height, frame, fps, data: input, animation, title = 'Donut chart', ringThickness = 42, centerLabel, format}: VideoDonutChartProps) {
  const t = useVideoTheme(); size(width, height);
  if (!Number.isFinite(ringThickness) || ringThickness < 4 || ringThickness > Math.min(width, height) / 2) throw new Error('Invalid donut ring thickness.');
  const {segments, total, overflow} = normalizeDonut(input); const radius = Math.min(width, height) * 0.31;
  const circumference = 2 * Math.PI * radius; const cx = width / 2, cy = height / 2;
  return <div style={{position: 'relative', width, height}}><svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label={title}>
    <circle cx={cx} cy={cy} r={radius} fill="none" stroke={t.colors.muted} strokeWidth={ringThickness}/>
    {segments.map((segment, i) => {const p = chartProgress(frame, fps, t.motion, animation, i); const length = segment.fraction * circumference * p;
      return <circle key={segment.id} cx={cx} cy={cy} r={radius} fill="none" stroke={roleColor(t.colors, i, segment.color)} strokeWidth={ringThickness}
        strokeDasharray={`${length} ${circumference}`} strokeDashoffset={-segment.start * circumference} transform={`rotate(-90 ${cx} ${cy})`}/>;})}
    <text x={cx} y={cy + 9} textAnchor="middle" {...textProps(t.typography.headingFontFamily, 34, t.colors.foreground)}>{centerLabel == null ? overflow ? 'Total exceeds range' : label(total ?? 0, format) : ''}</text>
    {segments.map((segment, i) => <g key={`legend-${segment.id}`}><circle cx={20 + i * ((width - 20) / segments.length)} cy={height - 15} r={5} fill={roleColor(t.colors, i, segment.color)}/>
      <text x={32 + i * ((width - 20) / segments.length)} y={height - 10} {...textProps(t.typography.fontFamily, 14, t.colors.foreground)}>{segment.label}</text></g>)}
  </svg>{centerLabel != null && <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none'}}>{centerLabel}</div>}</div>;
}
export type VideoProgressChartProps = ChartBase & {value: number; range?: Domain; label?: string; format?: NumberFormat};
export function VideoProgressChart({width, height, frame, fps, value, range = [0, 1], animation, title = 'Progress chart', label: caption, format}: VideoProgressChartProps) {
  const t = useVideoTheme();
  if (![width, height].every(Number.isFinite) || width < 100 || height < 60 || width > 4096 || height > 4096) throw new Error('Progress graphic size is outside 100–4096 by 60–4096 pixels.');
  validateDomain(range); const ratio = unitRatio(chartNumber(value), range);
  const p = chartProgress(frame, fps, t.motion, animation);
  return <div role="img" aria-label={`${title}: ${label(value, format)}`} style={{width, height, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 14,
    color: t.colors.foreground, fontFamily: t.typography.fontFamily}}>
    <div style={{display: 'flex', justifyContent: 'space-between', fontSize: 24}}><span>{caption ?? title}</span><span>{label(value, format)}</span></div>
    <div style={{height: 22, borderRadius: 11, background: t.colors.muted, overflow: 'hidden'}}><div style={{width: `${ratio * p * 100}%`, height: '100%', background: t.colors.accent, borderRadius: 11}}/></div>
  </div>;
}
