import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { colors, fontSize, spacing, borderRadius } from '../../utils/theme';
import { useGroups, useAuth } from '../../store';
import { MainStackParamList } from '../../navigation/types';

type NavigationProp = NativeStackNavigationProp<MainStackParamList>;

export default function GroupsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { groups, members } = useGroups();
  const { user } = useAuth();

  // Get groups that the current user is a member of
  const userGroups = groups.filter((group) =>
    members.some((m) => m.groupId === group.id && m.userId === user?.id)
  );

  const getMemberCount = (groupId: string) => {
    return members.filter((m) => m.groupId === groupId).length;
  };

  const handleCreateGroup = () => {
    navigation.navigate('CreateGroup');
  };

  const handleJoinGroup = () => {
    navigation.navigate('JoinGroup');
  };

  const handleGroupPress = (groupId: string) => {
    navigation.navigate('GroupDetail', { groupId });
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
        {userGroups.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>グループがありません</Text>
            <Text style={styles.emptyText}>
              グループを作成するか、招待コードで参加しましょう
            </Text>
          </View>
        ) : (
          userGroups.map((group) => (
            <TouchableOpacity
              key={group.id}
              style={styles.groupCard}
              onPress={() => handleGroupPress(group.id)}
            >
              <View style={styles.groupIcon}>
                <Text style={styles.groupIconText}>
                  {group.name.charAt(0)}
                </Text>
              </View>
              <View style={styles.groupInfo}>
                <Text style={styles.groupName}>{group.name}</Text>
                <Text style={styles.memberCount}>
                  {getMemberCount(group.id)}人のメンバー
                </Text>
              </View>
              <Text style={styles.chevron}>›</Text>
            </TouchableOpacity>
          ))
        )}

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
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  emptyText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
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
  chevron: {
    fontSize: fontSize.xl,
    color: colors.textLight,
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
