import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { RootNavigator } from './src/navigation';

export default function App() {
  // TODO: Load from AsyncStorage
  const [isOnboarded, setIsOnboarded] = useState(false);

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <RootNavigator isOnboarded={isOnboarded} />
        <StatusBar style="auto" />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
