import { useColorScheme } from 'react-native';
import { Colors, GlassStyles, BackgroundThemes, type ThemeMode } from '../design/theme';
import { useSettingsStore } from '../lib/store/settings';

export function useTheme() {
  const systemScheme = useColorScheme();
  const { themeMode, backgroundTheme } = useSettingsStore();

  let mode: ThemeMode = themeMode === 'system'
    ? (systemScheme === 'dark' ? 'dark' : 'light')
    : themeMode === 'dark' ? 'dark' : 'light';

  const bgTheme = BackgroundThemes.find((t) => t.key === backgroundTheme) ?? BackgroundThemes[0];

  // Force dark mode for the entire color set when a darkOnly theme is active
  if (bgTheme.darkOnly) {
    mode = 'dark';
  }

  const colors = Colors[mode];
  const glass = GlassStyles[mode];
  const bg = bgTheme.darkOnly ? bgTheme.dark : bgTheme[mode];

  return {
    mode,
    colors: { ...colors, bg },
    glass,
    isDark: mode === 'dark',
  };
}
