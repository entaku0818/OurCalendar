import { useState, useCallback, useEffect } from 'react';
import { Platform } from 'react-native';
import * as Google from 'expo-auth-session/providers/google';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { User } from '../types';

// Complete auth session for web browser
WebBrowser.maybeCompleteAuthSession();

// Google OAuth Client IDs - Set these in environment variables
const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID;
const GOOGLE_IOS_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
const GOOGLE_ANDROID_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;

// Create redirect URI for iOS native - uses the reversed client ID
// Format: com.googleusercontent.apps.CLIENT_ID_PREFIX:/oauthredirect
const getIosRedirectUri = () => {
  if (!GOOGLE_IOS_CLIENT_ID) return undefined;
  // Extract the part before .apps.googleusercontent.com
  const clientIdPrefix = GOOGLE_IOS_CLIENT_ID.replace('.apps.googleusercontent.com', '');
  return `com.googleusercontent.apps.${clientIdPrefix}:/oauthredirect`;
};

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

  const iosRedirectUri = getIosRedirectUri();

  const [request, response, promptAsync] = Google.useAuthRequest({
    iosClientId: GOOGLE_IOS_CLIENT_ID,
    androidClientId: GOOGLE_ANDROID_CLIENT_ID,
    webClientId: GOOGLE_CLIENT_ID,
    redirectUri: Platform.OS === 'ios' ? iosRedirectUri : undefined,
    scopes: [
      'openid',
      'profile',
      'email',
      'https://www.googleapis.com/auth/calendar.readonly',
      'https://www.googleapis.com/auth/calendar.events',
    ],
  });

  // Debug: Log the redirect URI
  useEffect(() => {
    console.log('========================================');
    console.log('Platform:', Platform.OS);
    console.log('iOS Redirect URI:', iosRedirectUri);
    console.log('Actual Redirect URI:', request?.redirectUri);
    console.log('Add this URI to Google Cloud Console!');
    console.log('========================================');
  }, [request, iosRedirectUri]);

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
      console.log('promptAsync result:', JSON.stringify(result, null, 2));

      if (result?.type === 'success') {
        let accessToken = result.authentication?.accessToken;

        // If we got a code instead of token, exchange it
        if (!accessToken && result.params?.code && request?.codeVerifier) {
          console.log('Exchanging code for token...');
          console.log('redirectUri:', request.redirectUri);
          const tokenResult = await AuthSession.exchangeCodeAsync(
            {
              clientId: GOOGLE_IOS_CLIENT_ID!,
              code: result.params.code,
              redirectUri: request.redirectUri,
              extraParams: {
                code_verifier: request.codeVerifier,
              },
            },
            { tokenEndpoint: 'https://oauth2.googleapis.com/token' }
          );
          accessToken = tokenResult.accessToken;
          console.log('Token exchange successful');
        }

        if (!accessToken) {
          throw new Error('No access token received');
        }

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
      console.error('Google auth error:', error);
      const message = error instanceof Error ? error.message : 'ログインに失敗しました';
      setState({ isLoading: false, error: message });
      return null;
    }
  }, [promptAsync, request]);

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
