import type {BrandIdentity} from '@code-to-video/themes';

// Fictional third brand: add this data + one registration, not renderer branches.
export const verdantHealth = {
  schemaVersion: 1,
  id: 'verdant-health',
  displayName: 'Verdant Health',
  colors: {
    primary: '#28765b', secondary: '#d8e9de', accent: '#3c8f69',
    background: '#f2f7f0', foreground: '#17352a', muted: '#e2ecdf', mutedForeground: '#4b6857',
  },
  typography: {fontFamily: 'Arial, sans-serif', headingFontFamily: 'Georgia, serif'},
  metadata: {fictional: true, category: 'education'},
} satisfies BrandIdentity;
