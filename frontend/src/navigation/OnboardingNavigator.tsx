import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { OnboardingStackParamList } from './types';

// Screens
import SplashScreen from '../screens/onboarding/SplashScreen';
import LoginScreen from '../screens/onboarding/LoginScreen';
import GoogleConnectScreen from '../screens/onboarding/GoogleConnectScreen';
import SwipeSortScreen from '../screens/onboarding/SwipeSortScreen';
import CreateGroupScreen from '../screens/onboarding/CreateGroupScreen';
import InviteMembersScreen from '../screens/onboarding/InviteMembersScreen';
import CompleteScreen from '../screens/onboarding/CompleteScreen';

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

export default function OnboardingNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="GoogleConnect" component={GoogleConnectScreen} />
      <Stack.Screen name="SwipeSort" component={SwipeSortScreen} />
      <Stack.Screen name="CreateGroup" component={CreateGroupScreen} />
      <Stack.Screen name="InviteMembers" component={InviteMembersScreen} />
      <Stack.Screen name="Complete" component={CompleteScreen} />
    </Stack.Navigator>
  );
}
