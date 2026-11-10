import type {BrandIdentity, MotionPreset, VisualStyle} from './types.ts';

// Export data only. Importing this module does not register anything.
export const auroraFinance = {
  schemaVersion: 1, id: 'aurora-finance', displayName: 'Aurora Finance',
  colors: {primary: '#4285ff', secondary: '#152e51', accent: '#66e5f2', background: '#080f20', foreground: '#f2f6ff', muted: '#13243d', mutedForeground: '#a6bad5'},
  typography: {fontFamily: 'Helvetica Neue, Arial, sans-serif', headingFontFamily: 'Helvetica Neue, Arial, sans-serif', headingWeight: 700, bodyWeight: 400, letterSpacing: -1},
  metadata: {fictional: true, category: 'financial-documentary'},
} satisfies BrandIdentity;

export const emberStudio = {
  schemaVersion: 1, id: 'ember-studio', displayName: 'Ember Studio',
  colors: {primary: '#bd4639', secondary: '#e6cbb7', accent: '#cf4a3c', background: '#f6f0e7', foreground: '#292724', muted: '#e9dfd2', mutedForeground: '#655b52'},
  typography: {fontFamily: 'Arial, sans-serif', headingFontFamily: 'Georgia, serif', headingWeight: 400, bodyWeight: 400, letterSpacing: -2},
  metadata: {fictional: true, category: 'creative-studio'},
} satisfies BrandIdentity;

export const cinematic = {
  schemaVersion: 1, id: 'cinematic', displayName: 'Cinematic',
  tokens: {
    surface: {color: 'muted', opacity: 0.95}, radii: {card: 28, badge: 24},
    border: {color: 'accent', width: 1, opacity: 0.32},
    shadow: {color: 'foreground', offsetY: 22, blur: 64, opacity: 0.1},
    gradient: {enabled: true, from: 'secondary', to: 'background', angle: 125, opacity: 0.7},
    spacing: {page: 110, gap: 36, cardPadding: 44}, layout: {contentWidth: 1580}, effects: {gridOpacity: 0.065, glowOpacity: 0.12},
  },
} satisfies VisualStyle;

export const minimal = {
  schemaVersion: 1, id: 'minimal', displayName: 'Minimal',
  tokens: {
    surface: {color: 'background', opacity: 1}, radii: {card: 2, badge: 2},
    border: {color: 'foreground', width: 2, opacity: 0.25},
    shadow: {opacity: 0}, gradient: {enabled: false},
    spacing: {page: 110, gap: 48, cardPadding: 36}, layout: {contentWidth: 1580}, effects: {gridOpacity: 0, glowOpacity: 0},
  },
} satisfies VisualStyle;

export const elegant = {
  schemaVersion: 1, id: 'elegant', displayName: 'Elegant',
  tokens: {durationSeconds: 1.1, delaySeconds: 0.2, staggerSeconds: 0.16, easing: 'ease-in-out-cubic', intensity: 0.7, distance: 30, spring: {damping: 26, stiffness: 80, mass: 1.1}},
} satisfies MotionPreset;

export const energetic = {
  schemaVersion: 1, id: 'energetic', displayName: 'Energetic',
  tokens: {durationSeconds: 0.55, delaySeconds: 0.1, staggerSeconds: 0.08, easing: 'ease-out-cubic', intensity: 1.4, distance: 44, spring: {damping: 12, stiffness: 180, mass: 0.8}},
} satisfies MotionPreset;
