import {useLayoutEffect, useState} from 'react';
import {Artifact} from 'remotion';

export function IslandProbe({frame}: {frame: number}) {
  const [content, setContent] = useState<string | null>(null);
  useLayoutEffect(() => {
    const stage = document.querySelector('[data-island-stage]'); if (!stage) throw new Error('Missing island QA stage.');
    const root = stage.getBoundingClientRect(); const island = stage.querySelector<HTMLElement>('[data-island-state]');
    const outer = island?.closest<HTMLElement>('[data-surface]') ?? island?.parentElement; const rect = outer?.getBoundingClientRect();
    const icons = [...stage.querySelectorAll('[data-video-icon]')].map((node) => {const bounds = node.getBoundingClientRect(); return {id: node.getAttribute('data-video-icon'),
      draw: node.getAttribute('data-icon-draw'), viewBox: node.querySelector('svg')?.getAttribute('viewBox'),
      pathCount: node.querySelectorAll('svg path').length, x: bounds.x - root.x, y: bounds.y - root.y, width: bounds.width, height: bounds.height};});
    setContent(JSON.stringify({frame, icons, island: rect ? {state: island?.dataset.islandState, phase: island?.dataset.islandPhase,
      x: rect.x - root.x, y: rect.y - root.y, width: rect.width, height: rect.height,
      backdropFilter: outer ? getComputedStyle(outer).backdropFilter : ''} : null}));
  }, [frame]);
  return content ? <Artifact filename="island-qa.json" content={content} /> : null;
}
