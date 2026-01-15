import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps, NavigatorScreenParams } from '@react-navigation/native';

// Root Stack
export type RootStackParamList = {
  Onboarding: undefined;
  Main: NavigatorScreenParams<MainTabParamList>;
};

// Onboarding Stack
export type OnboardingStackParamList = {
  Splash: undefined;
  Login: undefined;
  GoogleConnect: undefined;
  SwipeSort: undefined;
  CreateGroup: undefined;
  InviteMembers: { groupId: string };
  Complete: undefined;
};

// Main Tab Navigator
export type MainTabParamList = {
  Home: undefined;
  Groups: undefined;
  Settings: undefined;
};

// Main Stack (wraps tabs and modal screens)
export type MainStackParamList = {
  Tabs: undefined;
  EventDetail: { eventId: string };
  CreateEvent: { date?: string };
  GroupDetail: { groupId: string };
  JoinGroup: undefined;
  CreateGroup: undefined;
  ProfileEdit: undefined;
  NotificationSettings: undefined;
  ResortEvents: undefined;
};

// Home Stack (nested in Home tab) - keeping for backward compatibility
export type HomeStackParamList = {
  Calendar: undefined;
  EventDetail: { eventId: string };
  CreateEvent: { date?: string };
};

// Screen Props Types
export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

export type OnboardingScreenProps<T extends keyof OnboardingStackParamList> =
  NativeStackScreenProps<OnboardingStackParamList, T>;

export type MainStackScreenProps<T extends keyof MainStackParamList> =
  NativeStackScreenProps<MainStackParamList, T>;

export type MainTabScreenProps<T extends keyof MainTabParamList> =
  CompositeScreenProps<
    BottomTabScreenProps<MainTabParamList, T>,
    NativeStackScreenProps<MainStackParamList>
  >;

// Declare global navigation types
declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
