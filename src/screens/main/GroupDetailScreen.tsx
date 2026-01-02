import React, { useState } from 'react';
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
import { useNavigation } from '@react-navigation/native';
import { colors, fontSize, spacing, borderRadius } from '../../utils/theme';
import { Group, User, MemberRole } from '../../types';
import { APP_NAME } from '../../utils/constants';

// Mock data
const mockGroup: Group & { members: (User & { role: MemberRole })[] } = {
  id: '1',
  name: '我が家',
  inviteCode: 'ABC123',
  createdBy: 'user1',
  createdAt: new Date(),
  members: [
    { id: 'user1', name: 'パパ', email: 'papa@example.com', createdAt: new Date(), role: 'admin' },
    { id: 'user2', name: 'ママ', email: 'mama@example.com', createdAt: new Date(), role: 'admin' },
    { id: 'user3', name: '太郎', email: 'taro@example.com', createdAt: new Date(), role: 'member' },
  ],
};

export default function GroupDetailScreen() {
  const navigation = useNavigation();
  const [group] = useState(mockGroup);

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
            // TODO: Remove member
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
            // TODO: Leave group
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
            メンバー ({group.members.length}人)
          </Text>
          {group.members.map((member) => (
            <View key={member.id} style={styles.memberRow}>
              <View style={styles.memberAvatar}>
                <Text style={styles.memberAvatarText}>
                  {member.name.charAt(0)}
                </Text>
              </View>
              <View style={styles.memberInfo}>
                <Text style={styles.memberName}>{member.name}</Text>
                <Text style={styles.memberRole}>
                  {member.role === 'admin' ? '管理者' : 'メンバー'}
                </Text>
              </View>
              {member.role !== 'admin' && (
                <TouchableOpacity
                  onPress={() => handleRemoveMember(member.id, member.name)}
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
    marginBottom: spacing.xxl,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  leaveButtonText: {
    fontSize: fontSize.md,
    color: colors.danger,
    fontWeight: '600',
  },
});
