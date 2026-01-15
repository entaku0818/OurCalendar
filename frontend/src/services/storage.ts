import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, CalendarEvent, Group, GroupMember } from '../types';

// Storage keys
const KEYS = {
  USER: '@user',
  IS_ONBOARDED: '@is_onboarded',
  ACCESS_TOKEN: '@access_token',
  EVENTS: '@events',
  GROUPS: '@groups',
  GROUP_MEMBERS: '@group_members',
  SETTINGS: '@settings',
} as const;

// Settings type
export interface NotificationSettings {
  pushEnabled: boolean;
  eventReminder: boolean;
  newEvent: boolean;
  eventUpdate: boolean;
  memberJoined: boolean;
  dailySummary: boolean;
}

export interface AppSettings {
  notifications: NotificationSettings;
  reminderTime: number; // minutes before event
}

const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
  pushEnabled: true,
  eventReminder: true,
  newEvent: true,
  eventUpdate: true,
  memberJoined: true,
  dailySummary: false,
};

const DEFAULT_SETTINGS: AppSettings = {
  notifications: DEFAULT_NOTIFICATION_SETTINGS,
  reminderTime: 30,
};

class StorageService {
  // User
  async getUser(): Promise<User | null> {
    try {
      const json = await AsyncStorage.getItem(KEYS.USER);
      if (!json) return null;
      const user = JSON.parse(json);
      return {
        ...user,
        createdAt: new Date(user.createdAt),
      };
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  }

  async setUser(user: User): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.USER, JSON.stringify(user));
    } catch (error) {
      console.error('Error setting user:', error);
    }
  }

  async removeUser(): Promise<void> {
    try {
      await AsyncStorage.removeItem(KEYS.USER);
    } catch (error) {
      console.error('Error removing user:', error);
    }
  }

  // Onboarding status
  async getIsOnboarded(): Promise<boolean> {
    try {
      const value = await AsyncStorage.getItem(KEYS.IS_ONBOARDED);
      return value === 'true';
    } catch (error) {
      console.error('Error getting onboarding status:', error);
      return false;
    }
  }

  async setIsOnboarded(value: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.IS_ONBOARDED, value.toString());
    } catch (error) {
      console.error('Error setting onboarding status:', error);
    }
  }

  // Access token
  async getAccessToken(): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(KEYS.ACCESS_TOKEN);
    } catch (error) {
      console.error('Error getting access token:', error);
      return null;
    }
  }

  async setAccessToken(token: string): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.ACCESS_TOKEN, token);
    } catch (error) {
      console.error('Error setting access token:', error);
    }
  }

  async removeAccessToken(): Promise<void> {
    try {
      await AsyncStorage.removeItem(KEYS.ACCESS_TOKEN);
    } catch (error) {
      console.error('Error removing access token:', error);
    }
  }

  // Events
  async getEvents(): Promise<CalendarEvent[]> {
    try {
      const json = await AsyncStorage.getItem(KEYS.EVENTS);
      if (!json) return [];
      const events = JSON.parse(json);
      return events.map((event: CalendarEvent) => ({
        ...event,
        startAt: new Date(event.startAt),
        endAt: new Date(event.endAt),
        createdAt: new Date(event.createdAt),
      }));
    } catch (error) {
      console.error('Error getting events:', error);
      return [];
    }
  }

  async setEvents(events: CalendarEvent[]): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.EVENTS, JSON.stringify(events));
    } catch (error) {
      console.error('Error setting events:', error);
    }
  }

  // Groups
  async getGroups(): Promise<Group[]> {
    try {
      const json = await AsyncStorage.getItem(KEYS.GROUPS);
      if (!json) return [];
      const groups = JSON.parse(json);
      return groups.map((group: Group) => ({
        ...group,
        createdAt: new Date(group.createdAt),
      }));
    } catch (error) {
      console.error('Error getting groups:', error);
      return [];
    }
  }

  async setGroups(groups: Group[]): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.GROUPS, JSON.stringify(groups));
    } catch (error) {
      console.error('Error setting groups:', error);
    }
  }

  // Group Members
  async getGroupMembers(): Promise<GroupMember[]> {
    try {
      const json = await AsyncStorage.getItem(KEYS.GROUP_MEMBERS);
      if (!json) return [];
      const members = JSON.parse(json);
      return members.map((member: GroupMember) => ({
        ...member,
        joinedAt: new Date(member.joinedAt),
      }));
    } catch (error) {
      console.error('Error getting group members:', error);
      return [];
    }
  }

  async setGroupMembers(members: GroupMember[]): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.GROUP_MEMBERS, JSON.stringify(members));
    } catch (error) {
      console.error('Error setting group members:', error);
    }
  }

  // Settings
  async getSettings(): Promise<AppSettings> {
    try {
      const json = await AsyncStorage.getItem(KEYS.SETTINGS);
      if (!json) return DEFAULT_SETTINGS;
      return JSON.parse(json);
    } catch (error) {
      console.error('Error getting settings:', error);
      return DEFAULT_SETTINGS;
    }
  }

  async setSettings(settings: AppSettings): Promise<void> {
    try {
      await AsyncStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.error('Error setting settings:', error);
    }
  }

  // Clear all
  async clearAll(): Promise<void> {
    try {
      await AsyncStorage.multiRemove(Object.values(KEYS));
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  }
}

export const storageService = new StorageService();
