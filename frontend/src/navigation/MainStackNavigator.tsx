import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { MainStackParamList } from './types';

// Tab Navigator
import MainTabNavigator from './MainTabNavigator';

// Screens
import EventDetailScreen from '../screens/main/EventDetailScreen';
import CreateEventScreen from '../screens/main/CreateEventScreen';
import GroupDetailScreen from '../screens/main/GroupDetailScreen';
import JoinGroupScreen from '../screens/main/JoinGroupScreen';
import CreateGroupScreen from '../screens/main/CreateGroupScreen'; // Main version
import ProfileEditScreen from '../screens/settings/ProfileEditScreen';
import NotificationSettingsScreen from '../screens/settings/NotificationSettingsScreen';
import ResortEventsScreen from '../screens/settings/ResortEventsScreen';

const Stack = createNativeStackNavigator<MainStackParamList>();

export default function MainStackNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Tabs" component={MainTabNavigator} />
      <Stack.Screen
        name="EventDetail"
        component={EventDetailScreen}
        options={{ presentation: 'card' }}
      />
      <Stack.Screen
        name="CreateEvent"
        component={CreateEventScreen}
        options={{ presentation: 'modal' }}
      />
      <Stack.Screen
        name="GroupDetail"
        component={GroupDetailScreen}
        options={{ presentation: 'card' }}
      />
      <Stack.Screen
        name="JoinGroup"
        component={JoinGroupScreen}
        options={{ presentation: 'modal' }}
      />
      <Stack.Screen
        name="CreateGroup"
        component={CreateGroupScreen}
        options={{ presentation: 'modal' }}
      />
      <Stack.Screen
        name="ProfileEdit"
        component={ProfileEditScreen}
        options={{ presentation: 'card' }}
      />
      <Stack.Screen
        name="NotificationSettings"
        component={NotificationSettingsScreen}
        options={{ presentation: 'card' }}
      />
      <Stack.Screen
        name="ResortEvents"
        component={ResortEventsScreen}
        options={{ presentation: 'card' }}
      />
    </Stack.Navigator>
  );
}
