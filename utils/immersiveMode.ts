import { NativeModules, Platform } from 'react-native';

export const enableImmersiveMode = () => {
  if (Platform.OS === 'android') {
    try {
      const { UIManager } = NativeModules;
      if (UIManager.setViewVisibility) {
        // Alternative method using native modules
        const constants = UIManager.getConstants();
        if (constants && constants.FLAG_FULLSCREEN) {
          // Apply fullscreen flags
        }
      }
    } catch (error) {
      console.warn('Immersive mode error:', error);
    }
  }
};