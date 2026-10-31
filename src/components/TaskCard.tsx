import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { AREAS, type Task, type TaskStatus } from '../data/types';
import { colors, radius, spacing } from '../theme';

interface TaskCardProps {
  task: Task;
  status?: TaskStatus;
  onComplete: () => void;
  onSkip: () => void;
}

export function TaskCard({ task, status, onComplete, onSkip }: TaskCardProps) {
  const area = AREAS.find((item) => item.key === task.area);
  const done = status === 'done';
  const skipped = status === 'skipped';

  const handleComplete = () => {
    void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onComplete();
  };

  const handleSkip = () => {
    void Haptics.selectionAsync().catch(() => {});
    onSkip();
  };

  return (
    <View style={[styles.card, done && styles.cardDone, skipped && styles.cardSkipped]}>
      <Pressable
        onPress={handleComplete}
        hitSlop={8}
        accessibilityRole="checkbox"
        accessibilityState={{ checked: done }}
        accessibilityLabel={task.title}
        style={[styles.checkbox, done && styles.checkboxDone]}
      >
        {done ? <Ionicons name="checkmark" size={18} color={colors.background} /> : null}
      </Pressable>

      <View style={styles.body}>
        <Text style={[styles.title, (done || skipped) && styles.titleMuted]}>{task.title}</Text>
        <View style={styles.meta}>
          <Ionicons
            name={(area?.icon ?? 'ellipse-outline') as keyof typeof Ionicons.glyphMap}
            size={12}
            color={colors.textFaint}
          />
          <Text style={styles.metaText}>{area?.label ?? task.area}</Text>
          <Text style={styles.dot}>·</Text>
          <Text style={styles.metaText}>{task.xp} XP</Text>
          {skipped ? (
            <>
              <Text style={styles.dot}>·</Text>
              <Text style={styles.skippedText}>Skipped</Text>
            </>
          ) : null}
        </View>
      </View>

      {!done ? (
        <Pressable onPress={handleSkip} hitSlop={10} style={styles.skipButton}>
          <Text style={styles.skipText}>{skipped ? 'Undo' : 'Skip'}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  cardDone: {
    backgroundColor: colors.successSoft,
    borderColor: 'rgba(94, 230, 168, 0.35)',
  },
  cardSkipped: {
    opacity: 0.65,
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxDone: {
    backgroundColor: colors.success,
    borderColor: colors.success,
  },
  body: {
    flex: 1,
    gap: 4,
  },
  title: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '600',
    lineHeight: 20,
  },
  titleMuted: {
    color: colors.textMuted,
    textDecorationLine: 'line-through',
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    color: colors.textFaint,
    fontSize: 12,
    fontWeight: '600',
  },
  dot: {
    color: colors.textFaint,
    fontSize: 12,
  },
  skippedText: {
    color: colors.warning,
    fontSize: 12,
    fontWeight: '600',
  },
  skipButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
  },
  skipText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '700',
  },
});
