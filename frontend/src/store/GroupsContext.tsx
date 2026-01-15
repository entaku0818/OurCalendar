import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Group, GroupMember } from '../types';
import { storageService } from '../services';

interface GroupsContextType {
  groups: Group[];
  members: GroupMember[];
  isLoading: boolean;
  createGroup: (name: string, userId: string) => Promise<Group>;
  joinGroup: (inviteCode: string, userId: string) => Promise<Group | null>;
  leaveGroup: (groupId: string, userId: string) => void;
  deleteGroup: (groupId: string) => void;
  getGroupById: (id: string) => Group | undefined;
  getMembersForGroup: (groupId: string) => GroupMember[];
  removeMember: (groupId: string, userId: string) => void;
}

const GroupsContext = createContext<GroupsContextType | undefined>(undefined);

const generateId = () => Math.random().toString(36).substr(2, 9);
const generateInviteCode = () => Math.random().toString(36).substr(2, 6).toUpperCase();

export function GroupsProvider({ children }: { children: React.ReactNode }) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load from storage on mount
  useEffect(() => {
    const loadGroups = async () => {
      try {
        const savedGroups = await storageService.getGroups();
        if (savedGroups) {
          setGroups(savedGroups);
        }
        // Load members from a separate key
        const savedMembers = await storageService.getGroupMembers();
        if (savedMembers) {
          setMembers(savedMembers);
        }
      } catch (error) {
        console.error('Failed to load groups:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadGroups();
  }, []);

  // Save to storage when groups change
  useEffect(() => {
    if (!isLoading) {
      storageService.setGroups(groups);
    }
  }, [groups, isLoading]);

  // Save members when they change
  useEffect(() => {
    if (!isLoading) {
      storageService.setGroupMembers(members);
    }
  }, [members, isLoading]);

  const createGroup = useCallback(async (name: string, userId: string): Promise<Group> => {
    const newGroup: Group = {
      id: generateId(),
      name,
      inviteCode: generateInviteCode(),
      createdBy: userId,
      createdAt: new Date(),
    };

    const newMember: GroupMember = {
      id: generateId(),
      groupId: newGroup.id,
      userId,
      role: 'admin',
      joinedAt: new Date(),
    };

    setGroups((prev) => [...prev, newGroup]);
    setMembers((prev) => [...prev, newMember]);

    return newGroup;
  }, []);

  const joinGroup = useCallback(async (inviteCode: string, userId: string): Promise<Group | null> => {
    const group = groups.find((g) => g.inviteCode === inviteCode);
    if (!group) {
      return null;
    }

    // Check if already a member
    const alreadyMember = members.some(
      (m) => m.groupId === group.id && m.userId === userId
    );
    if (alreadyMember) {
      return group;
    }

    const newMember: GroupMember = {
      id: generateId(),
      groupId: group.id,
      userId,
      role: 'member',
      joinedAt: new Date(),
    };

    setMembers((prev) => [...prev, newMember]);
    return group;
  }, [groups, members]);

  const leaveGroup = useCallback((groupId: string, userId: string) => {
    setMembers((prev) => prev.filter(
      (m) => !(m.groupId === groupId && m.userId === userId)
    ));
  }, []);

  const deleteGroup = useCallback((groupId: string) => {
    setGroups((prev) => prev.filter((g) => g.id !== groupId));
    setMembers((prev) => prev.filter((m) => m.groupId !== groupId));
  }, []);

  const getGroupById = useCallback((id: string) => {
    return groups.find((g) => g.id === id);
  }, [groups]);

  const getMembersForGroup = useCallback((groupId: string) => {
    return members.filter((m) => m.groupId === groupId);
  }, [members]);

  const removeMember = useCallback((groupId: string, userId: string) => {
    setMembers((prev) => prev.filter(
      (m) => !(m.groupId === groupId && m.userId === userId)
    ));
  }, []);

  return (
    <GroupsContext.Provider
      value={{
        groups,
        members,
        isLoading,
        createGroup,
        joinGroup,
        leaveGroup,
        deleteGroup,
        getGroupById,
        getMembersForGroup,
        removeMember,
      }}
    >
      {children}
    </GroupsContext.Provider>
  );
}

export function useGroups() {
  const context = useContext(GroupsContext);
  if (context === undefined) {
    throw new Error('useGroups must be used within a GroupsProvider');
  }
  return context;
}
