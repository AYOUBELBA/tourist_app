import { create } from 'zustand';

interface User {
  id: number;
  name: string;
  email: string;
}

interface AuthState {
  user: User | null;
  isLoggedIn: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (name: string, email: string, password: string) => Promise<boolean>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoggedIn: false,

  login: async (email: string, password: string) => {
    // For now, simple demo login
    if (email && password) {
      set({ user: { id: 1, name: 'Demo User', email }, isLoggedIn: true });
      return true;
    }
    return false;
  },

  logout: () => {
    set({ user: null, isLoggedIn: false });
  },

  register: async (name: string, email: string, password: string) => {
    // For now, simple demo registration
    if (name && email && password) {
      set({ user: { id: 1, name, email }, isLoggedIn: true });
      return true;
    }
    return false;
  },
}));