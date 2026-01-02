import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isOnboarded: boolean;
  signIn: (user: User) => void;
  signOut: () => void;
  completeOnboarding: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnboarded, setIsOnboarded] = useState(false);

  useEffect(() => {
    // TODO: Load user from AsyncStorage
    const loadUser = async () => {
      try {
        // Simulated loading
        await new Promise((resolve) => setTimeout(resolve, 1000));
        // Check AsyncStorage for existing user
        setIsLoading(false);
      } catch (error) {
        setIsLoading(false);
      }
    };
    loadUser();
  }, []);

  const signIn = (userData: User) => {
    setUser(userData);
    // TODO: Save to AsyncStorage
  };

  const signOut = () => {
    setUser(null);
    setIsOnboarded(false);
    // TODO: Clear AsyncStorage
  };

  const completeOnboarding = () => {
    setIsOnboarded(true);
    // TODO: Save to AsyncStorage
  };

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
