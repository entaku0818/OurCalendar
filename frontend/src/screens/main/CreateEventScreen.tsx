import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { colors, fontSize, spacing, borderRadius } from '../../utils/theme';

export default function CreateEventScreen() {
  const navigation = useNavigation();
  const [title, setTitle] = useState('');
  const [memo, setMemo] = useState('');
  const [isShared, setIsShared] = useState(true);
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date(Date.now() + 60 * 60 * 1000));

  const handleSave = () => {
    if (!title.trim()) return;

    // TODO: Save event using EventsContext
    const newEvent = {
      title: title.trim(),
      memo: memo.trim(),
      startAt: startDate,
      endAt: endDate,
      isShared,
      isFromGoogle: false,
      createdBy: 'user',
    };

    console.log('Creating event:', newEvent);
    navigation.goBack();
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.cancelButton}>キャンセル</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>新しい予定</Text>
        <TouchableOpacity onPress={handleSave} disabled={!title.trim()}>
          <Text
            style={[styles.saveButton, !title.trim() && styles.saveButtonDisabled]}
          >
            保存
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.inputGroup}>
          <TextInput
            style={styles.titleInput}
            placeholder="タイトル"
            placeholderTextColor={colors.textLight}
            value={title}
            onChangeText={setTitle}
          />
        </View>

        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.label}>開始</Text>
            <View style={styles.dateTimeContainer}>
              <TouchableOpacity style={styles.dateButton}>
                <Text style={styles.dateText}>{formatDate(startDate)}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.timeButton}>
                <Text style={styles.timeText}>{formatTime(startDate)}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>終了</Text>
            <View style={styles.dateTimeContainer}>
              <TouchableOpacity style={styles.dateButton}>
                <Text style={styles.dateText}>{formatDate(endDate)}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.timeButton}>
                <Text style={styles.timeText}>{formatTime(endDate)}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.row}>
            <View>
              <Text style={styles.label}>グループに共有</Text>
              <Text style={styles.sublabel}>
                {isShared ? 'メンバーに公開されます' : '自分だけに表示されます'}
              </Text>
            </View>
            <Switch
              value={isShared}
              onValueChange={setIsShared}
              trackColor={{ false: colors.border, true: colors.success }}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>メモ</Text>
          <TextInput
            style={styles.memoInput}
            placeholder="メモを追加..."
            placeholderTextColor={colors.textLight}
            value={memo}
            onChangeText={setMemo}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>
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
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  cancelButton: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  headerTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
  },
  saveButton: {
    fontSize: fontSize.md,
    color: colors.primary,
    fontWeight: '600',
  },
  saveButtonDisabled: {
    color: colors.textLight,
  },
  content: {
    flex: 1,
  },
  inputGroup: {
    backgroundColor: colors.backgroundSecondary,
    marginTop: spacing.md,
  },
  titleInput: {
    fontSize: fontSize.lg,
    color: colors.text,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  section: {
    backgroundColor: colors.backgroundSecondary,
    marginTop: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  sectionLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  label: {
    fontSize: fontSize.md,
    color: colors.text,
  },
  sublabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  dateButton: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  dateText: {
    fontSize: fontSize.sm,
    color: colors.primary,
  },
  timeButton: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  timeText: {
    fontSize: fontSize.sm,
    color: colors.primary,
  },
  memoInput: {
    fontSize: fontSize.md,
    color: colors.text,
    paddingVertical: spacing.md,
    minHeight: 100,
  },
});
