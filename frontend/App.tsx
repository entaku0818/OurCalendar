import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigator } from './src/navigation';
import { AuthProvider, useAuth, EventsProvider, GroupsProvider } from './src/store';
import { Loading } from './src/components';

function AppContent() {
  const { isLoading, isOnboarded } = useAuth();

  if (isLoading) {
    return <Loading fullScreen message="読み込み中..." />;
  }

  return (
    <>
      <RootNavigator isOnboarded={isOnboarded} />
      <StatusBar style="auto" />
    </>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <EventsProvider>
          <GroupsProvider>
            <NavigationContainer>
              <AppContent />
            </NavigationContainer>
          </GroupsProvider>
        </EventsProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
