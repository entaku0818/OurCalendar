import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Switch,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { colors, fontSize, spacing, borderRadius } from '../../utils/theme';
import { useEvents, useAuth } from '../../store';
import { MainStackParamList } from '../../navigation/types';

type RouteProps = RouteProp<MainStackParamList, 'CreateEvent'>;

export default function CreateEventScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProps>();
  const { addEvent } = useEvents();
  const { user } = useAuth();

  const initialDate = route.params?.date ? new Date(route.params.date) : new Date();

  const [title, setTitle] = useState('');
  const [memo, setMemo] = useState('');
  const [isShared, setIsShared] = useState(true);
  const [startDate, setStartDate] = useState(initialDate);
  const [endDate, setEndDate] = useState(new Date(initialDate.getTime() + 60 * 60 * 1000));

  const [showStartDatePicker, setShowStartDatePicker] = useState(false);
  const [showStartTimePicker, setShowStartTimePicker] = useState(false);
  const [showEndDatePicker, setShowEndDatePicker] = useState(false);
  const [showEndTimePicker, setShowEndTimePicker] = useState(false);

  const handleSave = () => {
    if (!title.trim() || !user) return;

    addEvent({
      title: title.trim(),
      memo: memo.trim() || undefined,
      startAt: startDate,
      endAt: endDate,
      isShared,
      isFromGoogle: false,
      createdBy: user.id,
    });

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

  const onStartDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowStartDatePicker(false);
    if (selectedDate) {
      const newDate = new Date(startDate);
      newDate.setFullYear(selectedDate.getFullYear());
      newDate.setMonth(selectedDate.getMonth());
      newDate.setDate(selectedDate.getDate());
      setStartDate(newDate);

      // Update end date if start is after end
      if (newDate > endDate) {
        setEndDate(new Date(newDate.getTime() + 60 * 60 * 1000));
      }
    }
  };

  const onStartTimeChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowStartTimePicker(false);
    if (selectedDate) {
      const newDate = new Date(startDate);
      newDate.setHours(selectedDate.getHours());
      newDate.setMinutes(selectedDate.getMinutes());
      setStartDate(newDate);

      // Update end date if start is after end
      if (newDate >= endDate) {
        setEndDate(new Date(newDate.getTime() + 60 * 60 * 1000));
      }
    }
  };

  const onEndDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowEndDatePicker(false);
    if (selectedDate) {
      const newDate = new Date(endDate);
      newDate.setFullYear(selectedDate.getFullYear());
      newDate.setMonth(selectedDate.getMonth());
      newDate.setDate(selectedDate.getDate());
      if (newDate >= startDate) {
        setEndDate(newDate);
      }
    }
  };

  const onEndTimeChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    setShowEndTimePicker(false);
    if (selectedDate) {
      const newDate = new Date(endDate);
      newDate.setHours(selectedDate.getHours());
      newDate.setMinutes(selectedDate.getMinutes());
      if (newDate > startDate) {
        setEndDate(newDate);
      }
    }
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
            autoFocus
          />
        </View>

        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.label}>開始</Text>
            <View style={styles.dateTimeContainer}>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowStartDatePicker(true)}
              >
                <Text style={styles.dateText}>{formatDate(startDate)}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.timeButton}
                onPress={() => setShowStartTimePicker(true)}
              >
                <Text style={styles.timeText}>{formatTime(startDate)}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>終了</Text>
            <View style={styles.dateTimeContainer}>
              <TouchableOpacity
                style={styles.dateButton}
                onPress={() => setShowEndDatePicker(true)}
              >
                <Text style={styles.dateText}>{formatDate(endDate)}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.timeButton}
                onPress={() => setShowEndTimePicker(true)}
              >
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

      {showStartDatePicker && (
        <DateTimePicker
          value={startDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onStartDateChange}
        />
      )}
      {showStartTimePicker && (
        <DateTimePicker
          value={startDate}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onStartTimeChange}
        />
      )}
      {showEndDatePicker && (
        <DateTimePicker
          value={endDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onEndDateChange}
          minimumDate={startDate}
        />
      )}
      {showEndTimePicker && (
        <DateTimePicker
          value={endDate}
          mode="time"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={onEndTimeChange}
        />
      )}
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
