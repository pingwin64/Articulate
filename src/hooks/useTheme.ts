import { useColorScheme } from 'react-native';
import { Colors, GlassStyles, BackgroundThemes, WindDownColors, type ThemeMode } from '../design/theme';
import { useSettingsStore } from '../lib/store/settings';
import { isLiquidGlassAvailable, isGlassEffectAPIAvailable } from 'expo-glass-effect';

const isLiquidGlass = isLiquidGlassAvailable() && isGlassEffectAPIAvailable();

export function useTheme() {
  const systemScheme = useColorScheme();
  const { themeMode, backgroundTheme, windDownMode } = useSettingsStore();

  let mode: ThemeMode = themeMode === 'system'
    ? (systemScheme === 'dark' ? 'dark' : 'light')
    : themeMode === 'dark' ? 'dark' : 'light';

  const bgTheme = BackgroundThemes.find((t) => t.key === backgroundTheme) ?? BackgroundThemes[0];

  // Force dark mode for the entire color set when a darkOnly theme is active
  if (bgTheme.darkOnly) {
    mode = 'dark';
  }

  const baseColors = Colors[mode];
  const baseGlass = GlassStyles[mode];
  const bg = bgTheme.darkOnly ? bgTheme.dark : bgTheme[mode];

  // Wind-down mode: override colors with warm palette (non-destructive)
  if (windDownMode) {
    const warm = WindDownColors[mode];
    const warmGlass = WindDownColors.glass[mode];
    return {
      mode,
      colors: {
        ...baseColors,
        bg: warm.bg,
        surface: warm.surface,
        stroke: warm.stroke,
        primary: warm.primary,
        secondary: warm.secondary,
        muted: warm.muted,
      },
      glass: { ...baseGlass, fill: warmGlass.fill, border: warmGlass.border },
      isDark: mode === 'dark',
      isLiquidGlass,
      windDownMode: true as const,
    };
  }

  return {
    mode,
    colors: { ...baseColors, bg },
    glass: baseGlass,
    isDark: mode === 'dark',
    isLiquidGlass,
    windDownMode: false as const,
  };
}
