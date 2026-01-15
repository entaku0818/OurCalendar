import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { colors, fontSize, spacing, borderRadius } from '../../utils/theme';
import { useEvents } from '../../store';
import { MainStackParamList } from '../../navigation/types';

type RouteProps = RouteProp<MainStackParamList, 'EventDetail'>;

export default function EventDetailScreen() {
  const navigation = useNavigation();
  const route = useRoute<RouteProps>();
  const { events, deleteEvent, toggleShared } = useEvents();

  const { eventId } = route.params;
  const event = events.find((e) => e.id === eventId);

  if (!event) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>← 戻る</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.notFound}>
          <Text style={styles.notFoundText}>予定が見つかりません</Text>
        </View>
      </SafeAreaView>
    );
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    });
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ja-JP', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleDelete = () => {
    Alert.alert(
      '予定を削除',
      'この予定を削除してもよろしいですか？',
      [
        { text: 'キャンセル', style: 'cancel' },
        {
          text: '削除',
          style: 'destructive',
          onPress: () => {
            deleteEvent(eventId);
            navigation.goBack();
          },
        },
      ]
    );
  };

  const handleToggleShare = () => {
    toggleShared(eventId);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← 戻る</Text>
        </TouchableOpacity>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content}>
        <View style={styles.titleSection}>
          <Text style={styles.title}>{event.title}</Text>
          <View style={styles.badges}>
            {event.isFromGoogle && (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Google</Text>
              </View>
            )}
            <View
              style={[
                styles.badge,
                event.isShared ? styles.sharedBadge : styles.privateBadge,
              ]}
            >
              <Text style={styles.badgeText}>
                {event.isShared ? '共有中' : '非公開'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.icon}>📅</Text>
            <View>
              <Text style={styles.dateText}>{formatDate(event.startAt)}</Text>
              <Text style={styles.timeText}>
                {formatTime(event.startAt)} - {formatTime(event.endAt)}
              </Text>
            </View>
          </View>
        </View>

        {event.memo && (
          <View style={styles.section}>
            <View style={styles.row}>
              <Text style={styles.icon}>📝</Text>
              <Text style={styles.memoText}>{event.memo}</Text>
            </View>
          </View>
        )}

        <View style={styles.section}>
          <TouchableOpacity style={styles.actionRow} onPress={handleToggleShare}>
            <Text style={styles.icon}>
              {event.isShared ? '🔓' : '🔒'}
            </Text>
            <Text style={styles.actionText}>
              {event.isShared ? '非公開にする' : 'グループに共有する'}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Text style={styles.deleteButtonText}>予定を削除</Text>
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
  titleSection: {
    backgroundColor: colors.background,
    padding: spacing.lg,
    marginBottom: spacing.md,
  },
  title: {
    fontSize: fontSize.xl,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.md,
  },
  badges: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  badge: {
    backgroundColor: colors.backgroundSecondary,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  sharedBadge: {
    backgroundColor: colors.success + '20',
  },
  privateBadge: {
    backgroundColor: colors.textLight + '20',
  },
  badgeText: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
  },
  section: {
    backgroundColor: colors.background,
    marginBottom: spacing.md,
    padding: spacing.lg,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  icon: {
    fontSize: fontSize.lg,
  },
  dateText: {
    fontSize: fontSize.md,
    color: colors.text,
    marginBottom: spacing.xs,
  },
  timeText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  memoText: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.text,
    lineHeight: 24,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  actionText: {
    fontSize: fontSize.md,
    color: colors.primary,
  },
  deleteButton: {
    backgroundColor: colors.background,
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
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
