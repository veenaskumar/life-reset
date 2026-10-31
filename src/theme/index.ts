import { StyleSheet } from 'react-native';

export const colors = {
  background: '#0B0F14',
  surface: '#141A22',
  surfaceAlt: '#1B2330',
  border: '#26303E',
  text: '#F2F5F9',
  textMuted: '#8A94A6',
  textFaint: '#5D6879',
  accent: '#8B7CFF',
  accentDark: '#5B4BD6',
  accentSoft: '#241F3D',
  success: '#5EE6A8',
  successSoft: '#123326',
  warning: '#FFB86B',
  warningSoft: '#33260F',
  danger: '#FF6B81',
  dangerSoft: '#33151C',
  overlay: 'rgba(11, 15, 20, 0.82)',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const radius = {
  sm: 10,
  md: 14,
  lg: 20,
  xl: 28,
  pill: 999,
};

export const typography = StyleSheet.create({
  display: { fontSize: 34, fontWeight: '800', color: colors.text, letterSpacing: -0.5 },
  h1: { fontSize: 26, fontWeight: '800', color: colors.text, letterSpacing: -0.3 },
  h2: { fontSize: 20, fontWeight: '700', color: colors.text },
  h3: { fontSize: 16, fontWeight: '700', color: colors.text },
  body: { fontSize: 15, fontWeight: '500', color: colors.text },
  bodyMuted: { fontSize: 15, fontWeight: '500', color: colors.textMuted },
  caption: { fontSize: 12, fontWeight: '600', color: colors.textMuted },
  label: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
  },
});
