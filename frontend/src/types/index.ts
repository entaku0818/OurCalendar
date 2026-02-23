// User
export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  lineId?: string;
  googleId?: string;
  createdAt: Date;
}

// Group
export interface Group {
  id: string;
  name: string;
  iconUrl?: string;
  inviteCode: string;
  createdBy: string;
  createdAt: Date;
}

// GroupMember
export type MemberRole = 'admin' | 'member';

export interface GroupMember {
  id: string;
  groupId: string;
  userId: string;
  role: MemberRole;
  joinedAt: Date;
}

// Event
export interface CalendarEvent {
  id: string;
  groupId?: string;
  title: string;
  startAt: Date;
  endAt: Date;
  assigneeId?: string;
  memo?: string;
  isFromGoogle: boolean;
  isShared: boolean;
  googleEventId?: string; // Original Google Calendar event ID
  createdBy: string;
  createdAt: Date;
  // Owner info for group events
  ownerName?: string;
  ownerAvatarUrl?: string;
  isOwnEvent?: boolean; // true if this is the current user's event
}

// App State
export type OnboardingStep =
  | 'splash'
  | 'login'
  | 'google-connect'
  | 'swipe-sort'
  | 'create-group'
  | 'invite-members'
  | 'complete';
