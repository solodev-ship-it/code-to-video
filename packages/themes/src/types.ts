export type JsonValue = null | boolean | number | string | readonly JsonValue[] | JsonObject;
export interface JsonObject {readonly [key: string]: JsonValue}
export type Color = `#${string}`; // Runtime validation narrows this to hex RGB/RGBA.
export interface Colors {
  primary: Color;
  secondary: Color;
  accent: Color;
  background: Color;
  foreground: Color;
  muted: Color;
  mutedForeground: Color;
}
export type ColorRole = keyof Colors;
export interface Typography {
  fontFamily: string;
  headingFontFamily: string;
  headingWeight: number;
  bodyWeight: number;
  titleSize: number;
  bodySize: number;
  captionSize: number;
  lineHeight: number;
  letterSpacing: number;
}
export interface StyleTokens {
  surface: {color: ColorRole; opacity: number};
  radii: {card: number; badge: number};
  border: {color: ColorRole; width: number; opacity: number};
  shadow: {color: ColorRole; offsetY: number; blur: number; opacity: number};
  gradient: {enabled: boolean; from: ColorRole; to: ColorRole; angle: number; opacity: number};
  spacing: {page: number; gap: number; cardPadding: number};
  layout: {contentWidth: number};
  effects: {gridOpacity: number; glowOpacity: number};
}
export type StyleOverrides = {[K in keyof StyleTokens]?: Partial<StyleTokens[K]>};
export interface SpringTokens {damping: number; stiffness: number; mass: number}
export type EasingProfile = 'linear' | 'ease-out-cubic' | 'ease-in-out-cubic';
export interface MotionTokens {
  durationSeconds: number;
  delaySeconds: number;
  staggerSeconds: number;
  easing: EasingProfile;
  intensity: number;
  distance: number;
  spring: SpringTokens;
}
export type MotionOverrides = Partial<Omit<MotionTokens, 'spring'>> & {spring?: Partial<SpringTokens>};
export interface BrandIdentity {
  schemaVersion: 1;
  id: string;
  displayName: string;
  colors: Colors;
  typography?: Partial<Typography>;
  logoAssetId?: string;
  metadata?: JsonObject;
}
export interface VisualStyle {
  schemaVersion: 1;
  id: string;
  displayName: string;
  defaultColors?: Partial<Colors>;
  tokens?: StyleOverrides;
}
export interface MotionPreset {
  schemaVersion: 1;
  id: string;
  displayName: string;
  tokens?: MotionOverrides;
}
export type SceneOverrides = StyleOverrides & {
  colors?: Partial<Colors>;
  typography?: Partial<Typography>;
  motion?: MotionOverrides;
};
export type ThemeSelection = {
  schemaVersion: 1;
  brandId: string;
  styleId: string;
  motionId: string;
  overrides?: SceneOverrides;
};
export type DeepReadonly<T> = T extends object ? {readonly [K in keyof T]: DeepReadonly<T[K]>} : T;
export type RegisteredBrand = DeepReadonly<Omit<BrandIdentity, 'metadata'>> & {readonly metadata?: JsonObject};
export type ResolvedTheme = DeepReadonly<StyleTokens & {
  schemaVersion: 1;
  brandId: string;
  brandName: string;
  styleId: string;
  styleName: string;
  motionId: string;
  motionName: string;
  colors: Colors;
  typography: Typography;
  motion: MotionTokens;
  logoAssetId?: string;
}> & {readonly metadata?: JsonObject};
