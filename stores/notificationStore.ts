import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: 'booking' | 'favorite' | 'review' | 'info';
  read: boolean;
  createdAt: Date;
}

interface NotificationState {
  notifications: NotificationItem[];
  enabled: boolean;
  unreadCount: number;
  addNotification: (title: string, message: string, type: 'booking' | 'favorite' | 'review' | 'info') => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  setEnabled: (enabled: boolean) => void;
  loadSettings: () => Promise<void>;
}

export const useNotificationStore = create<NotificationState>((set, get) => ({
  notifications: [],
  enabled: true,
  unreadCount: 0,
  
  addNotification: (title: string, message: string, type: 'booking' | 'favorite' | 'review' | 'info') => {
    const newNotification: NotificationItem = {
      id: Date.now().toString(),
      title,
      message,
      type,
      read: false,
      createdAt: new Date(),
    };
    
    set((state) => ({
      notifications: [newNotification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
    }));
  },
  
  markAsRead: (id: string) => {
    set((state) => {
      const notification = state.notifications.find(n => n.id === id);
      const wasUnread = notification && !notification.read;
      return {
        notifications: state.notifications.map((n) =>
          n.id === id ? { ...n, read: true } : n
        ),
        unreadCount: wasUnread ? state.unreadCount - 1 : state.unreadCount,
      };
    });
  },
  
  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    }));
  },
  
  clearNotifications: () => {
    set({ notifications: [], unreadCount: 0 });
  },
  
  setEnabled: async (enabled: boolean) => {
    await AsyncStorage.setItem('notifications_enabled', JSON.stringify(enabled));
    set({ enabled });
  },
  
  loadSettings: async () => {
    const saved = await AsyncStorage.getItem('notifications_enabled');
    if (saved !== null) {
      set({ enabled: JSON.parse(saved) });
    }
  },
}));