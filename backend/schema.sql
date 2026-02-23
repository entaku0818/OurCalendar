-- OurCalendar Database Schema for Supabase
-- Run this SQL in Supabase SQL Editor to create all tables

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  google_id VARCHAR(255) UNIQUE,
  line_id VARCHAR(255) UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Groups table
CREATE TABLE IF NOT EXISTS groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  icon_url TEXT,
  invite_code VARCHAR(6) UNIQUE NOT NULL,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_groups_invite_code ON groups(invite_code);
CREATE INDEX IF NOT EXISTS idx_groups_created_by ON groups(created_by);

-- Group members table
CREATE TABLE IF NOT EXISTS group_members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('admin', 'member')),
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(group_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_group_members_group ON group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user ON group_members(user_id);

-- Events table
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR(255) NOT NULL,
  start_at TIMESTAMPTZ NOT NULL,
  end_at TIMESTAMPTZ NOT NULL,
  memo TEXT,
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  assignee_id UUID REFERENCES users(id),
  created_by UUID REFERENCES users(id),
  is_from_google BOOLEAN DEFAULT FALSE,
  is_shared BOOLEAN DEFAULT FALSE,
  google_event_id VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_events_group ON events(group_id);
CREATE INDEX IF NOT EXISTS idx_events_created_by ON events(created_by);
CREATE INDEX IF NOT EXISTS idx_events_start_at ON events(start_at);
CREATE INDEX IF NOT EXISTS idx_events_assignee ON events(assignee_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_events_google_event_id ON events(google_event_id, created_by) WHERE google_event_id IS NOT NULL;

-- User settings table
CREATE TABLE IF NOT EXISTS user_settings (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  push_enabled BOOLEAN DEFAULT TRUE,
  event_reminder BOOLEAN DEFAULT TRUE,
  reminder_minutes INT DEFAULT 30,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_groups_updated_at ON groups;
CREATE TRIGGER update_groups_updated_at
  BEFORE UPDATE ON groups
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_events_updated_at ON events;
CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_settings_updated_at ON user_settings;
CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies for Supabase
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;

-- Note: Since we're using JWT auth from our backend, we'll use service key
-- which bypasses RLS. These policies are here for direct Supabase client access.

-- Users can read/update their own profile
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid()::text = id::text);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid()::text = id::text);

-- Group members can view groups they belong to
CREATE POLICY "Members can view groups" ON groups
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = groups.id
      AND group_members.user_id::text = auth.uid()::text
    )
  );

-- Users can view their own membership
CREATE POLICY "Users can view memberships" ON group_members
  FOR SELECT USING (user_id::text = auth.uid()::text);

-- Users can view events they created or belong to the group
CREATE POLICY "Users can view events" ON events
  FOR SELECT USING (
    created_by::text = auth.uid()::text
    OR EXISTS (
      SELECT 1 FROM group_members
      WHERE group_members.group_id = events.group_id
      AND group_members.user_id::text = auth.uid()::text
    )
  );

-- Users can manage their own settings
CREATE POLICY "Users can manage settings" ON user_settings
  FOR ALL USING (user_id::text = auth.uid()::text);
