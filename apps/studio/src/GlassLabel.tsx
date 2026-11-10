import {useLayoutEffect, useState} from 'react';
import type {ReactNode} from 'react';
import {Artifact} from 'remotion';
import {useVideoTheme} from '@code-to-video/themes/react';

// Showcase-local semantic treatment. Ordinary small information is foreground;
// accent remains available for decorative marks. No shared card/theme API change.
export function GlassLabel({id, hideInk, children}: {id: string; hideInk: boolean; children: ReactNode}) {
  const theme = useVideoTheme();
  return <span data-glass-label={id} data-glass-label-color={theme.colors.foreground}
    style={{color: hideInk ? 'transparent' : theme.colors.foreground}}>{children}</span>;
}

// Opt-in still QA only: coordinates relative to the definite composition root,
// including when Remotion first mounts it in its offscreen metadata container.
export function GlassLabelProbe({frame, hideInk}: {frame: number; hideInk: boolean}) {
  const [result, setResult] = useState<string | null>(null);
  useLayoutEffect(() => {
    const stage = document.querySelector('[data-glass-stage]');
    if (!stage) throw new Error('Missing glass contrast stage.');
    const root = stage.getBoundingClientRect();
    const labels = [...stage.querySelectorAll<HTMLElement>('[data-glass-label]')].map((element) => {
      const bounds = element.getBoundingClientRect(); const css = getComputedStyle(element);
      let opacity = 1;
      for (let ancestor: HTMLElement | null = element; ancestor; ancestor = ancestor.parentElement) {
        opacity *= Number(getComputedStyle(ancestor).opacity);
        if (ancestor === stage) break;
      }
      return {id: element.dataset.glassLabel, color: element.dataset.glassLabelColor, computedColor: css.color,
        x: bounds.x - root.x, y: bounds.y - root.y, width: bounds.width, height: bounds.height,
        fontSize: css.fontSize, opacity};
    });
    setResult(JSON.stringify({schemaVersion: 1, frame, hideInk, labels}));
  }, [frame, hideInk]);
  return result ? <Artifact filename="glass-labels.json" content={result} /> : null;
}
