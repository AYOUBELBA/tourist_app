import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { translations as allTranslations } from '../constants/translations';

interface LanguageState {
  language: string;
  isLoading: boolean;
  setLanguage: (lang: string) => Promise<void>;
  t: (key: string) => string;
  loadLanguage: () => Promise<void>;
}

export const useLanguageStore = create<LanguageState>((set, get) => ({
  language: 'fr',
  isLoading: true,
  
  setLanguage: async (lang: string) => {
    console.log('Setting language to:', lang); // Debug log
    await AsyncStorage.setItem('app_language', lang);
    set({ language: lang });
    console.log('Language saved, new state:', lang); // Debug log
  },
  
  t: (key: string) => {
    const { language } = get();
    const translation = allTranslations[language]?.[key];
    if (translation) {
      return translation;
    }
    // Fallback to English then French then key
    const englishFallback = allTranslations['en']?.[key];
    if (englishFallback) return englishFallback;
    const frenchFallback = allTranslations['fr']?.[key];
    if (frenchFallback) return frenchFallback;
    console.log(`Missing translation for key: ${key} in language: ${language}`);
    return key;
  },
  
  loadLanguage: async () => {
    const savedLang = await AsyncStorage.getItem('app_language');
    console.log('Loading saved language:', savedLang); // Debug log
    if (savedLang && allTranslations[savedLang]) {
      set({ language: savedLang, isLoading: false });
    } else {
      set({ language: 'fr', isLoading: false });
    }
    console.log('Language loaded:', get().language); // Debug log
  },
}));