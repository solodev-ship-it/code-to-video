import {useLayoutEffect, useRef, useState} from 'react';
import {Artifact, cancelRender, continueRender, delayRender} from 'remotion';
import {collectLayoutDiagnostics} from './browser.ts';
import type {LayoutReport} from './types.ts';

// Explicitly mounted only in QA/development scenes. No instrumentation runs by default.
export function LayoutProbe({compositionId, frame, ready = true, revision = ''}: {compositionId: string; frame: number; ready?: boolean; revision?: string}) {
  const [result, setResult] = useState<{report: LayoutReport; token: object} | null>(null);
  const pending = useRef<{handle: number; token: object} | null>(null);
  useLayoutEffect(() => {
    const token = {}; const handle = delayRender('Waiting for explicit layout QA', {timeoutInMilliseconds: 20000});
    pending.current = {handle, token}; setResult(null);
    if (ready) {
      try {setResult({report: collectLayoutDiagnostics(document, {compositionId, frame}), token});}
      catch (error) {continueRender(handle); cancelRender(error);}
    }
    return () => {continueRender(handle); if (pending.current?.token === token) pending.current = null;};
  }, [compositionId, frame, ready, revision]);
  useLayoutEffect(() => {
    if (result && pending.current?.token === result.token) {continueRender(pending.current.handle); pending.current = null;}
  }, [result]);
  return result ? <Artifact filename="layout.json" content={JSON.stringify(result.report)} /> : null;
}
