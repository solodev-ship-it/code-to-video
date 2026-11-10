import {useMemo} from 'react';
import {Img, OffthreadVideo, Sequence, staticFile} from 'remotion';
import {assetOpacity, bounded, sequenceIndex, validateAssetSource} from './cinematic.ts';
import type {AssetEnvelope, AssetSource} from './cinematic.ts';
export interface Video3DAssetProps {
  source: AssetSource; frame: number; fps: number; width: number; height: number;
  x?: number; y?: number; scale?: number; rotation?: number; opacity?: number; envelope?: AssetEnvelope;
}
export function Video3DAsset({source, frame, fps, width, height, x = 0, y = 0, scale = 1, rotation = 0, opacity = 1, envelope}: Video3DAssetProps) {
  const a = useMemo(() => validateAssetSource(source), [source]);
  bounded(frame, 'frame', -1e7, 1e7); bounded(fps, 'fps', 0.001, 240);
  bounded(width, 'width', 1, 8192); bounded(height, 'height', 1, 8192);
  bounded(x, 'x', -16384, 16384); bounded(y, 'y', -16384, 16384);
  bounded(scale, 'scale', 0.01, 10); bounded(rotation, 'rotation', -360, 360); bounded(opacity, 'opacity', 0, 1);
  const index = a.type === 'sequence' ? sequenceIndex(a, frame, fps) : 0;
  const mediaStyle = {width: '100%', height: '100%', objectFit: 'contain' as const};
  return <div style={{position: 'absolute', willChange: 'opacity, transform', width, height, left: x, top: y, opacity: opacity * (envelope ? assetOpacity(frame, envelope) : 1),
    transform: `rotate(${rotation}deg) scale(${scale})`, transformOrigin: 'center'}}>
    {a.type === 'video' ? <Sequence from={a.startFrame} durationInFrames={a.durationInFrames} layout="none">
      <OffthreadVideo src={staticFile(a.src)} muted style={mediaStyle}/></Sequence>
      : index === null ? null : <Img src={staticFile(a.type === 'png' ? a.src : a.frames[index]!)} style={mediaStyle}/>}
  </div>;
}
