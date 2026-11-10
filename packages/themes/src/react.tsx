import {createContext, useContext} from 'react';
import type {ReactNode} from 'react';
import type {ResolvedTheme} from './types.ts';

const VideoThemeContext = createContext<ResolvedTheme | null>(null);

export function VideoThemeProvider({theme, children}: {theme: ResolvedTheme; children: ReactNode}) {
  return <VideoThemeContext.Provider value={theme}>{children}</VideoThemeContext.Provider>;
}

export function useVideoTheme(): ResolvedTheme {
  const theme = useContext(VideoThemeContext);
  if (!theme) throw new Error('useVideoTheme requires a VideoThemeProvider.');
  return theme;
}
