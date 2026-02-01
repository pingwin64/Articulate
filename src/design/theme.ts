// Articulate - Liquid Glass Minimalism Design System

export interface ColorPalette {
  bg: string;
  surface: string;
  stroke: string;
  primary: string;
  secondary: string;
  muted: string;
  glassHighlight: string;
  success: string;
  warning: string;
  error: string;
  info: string;
}

export type ThemeMode = 'light' | 'dark';

export const Colors: Record<ThemeMode, ColorPalette> = {
  light: {
    bg: '#FFFFFF',
    surface: 'rgba(0,0,0,0.03)',
    stroke: 'rgba(0,0,0,0.08)',
    primary: '#000000',
    secondary: '#666666',
    muted: '#AAAAAA',
    glassHighlight: 'rgba(255,255,255,0.8)',
    success: '#28A745',
    warning: '#FF9500',
    error: '#DC3545',
    info: '#0A84FF',
  },
  dark: {
    bg: '#000000',
    surface: 'rgba(255,255,255,0.06)',
    stroke: 'rgba(255,255,255,0.12)',
    primary: '#FFFFFF',
    secondary: '#999999',
    muted: '#555555',
    glassHighlight: 'rgba(255,255,255,0.15)',
    success: '#34C759',
    warning: '#FFD60A',
    error: '#FF453A',
    info: '#0A84FF',
  },
};

export interface BackgroundTheme {
  key: string;
  label: string;
  light: string;
  dark: string;
  darkOnly?: boolean;
}

export const BackgroundThemes: BackgroundTheme[] = [
  { key: 'default', label: 'Default', light: '#FFFFFF', dark: '#000000' },
  { key: 'paper', label: 'Paper', light: '#FDFBF7', dark: '#1A1714' },
  { key: 'stone', label: 'Stone', light: '#F0EFED', dark: '#161618' },
  { key: 'sepia', label: 'Sepia', light: '#F5EDDC', dark: '#1D1508' },
  { key: 'midnight', label: 'Midnight', light: '#0A0A12', dark: '#0A0A12', darkOnly: true },
];

export const FontFamilies = {
  sourceSerif: {
    key: 'sourceSerif',
    label: 'Source Serif 4',
    regular: 'SourceSerif4_400Regular',
    semiBold: 'SourceSerif4_600SemiBold',
    bold: 'SourceSerif4_700Bold',
  },
  system: {
    key: 'system',
    label: 'SF Pro Display',
    regular: 'System',
    semiBold: 'System',
    bold: 'System',
  },
  jetBrains: {
    key: 'jetBrains',
    label: 'JetBrains Mono',
    regular: 'JetBrainsMono_400Regular',
    semiBold: 'JetBrainsMono_600SemiBold',
    bold: 'JetBrainsMono_700Bold',
  },
  literata: {
    key: 'literata',
    label: 'Literata',
    regular: 'Literata_400Regular',
    semiBold: 'Literata_600SemiBold',
    bold: 'Literata_700Bold',
  },
} as const;

export type FontFamilyKey = keyof typeof FontFamilies;

export const WordSizeRange = {
  min: 36,
  max: 64,
  default: 48,
} as const;

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
} as const;

export const Springs = {
  default: { damping: 15, stiffness: 150 },
  gentle: { damping: 20, stiffness: 120 },
  bouncy: { damping: 12, stiffness: 180 },
  snappy: { damping: 18, stiffness: 250 },
} as const;

export const GlassStyles = {
  light: {
    fill: 'rgba(0,0,0,0.03)',
    border: 'rgba(0,0,0,0.08)',
    shadowOpacity: 0.08,
    blurIntensity: 30,
  },
  dark: {
    fill: 'rgba(255,255,255,0.06)',
    border: 'rgba(255,255,255,0.12)',
    shadowOpacity: 0.3,
    blurIntensity: 35,
  },
} as const;

export const WordColors = [
  { key: 'default', label: 'Default', color: null },
  { key: 'crimson', label: 'Crimson', color: '#DC3545' },
  { key: 'ocean', label: 'Ocean', color: '#0A84FF' },
  { key: 'forest', label: 'Forest', color: '#28A745' },
  { key: 'amber', label: 'Amber', color: '#FF9500' },
  { key: 'violet', label: 'Violet', color: '#AF52DE' },
] as const;

export type WordColorKey = (typeof WordColors)[number]['key'];
