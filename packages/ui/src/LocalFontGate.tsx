import {createContext, useContext, useLayoutEffect, useMemo, useState} from 'react';
import type {ReactNode} from 'react';
import {cancelRender, continueRender, delayRender} from 'remotion';
import {createLocalFontLoader} from './fonts.ts';
import type {FontRequirement, LocalFontDefinition, LocalFontLoader} from './fonts.ts';

const Readiness = createContext(false);
export const useLocalFontsReady = (): boolean => useContext(Readiness);

export function LocalFontGate({fonts, children, timeoutMs = 15000, requiredFaces, loader, resolveAsset}: {
  fonts: readonly LocalFontDefinition[]; children: ReactNode; timeoutMs?: number;
  requiredFaces?: readonly FontRequirement[]; loader?: LocalFontLoader;
  resolveAsset?: (src: string) => string;
}) {
  if (!Number.isFinite(timeoutMs) || timeoutMs < 1 || timeoutMs > 120000) throw new Error('Font timeoutMs must be in [1, 120000].');
  const ownedLoader = useMemo(() => loader ?? createLocalFontLoader({timeoutMs, resolveAsset}), [loader, timeoutMs, resolveAsset]);
  const [ready, setReady] = useState(false);
  useLayoutEffect(() => {
    // Each effect owns its handle, including StrictMode cleanup/remounts.
    const handle = delayRender('Loading approved local fonts', {timeoutInMilliseconds: timeoutMs});
    let active = true;
    setReady(false);
    ownedLoader.load(fonts, requiredFaces).then(() => {if (active) {setReady(true); continueRender(handle);}})
      .catch((error: unknown) => {if (active) {continueRender(handle); cancelRender(error);}});
    return () => {active = false; continueRender(handle);};
  }, [fonts, timeoutMs, ownedLoader, requiredFaces]);
  return <Readiness.Provider value={ready}>{children}</Readiness.Provider>;
}
