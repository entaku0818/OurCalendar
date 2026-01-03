import { useState, useCallback, useEffect } from 'react';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import { User } from '../types';

// Complete auth session for web browser
WebBrowser.maybeCompleteAuthSession();

// Google OAuth Client IDs - Set these in environment variables
const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;
const GOOGLE_IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
const GOOGLE_ANDROID_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;

interface GoogleAuthState {
  isLoading: boolean;
  error: string | null;
}

interface GoogleAuthResult {
  user: User;
  accessToken: string;
}

interface GoogleUserInfo {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

export function useGoogleAuth() {
  const [state, setState] = useState<GoogleAuthState>({
    isLoading: false,
    error: null,
  });

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: GOOGLE_CLIENT_ID,
    iosClientId: GOOGLE_IOS_CLIENT_ID,
    androidClientId: GOOGLE_ANDROID_CLIENT_ID,
    scopes: [
      'openid',
      'profile',
      'email',
      'https://www.googleapis.com/auth/calendar.readonly',
      'https://www.googleapis.com/auth/calendar.events',
    ],
  });

  const fetchUserInfo = async (accessToken: string): Promise<GoogleUserInfo> => {
    const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user info');
    }

    return response.json();
  };

  const signIn = useCallback(async (): Promise<GoogleAuthResult | null> => {
    setState({ isLoading: true, error: null });

    try {
      const result = await promptAsync();

      if (result?.type === 'success' && result.authentication?.accessToken) {
        const accessToken = result.authentication.accessToken;
        const userInfo = await fetchUserInfo(accessToken);

        const user: User = {
          id: `google_${userInfo.id}`,
          name: userInfo.name,
          email: userInfo.email,
          avatarUrl: userInfo.picture,
          googleId: userInfo.id,
          createdAt: new Date(),
        };

        setState({ isLoading: false, error: null });
        return { user, accessToken };
      } else if (result?.type === 'cancel') {
        setState({ isLoading: false, error: null });
        return null;
      } else {
        throw new Error('Authentication failed');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'ログインに失敗しました';
      setState({ isLoading: false, error: message });
      return null;
    }
  }, [promptAsync]);

  const signOut = useCallback(async () => {
    setState({ isLoading: true, error: null });

    try {
      // Clear local state - actual token revocation would be done server-side
      setState({ isLoading: false, error: null });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'ログアウトに失敗しました';
      setState({ isLoading: false, error: message });
    }
  }, []);

  return {
    ...state,
    isReady: !!request,
    signIn,
    signOut,
  };
}
