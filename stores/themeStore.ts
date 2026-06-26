import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

interface ThemeState {
  isDarkMode: boolean;
  isLoading: boolean;
  toggleTheme: () => Promise<void>;
  setTheme: (isDark: boolean) => Promise<void>;
  loadTheme: () => Promise<void>;
}

export const useThemeStore = create<ThemeState>((set, get) => ({
  isDarkMode: false,
  isLoading: true,
  
  toggleTheme: async () => {
    const newMode = !get().isDarkMode;
    await AsyncStorage.setItem('theme_mode', JSON.stringify(newMode));
    set({ isDarkMode: newMode });
  },
  
  setTheme: async (isDark: boolean) => {
    await AsyncStorage.setItem('theme_mode', JSON.stringify(isDark));
    set({ isDarkMode: isDark });
  },
  
  loadTheme: async () => {
    const savedTheme = await AsyncStorage.getItem('theme_mode');
    if (savedTheme !== null) {
      set({ isDarkMode: JSON.parse(savedTheme), isLoading: false });
    } else {
      set({ isLoading: false });
    }
  },
}));