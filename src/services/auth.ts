import { User } from '../types';

// Auth configuration - These should be set in environment variables
const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || '';
const LINE_CHANNEL_ID = process.env.EXPO_PUBLIC_LINE_CHANNEL_ID || '';

interface AuthResult {
  user: User;
  accessToken: string;
  refreshToken?: string;
}

interface GoogleUserInfo {
  id: string;
  email: string;
  name: string;
  picture?: string;
}

interface LineUserInfo {
  userId: string;
  displayName: string;
  pictureUrl?: string;
}

class AuthService {
  private accessToken: string | null = null;

  // Google Sign In
  async signInWithGoogle(): Promise<AuthResult> {
    // TODO: Implement with expo-auth-session
    // This is a placeholder for the actual implementation

    // 1. Create auth request
    // const discovery = {
    //   authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
    //   tokenEndpoint: 'https://oauth2.googleapis.com/token',
    // };

    // 2. Get authorization code
    // 3. Exchange code for tokens
    // 4. Get user info

    throw new Error('Google Sign In not implemented. Please configure expo-auth-session.');
  }

  // LINE Sign In
  async signInWithLine(): Promise<AuthResult> {
    // TODO: Implement with expo-auth-session
    // This is a placeholder for the actual implementation

    // 1. Create auth request
    // const discovery = {
    //   authorizationEndpoint: 'https://access.line.me/oauth2/v2.1/authorize',
    //   tokenEndpoint: 'https://api.line.me/oauth2/v2.1/token',
    // };

    // 2. Get authorization code
    // 3. Exchange code for tokens
    // 4. Get user info from LINE API

    throw new Error('LINE Sign In not implemented. Please configure expo-auth-session.');
  }

  // Get Google user info
  private async getGoogleUserInfo(accessToken: string): Promise<GoogleUserInfo> {
    const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get Google user info');
    }

    return response.json();
  }

  // Get LINE user info
  private async getLineUserInfo(accessToken: string): Promise<LineUserInfo> {
    const response = await fetch('https://api.line.me/v2/profile', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to get LINE user info');
    }

    return response.json();
  }

  // Transform Google user to app user
  private transformGoogleUser(googleUser: GoogleUserInfo, accessToken: string): AuthResult {
    return {
      user: {
        id: `google_${googleUser.id}`,
        name: googleUser.name,
        email: googleUser.email,
        avatarUrl: googleUser.picture,
        googleId: googleUser.id,
        createdAt: new Date(),
      },
      accessToken,
    };
  }

  // Transform LINE user to app user
  private transformLineUser(lineUser: LineUserInfo, accessToken: string): AuthResult {
    return {
      user: {
        id: `line_${lineUser.userId}`,
        name: lineUser.displayName,
        email: '', // LINE doesn't provide email by default
        avatarUrl: lineUser.pictureUrl,
        lineId: lineUser.userId,
        createdAt: new Date(),
      },
      accessToken,
    };
  }

  // Sign out
  async signOut(): Promise<void> {
    this.accessToken = null;
    // TODO: Clear stored tokens from AsyncStorage
    // TODO: Revoke tokens if needed
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.accessToken !== null;
  }

  // Get current access token
  getAccessToken(): string | null {
    return this.accessToken;
  }

  // Set access token (for restoring session)
  setAccessToken(token: string): void {
    this.accessToken = token;
  }
}

export const authService = new AuthService();
