import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors, fontSize, spacing, borderRadius } from '../../utils/theme';
import { useGroups, useAuth } from '../../store';

export default function CreateGroupScreen() {
  const navigation = useNavigation();
  const { createGroup } = useGroups();
  const { user } = useAuth();
  const [groupName, setGroupName] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleCreate = async () => {
    if (groupName.trim() && user) {
      setIsLoading(true);
      try {
        await createGroup(groupName.trim(), user.id);
        navigation.goBack();
      } catch (error) {
        console.error('Failed to create group:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.cancelButton}>キャンセル</Text>
        </TouchableOpacity>
        <Text style={styles.title}>グループを作成</Text>
        <View style={{ width: 80 }} />
      </View>

      <View style={styles.content}>
        <TextInput
          style={styles.input}
          placeholder="グループ名を入力"
          placeholderTextColor={colors.textLight}
          value={groupName}
          onChangeText={setGroupName}
          autoFocus
        />

        <View style={styles.suggestions}>
          <Text style={styles.suggestionsTitle}>おすすめ:</Text>
          {['我が家', '家族', 'ファミリー'].map((name) => (
            <TouchableOpacity
              key={name}
              style={styles.suggestionChip}
              onPress={() => setGroupName(name)}
            >
              <Text style={styles.suggestionText}>{name}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.createButton, (!groupName.trim() || isLoading) && styles.createButtonDisabled]}
          onPress={handleCreate}
          disabled={!groupName.trim() || isLoading}
        >
          <Text style={styles.createButtonText}>
            {isLoading ? '作成中...' : 'グループを作成'}
          </Text>
        </TouchableOpacity>
      </View>
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
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  cancelButton: {
    fontSize: fontSize.md,
    color: colors.primary,
  },
  title: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    fontSize: fontSize.md,
    color: colors.text,
    marginBottom: spacing.lg,
  },
  suggestions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: spacing.sm,
  },
  suggestionsTitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginRight: spacing.sm,
  },
  suggestionChip: {
    backgroundColor: colors.backgroundSecondary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.full,
  },
  suggestionText: {
    fontSize: fontSize.sm,
    color: colors.text,
  },
  buttonContainer: {
    padding: spacing.lg,
  },
  createButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  createButtonDisabled: {
    backgroundColor: colors.textLight,
  },
  createButtonText: {
    fontSize: fontSize.md,
    color: colors.background,
    fontWeight: '600',
  },
});
