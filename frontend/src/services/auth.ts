import { User } from '../types';

const GOOGLE_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID || '';

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

class AuthService {
  private accessToken: string | null = null;

  // Google Sign In
  async signInWithGoogle(): Promise<AuthResult> {
    throw new Error('Google Sign In not implemented. Please configure expo-auth-session.');
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

  async signOut(): Promise<void> {
    this.accessToken = null;
  }

  isAuthenticated(): boolean {
    return this.accessToken !== null;
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  setAccessToken(token: string): void {
    this.accessToken = token;
  }
}

export const authService = new AuthService();
