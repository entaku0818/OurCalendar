import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User } from '../types';
import { storageService } from '../services/storage';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isOnboarded: boolean;
  signIn: (user: User, accessToken?: string) => Promise<void>;
  signOut: () => Promise<void>;
  completeOnboarding: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnboarded, setIsOnboarded] = useState(false);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const [savedUser, onboarded] = await Promise.all([
          storageService.getUser(),
          storageService.getIsOnboarded(),
        ]);

        if (savedUser) {
          setUser(savedUser);
        }
        setIsOnboarded(onboarded);
      } catch (error) {
        console.error('Error loading user:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadUser();
  }, []);

  const signIn = useCallback(async (userData: User, accessToken?: string) => {
    setUser(userData);
    await storageService.setUser(userData);
    if (accessToken) {
      await storageService.setAccessToken(accessToken);
    }
  }, []);

  const signOut = useCallback(async () => {
    setUser(null);
    setIsOnboarded(false);
    await storageService.clearAll();
  }, []);

  const completeOnboarding = useCallback(async () => {
    setIsOnboarded(true);
    await storageService.setIsOnboarded(true);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isOnboarded,
        signIn,
        signOut,
        completeOnboarding,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
