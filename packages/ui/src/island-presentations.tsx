import type {ReactNode} from 'react';
import {useVideoTheme} from '@code-to-video/themes/react';
import {VideoText} from './VideoText.tsx';
import {VideoStack} from './VideoStack.tsx';

export function IslandNotification({description}: {description: string}) {
  return <VideoText style={{fontSize: 27, lineHeight: 1.4}}>{description}</VideoText>;
}
export function IslandStatistic({label, value, comparison, trend}: {label: string; value: string; comparison?: string; trend?: ReactNode}) {
  return <VideoStack gap={10}>
    <VideoText variant="caption" tone="mutedForeground" style={{fontSize: 20}}>{label}</VideoText>
    <VideoStack direction="row" align="center" gap={20}>
      <VideoText style={{fontSize: 54, lineHeight: 1.1}}>{value}</VideoText>{trend}
      {comparison && <VideoText style={{fontSize: 24}}>{comparison}</VideoText>}
    </VideoStack>
  </VideoStack>;
}
export function IslandProgress({title, progress}: {title: string; progress: number}) {
  const t = useVideoTheme();
  if (!Number.isFinite(progress) || progress < 0 || progress > 1) throw new Error('Island progress must be in [0, 1].');
  return <VideoStack gap={16}>
    <VideoStack direction="row" justify="space-between" gap={12}>
      <VideoText style={{fontSize: 22}}>{title}</VideoText><VideoText style={{fontSize: 22}}>{Math.round(progress * 100)}%</VideoText>
    </VideoStack>
    <div role="progressbar" aria-label={title} aria-valuenow={Math.round(progress * 100)} aria-valuemin={0} aria-valuemax={100}
      style={{height: 6, borderRadius: 3, backgroundColor: t.colors.muted, overflow: 'hidden'}}>
      <div style={{width: `${progress * 100}%`, height: '100%', backgroundColor: t.colors.accent}} />
    </div>
  </VideoStack>;
}
export function IslandAnnouncement({headline, description}: {headline: string; description: string}) {
  return <VideoStack gap={10}><VideoText style={{fontSize: 27}}>{headline}</VideoText><VideoText tone="mutedForeground" style={{fontSize: 21}}>{description}</VideoText></VideoStack>;
}
export function IslandMedia({title, detail, artwork}: {title: string; detail?: string; artwork?: ReactNode}) {
  return <VideoStack direction="row" align="center" gap={18}>
    {artwork && <div style={{width: 64, height: 64, flexShrink: 0}}>{artwork}</div>}
    <VideoStack gap={6}><VideoText style={{fontSize: 24}}>{title}</VideoText>{detail && <VideoText tone="mutedForeground" style={{fontSize: 20}}>{detail}</VideoText>}</VideoStack>
  </VideoStack>;
}
