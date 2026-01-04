import { useState, useCallback } from 'react';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { User } from '../types';

WebBrowser.maybeCompleteAuthSession();

const LINE_CHANNEL_ID = process.env.EXPO_PUBLIC_LINE_CHANNEL_ID;

const discovery = {
  authorizationEndpoint: 'https://access.line.me/oauth2/v2.1/authorize',
  tokenEndpoint: 'https://api.line.me/oauth2/v2.1/token',
};

interface LineAuthState {
  isLoading: boolean;
  error: string | null;
}

interface LineAuthResult {
  user: User;
  accessToken: string;
}

interface LineProfile {
  userId: string;
  displayName: string;
  pictureUrl?: string;
}

interface LineTokenResponse {
  access_token: string;
  id_token?: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
}

export function useLineAuth() {
  const [state, setState] = useState<LineAuthState>({
    isLoading: false,
    error: null,
  });

  const redirectUri = AuthSession.makeRedirectUri({
    scheme: 'ourcalendar',
  });

  const signIn = useCallback(async (): Promise<LineAuthResult | null> => {
    if (!LINE_CHANNEL_ID) {
      setState({ isLoading: false, error: 'LINE Channel IDが設定されていません' });
      return null;
    }

    setState({ isLoading: true, error: null });

    try {
      const authRequest = new AuthSession.AuthRequest({
        clientId: LINE_CHANNEL_ID,
        scopes: ['profile', 'openid'],
        redirectUri,
        responseType: AuthSession.ResponseType.Code,
      });

      const result = await authRequest.promptAsync(discovery);

      if (result.type === 'success' && result.params.code) {
        const tokenResponse = await exchangeCodeForToken(
          result.params.code,
          redirectUri
        );

        const profile = await fetchLineProfile(tokenResponse.access_token);

        const user: User = {
          id: `line_${profile.userId}`,
          name: profile.displayName,
          email: '',
          avatarUrl: profile.pictureUrl,
          lineId: profile.userId,
          createdAt: new Date(),
        };

        setState({ isLoading: false, error: null });
        return { user, accessToken: tokenResponse.access_token };
      } else if (result.type === 'cancel') {
        setState({ isLoading: false, error: null });
        return null;
      } else {
        throw new Error('認証に失敗しました');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'LINEログインに失敗しました';
      setState({ isLoading: false, error: message });
      return null;
    }
  }, [redirectUri]);

  const signOut = useCallback(async () => {
    setState({ isLoading: true, error: null });
    try {
      setState({ isLoading: false, error: null });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'ログアウトに失敗しました';
      setState({ isLoading: false, error: message });
    }
  }, []);

  return {
    ...state,
    isReady: !!LINE_CHANNEL_ID,
    signIn,
    signOut,
  };
}

async function exchangeCodeForToken(
  code: string,
  redirectUri: string
): Promise<LineTokenResponse> {
  const LINE_CHANNEL_SECRET = process.env.EXPO_PUBLIC_LINE_CHANNEL_SECRET;

  const response = await fetch('https://api.line.me/oauth2/v2.1/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: redirectUri,
      client_id: LINE_CHANNEL_ID!,
      client_secret: LINE_CHANNEL_SECRET || '',
    }).toString(),
  });

  if (!response.ok) {
    throw new Error('トークン取得に失敗しました');
  }

  return response.json();
}

async function fetchLineProfile(accessToken: string): Promise<LineProfile> {
  const response = await fetch('https://api.line.me/v2/profile', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error('プロフィール取得に失敗しました');
  }

  return response.json();
}
