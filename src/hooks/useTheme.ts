import { useColorScheme } from 'react-native';
import { Colors, GlassStyles, BackgroundThemes, type ThemeMode } from '../design/theme';
import { useSettingsStore } from '../lib/store/settings';

export function useTheme() {
  const systemScheme = useColorScheme();
  const { themeMode, backgroundTheme } = useSettingsStore();

  const mode: ThemeMode = themeMode === 'system'
    ? (systemScheme ?? 'light')
    : themeMode === 'dark' ? 'dark' : 'light';

  const colors = Colors[mode];
  const glass = GlassStyles[mode];

  const bgTheme = BackgroundThemes.find((t) => t.key === backgroundTheme) ?? BackgroundThemes[0];
  const bg = bgTheme.darkOnly ? bgTheme.dark : bgTheme[mode];

  return {
    mode,
    colors: { ...colors, bg },
    glass,
    isDark: mode === 'dark',
  };
}
