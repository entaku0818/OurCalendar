import { useState, useCallback } from 'react';
import { User } from '../types';

interface GoogleAuthState {
  isLoading: boolean;
  error: string | null;
}

interface GoogleAuthResult {
  user: User;
  accessToken: string;
}

export function useGoogleAuth() {
  const [state, setState] = useState<GoogleAuthState>({
    isLoading: false,
    error: null,
  });

  const signIn = useCallback(async (): Promise<GoogleAuthResult | null> => {
    setState({ isLoading: true, error: null });

    try {
      // TODO: Implement actual Google Sign In with expo-auth-session
      // For now, return mock data for development

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock successful login
      const mockResult: GoogleAuthResult = {
        user: {
          id: 'google_123456',
          name: 'テストユーザー',
          email: 'test@example.com',
          googleId: '123456',
          createdAt: new Date(),
        },
        accessToken: 'mock_access_token',
      };

      setState({ isLoading: false, error: null });
      return mockResult;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'ログインに失敗しました';
      setState({ isLoading: false, error: message });
      return null;
    }
  }, []);

  const signOut = useCallback(async () => {
    setState({ isLoading: true, error: null });

    try {
      // TODO: Implement actual sign out
      await new Promise((resolve) => setTimeout(resolve, 500));
      setState({ isLoading: false, error: null });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'ログアウトに失敗しました';
      setState({ isLoading: false, error: message });
    }
  }, []);

  return {
    ...state,
    signIn,
    signOut,
  };
}
