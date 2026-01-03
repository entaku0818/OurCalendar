import { useState, useCallback } from 'react';
import { User } from '../types';

interface LineAuthState {
  isLoading: boolean;
  error: string | null;
}

interface LineAuthResult {
  user: User;
  accessToken: string;
}

export function useLineAuth() {
  const [state, setState] = useState<LineAuthState>({
    isLoading: false,
    error: null,
  });

  const signIn = useCallback(async (): Promise<LineAuthResult | null> => {
    setState({ isLoading: true, error: null });

    try {
      // TODO: Implement actual LINE Sign In with expo-auth-session
      // For now, return mock data for development

      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Mock successful login
      const mockResult: LineAuthResult = {
        user: {
          id: 'line_789012',
          name: 'LINEユーザー',
          email: '',
          lineId: '789012',
          createdAt: new Date(),
        },
        accessToken: 'mock_line_access_token',
      };

      setState({ isLoading: false, error: null });
      return mockResult;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'LINEログインに失敗しました';
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
