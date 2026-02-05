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
    muted: '#757575', // WCAG AA compliant (4.6:1 contrast ratio)
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
    muted: '#8E8E93', // iOS system gray, WCAG AA compliant
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
  // If true, this theme requires Pro subscription (paper, stone, sepia)
  premium?: boolean;
  // If set, this theme is locked until the reward is unlocked via achievements
  rewardId?: string;
  // If true, Pro users can access this reward theme without earning the badge
  proAccessible?: boolean;
}

export const BackgroundThemes: BackgroundTheme[] = [
  { key: 'default', label: 'Default', light: '#FFFFFF', dark: '#000000' },
  { key: 'black', label: 'Black', light: '#000000', dark: '#000000', darkOnly: true },
  { key: 'charcoal', label: 'Charcoal', light: '#1C1C1E', dark: '#1C1C1E', darkOnly: true },
  { key: 'slate', label: 'Slate', light: '#2C3E50', dark: '#2C3E50', darkOnly: true },
  { key: 'paper', label: 'Paper', light: '#FDFBF7', dark: '#1A1714', premium: true },
  { key: 'stone', label: 'Stone', light: '#F0EFED', dark: '#161618', premium: true },
  { key: 'sepia', label: 'Sepia', light: '#F5EDDC', dark: '#1D1508', premium: true },
  { key: 'cream', label: 'Cream', light: '#FFFDD0', dark: '#1A1914', premium: true },
  // Reward themes - unlocked via achievements
  { key: 'midnight', label: 'Midnight', light: '#0A0A12', dark: '#0A0A12', darkOnly: true, rewardId: 'streak-30-theme', proAccessible: true },
  { key: 'aurora', label: 'Aurora', light: '#0D1B2A', dark: '#0D1B2A', darkOnly: true, rewardId: 'streak-100-theme' },
  { key: 'legendary', label: 'Legendary', light: '#1A0A2E', dark: '#1A0A2E', darkOnly: true, rewardId: 'streak-365-theme' },
  // Reward themes - unlocked via non-streak achievements
  { key: 'ember', label: 'Ember', light: '#1C1210', dark: '#1C1210', darkOnly: true, rewardId: 'words-50k-theme' },
  { key: 'master', label: 'Master', light: '#0F1419', dark: '#0F1419', darkOnly: true, rewardId: 'master-theme' },
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

// Apple HIG touch target minimum
export const HitTargets = {
  minimum: 44, // 44pt minimum touch target
  hitSlop: 12, // Standard hitSlop for small elements
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
  { key: 'white', label: 'White', color: '#FFFFFF' },
  { key: 'cream', label: 'Cream', color: '#F5F5DC' },
  { key: 'crimson', label: 'Crimson', color: '#DC3545' },
  { key: 'ocean', label: 'Ocean', color: '#0A84FF' },
  { key: 'forest', label: 'Forest', color: '#28A745' },
  { key: 'amber', label: 'Amber', color: '#FF9500' },
  { key: 'violet', label: 'Violet', color: '#AF52DE' },
  { key: 'slate', label: 'Slate', color: '#64748B' },
  { key: 'charcoal', label: 'Charcoal', color: '#36454F' },
  { key: 'graphite', label: 'Graphite', color: '#2C2C2C' },
  // Reward colors - unlocked via achievements
  { key: 'scholar-ink', label: 'Scholar Ink', color: '#1B4332', rewardId: 'quiz-scholar-color' },
  { key: 'depth', label: 'Depth', color: '#4A0E4E', rewardId: 'texts-100-color' },
  { key: 'dawn', label: 'Dawn', color: '#C4651A', rewardId: 'challenge-10-color' },
] as const;

export type WordColorKey = (typeof WordColors)[number]['key'];
