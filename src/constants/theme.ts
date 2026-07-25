/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import '@/global.css';

import { Platform } from 'react-native';

export const Colors = {
  light: {
    text: '#0B132B',
    background: '#F8FAFC',
    backgroundElement: '#FFFFFF',
    backgroundSelected: '#E2E8F0',
    textSecondary: '#64748B',
    primary: '#1E40AF',
    primaryLight: '#EFF6FF',
    danger: '#DC2626',
    dangerLight: '#FEF2F2',
    warning: '#D97706',
    warningLight: '#FFFBEB',
    success: '#059669',
    successLight: '#ECFDF5',
    accent: '#3B82F6',
    border: '#E2E8F0',
  },
  dark: {
    text: '#F8FAFC',
    background: '#0A1128',
    backgroundElement: '#111C3C',
    backgroundSelected: '#1C2E5D',
    textSecondary: '#94A3B8',
    primary: '#3B82F6',
    primaryLight: '#1E293B',
    danger: '#EF4444',
    dangerLight: '#450A0A',
    warning: '#F59E0B',
    warningLight: '#451A03',
    success: '#10B981',
    successLight: '#064E3B',
    accent: '#60A5FA',
    border: '#1E293B',
  },
} as const;

export type ThemeColor = keyof typeof Colors.light & keyof typeof Colors.dark;

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: 'var(--font-display)',
    serif: 'var(--font-serif)',
    rounded: 'var(--font-rounded)',
    mono: 'var(--font-mono)',
  },
});

export const Spacing = {
  half: 2,
  one: 4,
  two: 8,
  three: 16,
  four: 24,
  five: 32,
  six: 64,
} as const;

export const BottomTabInset = Platform.select({ ios: 50, android: 80 }) ?? 0;
export const MaxContentWidth = 800;
