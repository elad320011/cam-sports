/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

export const colors = {
  // Base colors
  primary: '#04b5e1',          // Main brand color – buttons, links, highlights
  primaryDark: '#008cff',      // Hover/active state – buttons, tab highlight
  background: '#0c1c2c',       // App background – default dark mode
  cardBackground: '#122637',   // Cards/containers – inner section backgrounds
  cardBackgroundMidLight: '#294155',
  cardBackgroundLight: '#2d475d', // Lighter shade for card gradients
  icons: '#2a4962',

  // Accent colors
  accentCyan: '#31dfff',       // Highlights – onboarding, badges, progress
  accentYellow: '#f4c534',     // Warnings, win/loss badges, attention draws

  // Text colors
  textPrimary: '#ffffff',      // Default text on dark backgrounds
  textSecondary: '#dbd5d5',    // Inactive/placeholder text
  textOnPrimary: '#ffffff',    // Text on primary button backgrounds
  textThird: '#f2e092',

  // Border and UI detail
  borderColor: '#2e3c50',      // Dividers, text input underlines
  shadowColor: 'rgba(0, 0, 0, 0.5)',  // Card shadows, modal depth

  // Status
  success: '#4ade80',          // Optional: team created, invite sent
  error: '#f87171',            // Optional: failed actions, errors
};

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#11181C',
    background: '#fff',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};
