import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fontSize, spacing, borderRadius } from '../../utils/theme';
import { Group, User } from '../../types';

// Mock data
const mockGroups: (Group & { members: User[] })[] = [
  {
    id: '1',
    name: '我が家',
    inviteCode: 'ABC123',
    createdBy: 'user1',
    createdAt: new Date(),
    members: [
      { id: 'user1', name: 'パパ', email: 'papa@example.com', createdAt: new Date() },
      { id: 'user2', name: 'ママ', email: 'mama@example.com', createdAt: new Date() },
      { id: 'user3', name: '太郎', email: 'taro@example.com', createdAt: new Date() },
    ],
  },
];

export default function GroupsScreen() {
  const handleCreateGroup = () => {
    // TODO: Navigate to create group
  };

  const handleJoinGroup = () => {
    // TODO: Show join group modal
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>グループ</Text>
        <TouchableOpacity style={styles.addButton} onPress={handleCreateGroup}>
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        {mockGroups.map((group) => (
          <TouchableOpacity key={group.id} style={styles.groupCard}>
            <View style={styles.groupIcon}>
              <Text style={styles.groupIconText}>
                {group.name.charAt(0)}
              </Text>
            </View>
            <View style={styles.groupInfo}>
              <Text style={styles.groupName}>{group.name}</Text>
              <Text style={styles.memberCount}>
                {group.members.length}人のメンバー
              </Text>
            </View>
            <View style={styles.memberAvatars}>
              {group.members.slice(0, 3).map((member, index) => (
                <View
                  key={member.id}
                  style={[
                    styles.memberAvatar,
                    { marginLeft: index > 0 ? -8 : 0 },
                  ]}
                >
                  <Text style={styles.memberAvatarText}>
                    {member.name.charAt(0)}
                  </Text>
                </View>
              ))}
              {group.members.length > 3 && (
                <View style={[styles.memberAvatar, styles.moreAvatar]}>
                  <Text style={styles.moreAvatarText}>
                    +{group.members.length - 3}
                  </Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        ))}

        <TouchableOpacity style={styles.joinButton} onPress={handleJoinGroup}>
          <Text style={styles.joinButtonText}>招待コードで参加</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.text,
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: fontSize.lg,
    color: colors.background,
    fontWeight: '300',
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
  },
  groupCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundSecondary,
    borderRadius: borderRadius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  groupIcon: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.md,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  groupIconText: {
    fontSize: fontSize.lg,
    color: colors.background,
    fontWeight: 'bold',
  },
  groupInfo: {
    flex: 1,
  },
  groupName: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  memberCount: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  memberAvatars: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  memberAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.backgroundSecondary,
  },
  memberAvatarText: {
    fontSize: fontSize.xs,
    color: colors.background,
    fontWeight: 'bold',
  },
  moreAvatar: {
    backgroundColor: colors.textSecondary,
    marginLeft: -8,
  },
  moreAvatarText: {
    fontSize: 10,
    color: colors.background,
  },
  joinButton: {
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  joinButtonText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
});
