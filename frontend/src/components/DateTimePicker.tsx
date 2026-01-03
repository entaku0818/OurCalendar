import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
} from 'react-native';
import { colors, fontSize, spacing, borderRadius } from '../utils/theme';

interface DateTimePickerProps {
  value: Date;
  onChange: (date: Date) => void;
  mode?: 'date' | 'time' | 'datetime';
  minimumDate?: Date;
  maximumDate?: Date;
}

export default function DateTimePicker({
  value,
  onChange,
  mode = 'datetime',
  minimumDate,
  maximumDate,
}: DateTimePickerProps) {
  const [showDateModal, setShowDateModal] = useState(false);
  const [showTimeModal, setShowTimeModal] = useState(false);
  const [tempDate, setTempDate] = useState(value);

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

  const generateYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear - 5; i <= currentYear + 5; i++) {
      years.push(i);
    }
    return years;
  };

  const generateMonths = () => {
    return Array.from({ length: 12 }, (_, i) => i);
  };

  const generateDays = (year: number, month: number) => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => i + 1);
  };

  const generateHours = () => {
    return Array.from({ length: 24 }, (_, i) => i);
  };

  const generateMinutes = () => {
    return Array.from({ length: 12 }, (_, i) => i * 5);
  };

  const handleDateConfirm = () => {
    onChange(tempDate);
    setShowDateModal(false);
  };

  const handleTimeConfirm = () => {
    onChange(tempDate);
    setShowTimeModal(false);
  };

  const renderDatePicker = () => (
    <Modal visible={showDateModal} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowDateModal(false)}>
              <Text style={styles.cancelText}>キャンセル</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>日付を選択</Text>
            <TouchableOpacity onPress={handleDateConfirm}>
              <Text style={styles.confirmText}>完了</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.pickerContainer}>
            <ScrollView style={styles.pickerColumn}>
              {generateYears().map((year) => (
                <TouchableOpacity
                  key={year}
                  style={[
                    styles.pickerItem,
                    tempDate.getFullYear() === year && styles.pickerItemSelected,
                  ]}
                  onPress={() => {
                    const newDate = new Date(tempDate);
                    newDate.setFullYear(year);
                    setTempDate(newDate);
                  }}
                >
                  <Text
                    style={[
                      styles.pickerItemText,
                      tempDate.getFullYear() === year && styles.pickerItemTextSelected,
                    ]}
                  >
                    {year}年
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <ScrollView style={styles.pickerColumn}>
              {generateMonths().map((month) => (
                <TouchableOpacity
                  key={month}
                  style={[
                    styles.pickerItem,
                    tempDate.getMonth() === month && styles.pickerItemSelected,
                  ]}
                  onPress={() => {
                    const newDate = new Date(tempDate);
                    newDate.setMonth(month);
                    setTempDate(newDate);
                  }}
                >
                  <Text
                    style={[
                      styles.pickerItemText,
                      tempDate.getMonth() === month && styles.pickerItemTextSelected,
                    ]}
                  >
                    {month + 1}月
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <ScrollView style={styles.pickerColumn}>
              {generateDays(tempDate.getFullYear(), tempDate.getMonth()).map((day) => (
                <TouchableOpacity
                  key={day}
                  style={[
                    styles.pickerItem,
                    tempDate.getDate() === day && styles.pickerItemSelected,
                  ]}
                  onPress={() => {
                    const newDate = new Date(tempDate);
                    newDate.setDate(day);
                    setTempDate(newDate);
                  }}
                >
                  <Text
                    style={[
                      styles.pickerItemText,
                      tempDate.getDate() === day && styles.pickerItemTextSelected,
                    ]}
                  >
                    {day}日
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </View>
    </Modal>
  );

  const renderTimePicker = () => (
    <Modal visible={showTimeModal} transparent animationType="slide">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowTimeModal(false)}>
              <Text style={styles.cancelText}>キャンセル</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>時刻を選択</Text>
            <TouchableOpacity onPress={handleTimeConfirm}>
              <Text style={styles.confirmText}>完了</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.pickerContainer}>
            <ScrollView style={styles.pickerColumn}>
              {generateHours().map((hour) => (
                <TouchableOpacity
                  key={hour}
                  style={[
                    styles.pickerItem,
                    tempDate.getHours() === hour && styles.pickerItemSelected,
                  ]}
                  onPress={() => {
                    const newDate = new Date(tempDate);
                    newDate.setHours(hour);
                    setTempDate(newDate);
                  }}
                >
                  <Text
                    style={[
                      styles.pickerItemText,
                      tempDate.getHours() === hour && styles.pickerItemTextSelected,
                    ]}
                  >
                    {hour.toString().padStart(2, '0')}時
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <ScrollView style={styles.pickerColumn}>
              {generateMinutes().map((minute) => (
                <TouchableOpacity
                  key={minute}
                  style={[
                    styles.pickerItem,
                    tempDate.getMinutes() === minute && styles.pickerItemSelected,
                  ]}
                  onPress={() => {
                    const newDate = new Date(tempDate);
                    newDate.setMinutes(minute);
                    setTempDate(newDate);
                  }}
                >
                  <Text
                    style={[
                      styles.pickerItemText,
                      tempDate.getMinutes() === minute && styles.pickerItemTextSelected,
                    ]}
                  >
                    {minute.toString().padStart(2, '0')}分
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      {(mode === 'date' || mode === 'datetime') && (
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            setTempDate(value);
            setShowDateModal(true);
          }}
        >
          <Text style={styles.buttonText}>{formatDate(value)}</Text>
        </TouchableOpacity>
      )}

      {(mode === 'time' || mode === 'datetime') && (
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            setTempDate(value);
            setShowTimeModal(true);
          }}
        >
          <Text style={styles.buttonText}>{formatTime(value)}</Text>
        </TouchableOpacity>
      )}

      {renderDatePicker()}
      {renderTimePicker()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  button: {
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  buttonText: {
    fontSize: fontSize.sm,
    color: colors.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: colors.background,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    paddingBottom: spacing.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  modalTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
  },
  cancelText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  confirmText: {
    fontSize: fontSize.md,
    color: colors.primary,
    fontWeight: '600',
  },
  pickerContainer: {
    flexDirection: 'row',
    height: 200,
  },
  pickerColumn: {
    flex: 1,
  },
  pickerItem: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  pickerItemSelected: {
    backgroundColor: colors.primary + '20',
  },
  pickerItemText: {
    fontSize: fontSize.md,
    color: colors.text,
  },
  pickerItemTextSelected: {
    color: colors.primary,
    fontWeight: '600',
  },
});
