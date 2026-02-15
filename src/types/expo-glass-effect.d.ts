declare module 'expo-glass-effect' {
  import type { ComponentType } from 'react';
  import type { StyleProp, ViewStyle } from 'react-native';

  export interface GlassViewProps {
    style?: StyleProp<ViewStyle>;
    glassEffectStyle?: 'regular' | 'prominent' | string;
    colorScheme?: 'light' | 'dark';
  }

  export const GlassView: ComponentType<GlassViewProps>;
  export function isLiquidGlassAvailable(): boolean;
  export function isGlassEffectAPIAvailable(): boolean;
}
