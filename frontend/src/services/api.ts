import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8080/api/v1';

const TOKEN_KEY = '@OurCalendar:token';

class ApiClient {
  private token: string | null = null;

  async init(): Promise<void> {
    this.token = await AsyncStorage.getItem(TOKEN_KEY);
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  // Auth
  async authenticateWithGoogle(idToken: string): Promise<{ user: User; accessToken: string }> {
    const result = await this.request<{ user: User; accessToken: string }>('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ idToken }),
    });

    this.token = result.accessToken;
    await AsyncStorage.setItem(TOKEN_KEY, result.accessToken);
    return result;
  }

  async refreshToken(): Promise<{ user: User; accessToken: string }> {
    if (!this.token) {
      throw new Error('No token to refresh');
    }

    const result = await this.request<{ user: User; accessToken: string }>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ token: this.token }),
    });

    this.token = result.accessToken;
    await AsyncStorage.setItem(TOKEN_KEY, result.accessToken);
    return result;
  }

  async logout(): Promise<void> {
    this.token = null;
    await AsyncStorage.removeItem(TOKEN_KEY);
  }

  isAuthenticated(): boolean {
    return this.token !== null;
  }

  getToken(): string | null {
    return this.token;
  }

  // User
  async getCurrentUser(): Promise<User> {
    return this.request<User>('/users/me');
  }

  async updateUser(data: { name?: string; avatarUrl?: string }): Promise<User> {
    return this.request<User>('/users/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Settings
  async getSettings(): Promise<any> {
    return this.request('/settings');
  }

  async updateSettings(data: {
    pushEnabled?: boolean;
    eventReminder?: boolean;
    reminderMinutes?: number;
  }): Promise<any> {
    return this.request('/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Groups
  async getGroups(): Promise<any[]> {
    return this.request('/groups');
  }

  async createGroup(data: { name: string; iconUrl?: string }): Promise<any> {
    return this.request('/groups', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getGroup(id: string): Promise<any> {
    return this.request(`/groups/${id}`);
  }

  async updateGroup(id: string, data: { name?: string; iconUrl?: string }): Promise<any> {
    return this.request(`/groups/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteGroup(id: string): Promise<void> {
    return this.request(`/groups/${id}`, { method: 'DELETE' });
  }

  async joinGroup(inviteCode: string): Promise<any> {
    return this.request('/groups/join', {
      method: 'POST',
      body: JSON.stringify({ inviteCode }),
    });
  }

  async leaveGroup(id: string): Promise<void> {
    return this.request(`/groups/${id}/leave`, { method: 'POST' });
  }

  async removeMember(groupId: string, userId: string): Promise<void> {
    return this.request(`/groups/${groupId}/members/${userId}`, { method: 'DELETE' });
  }

  // Events
  async getEvents(params?: {
    groupId?: string;
    startDate?: string;
    endDate?: string;
    sharedOnly?: boolean;
  }): Promise<any[]> {
    const query = new URLSearchParams();
    if (params?.groupId) query.append('groupId', params.groupId);
    if (params?.startDate) query.append('startDate', params.startDate);
    if (params?.endDate) query.append('endDate', params.endDate);
    if (params?.sharedOnly) query.append('sharedOnly', 'true');

    const queryString = query.toString();
    return this.request(`/events${queryString ? `?${queryString}` : ''}`);
  }

  async createEvent(data: {
    title: string;
    startAt: string;
    endAt: string;
    memo?: string;
    groupId?: string;
    assigneeId?: string;
    isShared?: boolean;
    isFromGoogle?: boolean;
    googleEventId?: string;
  }): Promise<any> {
    return this.request('/events', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getEvent(id: string): Promise<any> {
    return this.request(`/events/${id}`);
  }

  async updateEvent(
    id: string,
    data: {
      title?: string;
      startAt?: string;
      endAt?: string;
      memo?: string;
      assigneeId?: string;
      isShared?: boolean;
    }
  ): Promise<any> {
    return this.request(`/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteEvent(id: string): Promise<void> {
    return this.request(`/events/${id}`, { method: 'DELETE' });
  }
}

export const apiClient = new ApiClient();
