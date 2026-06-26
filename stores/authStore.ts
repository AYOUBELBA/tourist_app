import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';
import { addUser, getUserByEmail } from '../database/database';

interface User {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: 'tourist' | 'vendor';
  interests?: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (data: any) => Promise<boolean>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  login: async (email: string, password: string) => {
    try {
      const user = await getUserByEmail(email);
      
      // Check if user exists and password matches
      if (user && typeof user === 'object' && 'password' in user && user.password === password) {
        const userData: User = {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          role: user.role,
          interests: user.interests,
        };
        await SecureStore.setItemAsync('user', JSON.stringify(userData));
        set({ user: userData, isAuthenticated: true, isLoading: false });
        return true;
      }
      set({ isLoading: false });
      return false;
    } catch (error) {
      console.error('Login error:', error);
      set({ isLoading: false });
      return false;
    }
  },

  register: async (data: any) => {
    try {
      const { firstName, lastName, email, phone, password, role, interests } = data;
      
      // Check if user exists
      const existingUser = await getUserByEmail(email);
      if (existingUser) {
        set({ isLoading: false });
        return false;
      }
      
      // Add user to database
      await addUser(firstName, lastName, email, password, phone || '', role);
      
      // Get the created user
      const newUser = await getUserByEmail(email);
      if (newUser && typeof newUser === 'object') {
        const userData: User = {
          id: newUser.id,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          email: newUser.email,
          phone: newUser.phone,
          role: newUser.role,
          interests: interests || '',
        };
        
        await SecureStore.setItemAsync('user', JSON.stringify(userData));
        set({ user: userData, isAuthenticated: true, isLoading: false });
        return true;
      }
      set({ isLoading: false });
      return false;
    } catch (error) {
      console.error('Registration error:', error);
      set({ isLoading: false });
      return false;
    }
  },

  logout: async () => {
    await SecureStore.deleteItemAsync('user');
    set({ user: null, isAuthenticated: false, isLoading: false });
  },

  loadUser: async () => {
    try {
      const userStr = await SecureStore.getItemAsync('user');
      if (userStr) {
        const user = JSON.parse(userStr) as User;
        set({ user, isAuthenticated: true, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Load user error:', error);
      set({ isLoading: false });
    }
  },
}));