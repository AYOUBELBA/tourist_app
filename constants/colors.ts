export const lightColors = {
  primary: '#F59E0B',
  secondary: '#EA580C',
  accent: '#14B8A6',
  background: '#F8FAFC',
  surface: '#FFFFFF',
  text: '#0F172A',
  textSecondary: '#64748B',
  border: '#E2E8F0',
  card: '#FFFFFF',
  error: '#EF4444',
  success: '#10B981',
  warning: '#F59E0B',
  info: '#3B82F6',
};

export const darkColors = {
  primary: '#F59E0B',
  secondary: '#EA580C',
  accent: '#14B8A6',
  background: '#0F172A',
  surface: '#1E293B',
  text: '#F8FAFC',
  textSecondary: '#94A3B8',
  border: '#334155',
  card: '#1E293B',
  error: '#EF4444',
  success: '#10B981',
  warning: '#F59E0B',
  info: '#3B82F6',
};

export const getColors = (isDark: boolean) => {
  return isDark ? darkColors : lightColors;
};