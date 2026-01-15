import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { colors, fontSize, spacing, borderRadius } from '../../utils/theme';
import { useGroups, useAuth } from '../../store';
import { MainStackParamList } from '../../navigation/types';
import { APP_NAME } from '../../utils/constants';

type RouteProps = RouteProp<MainStackParamList, 'GroupDetail'>;

export default function GroupDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProps>();
  const { groups, members, removeMember, leaveGroup, deleteGroup } = useGroups();
  const { user } = useAuth();

  const { groupId } = route.params;
  const group = groups.find((g) => g.id === groupId);
  const groupMembers = members.filter((m) => m.groupId === groupId);
  const currentUserMember = groupMembers.find((m) => m.userId === user?.id);
  const isAdmin = currentUserMember?.role === 'admin';

  if (!group) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>← 戻る</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>グループが見つかりません</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${APP_NAME}に参加しませんか？\n招待コード: ${group.inviteCode}`,
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleRemoveMember = (memberId: string, memberName: string) => {
    Alert.alert(
      'メンバーを削除',
      `${memberName}をグループから削除しますか？`,
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '削除',
          style: 'destructive',
          onPress: () => {
            removeMember(groupId, memberId);
          },
        },
      ]
    );
  };

  const handleLeaveGroup = () => {
    Alert.alert(
      'グループを退出',
      'このグループから退出しますか？',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '退出',
          style: 'destructive',
          onPress: () => {
            if (user) {
              leaveGroup(groupId, user.id);
            }
            navigation.goBack();
          },
        },
      ]
    );
  };

  const handleDeleteGroup = () => {
    Alert.alert(
      'グループを削除',
      'このグループを完全に削除しますか？この操作は取り消せません。',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '削除',
          style: 'destructive',
          onPress: () => {
            deleteGroup(groupId);
            navigation.goBack();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← 戻る</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>グループ設定</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.groupHeader}>
          <View style={styles.groupIcon}>
            <Text style={styles.groupIconText}>{group.name.charAt(0)}</Text>
          </View>
          <Text style={styles.groupName}>{group.name}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>招待コード</Text>
          <View style={styles.inviteCodeContainer}>
            <Text style={styles.inviteCode}>{group.inviteCode}</Text>
            <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
              <Text style={styles.shareButtonText}>共有</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            メンバー ({groupMembers.length}人)
          </Text>
          {groupMembers.map((member) => (
            <View key={member.id} style={styles.memberRow}>
              <View style={styles.memberAvatar}>
                <Text style={styles.memberAvatarText}>
                  {member.userId.charAt(0).toUpperCase()}
                </Text>
              </View>
              <View style={styles.memberInfo}>
                <Text style={styles.memberName}>
                  {member.userId === user?.id ? 'あなた' : `ユーザー ${member.userId.slice(0, 4)}`}
                </Text>
                <Text style={styles.memberRole}>
                  {member.role === 'admin' ? '管理者' : 'メンバー'}
                </Text>
              </View>
              {isAdmin && member.role !== 'admin' && member.userId !== user?.id && (
                <TouchableOpacity
                  onPress={() => handleRemoveMember(member.userId, `ユーザー ${member.userId.slice(0, 4)}`)}
                >
                  <Text style={styles.removeButton}>削除</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.leaveButton} onPress={handleLeaveGroup}>
          <Text style={styles.leaveButtonText}>グループを退出</Text>
        </TouchableOpacity>

        {isAdmin && (
          <TouchableOpacity style={styles.deleteButton} onPress={handleDeleteGroup}>
            <Text style={styles.deleteButtonText}>グループを削除</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.backgroundSecondary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.background,
  },
  backButton: {
    fontSize: fontSize.md,
    color: colors.primary,
  },
  headerTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
  },
  notFound: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  notFoundText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  content: {
    flex: 1,
  },
  groupHeader: {
    backgroundColor: colors.background,
    alignItems: 'center',
    padding: spacing.xl,
    marginBottom: spacing.md,
  },
  groupIcon: {
    width: 80,
    height: 80,
    borderRadius: borderRadius.lg,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  groupIconText: {
    fontSize: 36,
    color: colors.background,
    fontWeight: 'bold',
  },
  groupName: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.text,
  },
  section: {
    backgroundColor: colors.background,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.md,
    textTransform: 'uppercase',
  },
  inviteCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  inviteCode: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.primary,
    letterSpacing: 4,
  },
  shareButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  shareButtonText: {
    fontSize: fontSize.sm,
    color: colors.background,
    fontWeight: '600',
  },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  memberAvatarText: {
    fontSize: fontSize.md,
    color: colors.background,
    fontWeight: 'bold',
  },
  memberInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: fontSize.md,
    color: colors.text,
    fontWeight: '500',
  },
  memberRole: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  removeButton: {
    fontSize: fontSize.sm,
    color: colors.danger,
  },
  leaveButton: {
    backgroundColor: colors.background,
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  leaveButtonText: {
    fontSize: fontSize.md,
    color: colors.danger,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: colors.background,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    marginBottom: spacing.xxl,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: fontSize.md,
    color: colors.danger,
    fontWeight: '600',
  },
});
