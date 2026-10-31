import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../src/components/Screen';
import { ProgressRing } from '../../src/components/ProgressRing';
import { TaskCard } from '../../src/components/TaskCard';
import { LevelBar } from '../../src/components/LevelBar';
import { useApp } from '../../src/store/AppProvider';
import { dateKey } from '../../src/utils/date';
import { completionFor, isProgramFinished, programDay, tasksForDate } from '../../src/utils/schedule';
import { buildStats, xpForCompletions } from '../../src/utils/stats';
import { levelInfo } from '../../src/utils/xp';
import { colors, radius, spacing, typography } from '../../src/theme';
import type { TaskStatus } from '../../src/data/types';

type Filter = 'todo' | 'done' | 'skipped';

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'todo', label: 'To-dos' },
  { key: 'done', label: 'Done' },
  { key: 'skipped', label: 'Skipped' },
];

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function HomeScreen() {
  const router = useRouter();
  const { state, completeTask, skipTask } = useApp();
  const [filter, setFilter] = useState<Filter>('todo');

  const today = dateKey();
  const program = state.program;

  const tasks = useMemo(
    () => (program ? tasksForDate(program, today) : []),
    [program, today],
  );

  const stats = useMemo(() => buildStats(state, today), [state, today]);
  const totalXp = useMemo(() => xpForCompletions(state.completions), [state.completions]);
  const level = useMemo(() => levelInfo(totalXp), [totalXp]);

  if (!program) {
    return <Redirect href="/onboarding" />;
  }

  const day = programDay(program, today);
  const finished = isProgramFinished(program, today);
  const dayShown = Math.min(day, program.durationDays);

  const done = tasks.filter(
    (task) => completionFor(state.completions, today, task.id)?.status === 'done',
  ).length;
  const skipped = tasks.filter(
    (task) => completionFor(state.completions, today, task.id)?.status === 'skipped',
  ).length;
  const remaining = tasks.length - done - skipped;
  const progress = tasks.length === 0 ? 0 : done / tasks.length;

  const counts: Record<Filter, number> = {
    todo: remaining,
    done,
    skipped,
  };

  const filtered = tasks.filter((task) => {
    const status = completionFor(state.completions, today, task.id)?.status;
    if (filter === 'todo') return !status;
    return status === filter;
  });

  const heroTitle = finished
    ? 'Your reset is complete'
    : done === tasks.length && tasks.length > 0
      ? 'Perfect day cleared'
      : remaining === 0
        ? 'All quests handled'
        : `${remaining} ${remaining === 1 ? 'quest' : 'quests'} left`;

  const heroMessage = finished
    ? 'Sixty-six days of showing up. That is a different you.'
    : done === 0
      ? 'Start with one small win and let momentum do the rest.'
      : done === tasks.length
        ? 'Every quest done. Keep the streak alive tomorrow.'
        : 'You are building momentum. Finish strong.';

  return (
    <Screen>
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={typography.label}>Day {dayShown} of {program.durationDays}</Text>
          <Text style={typography.h1}>{greeting()}</Text>
        </View>
        <View style={styles.streakChip}>
          <Ionicons name="flame" size={16} color={colors.warning} />
          <Text style={styles.streakValue}>{stats.currentStreak}</Text>
        </View>
      </View>

      <View style={styles.hero}>
        <ProgressRing size={108} strokeWidth={9} progress={progress}>
          <Text style={styles.heroCount}>
            {done}/{tasks.length}
          </Text>
          <Text style={styles.heroCountLabel}>DONE</Text>
        </ProgressRing>
        <View style={styles.heroBody}>
          <Text style={styles.heroTitle}>{heroTitle}</Text>
          <Text style={styles.heroMessage}>{heroMessage}</Text>
          <LevelBar info={level} />
        </View>
      </View>

      <View style={styles.quickRow}>
        <QuickStat icon="flash-outline" label="Total XP" value={`${totalXp}`} />
        <QuickStat icon="flame-outline" label="Best streak" value={`${stats.bestStreak}d`} />
        <QuickStat icon="checkmark-done-outline" label="Rate" value={`${Math.round(stats.completionRate * 100)}%`} />
      </View>

      {finished ? (
        <View style={styles.finishedCard}>
          <Ionicons name="trophy-outline" size={22} color={colors.warning} />
          <View style={styles.finishedText}>
            <Text style={styles.finishedTitle}>66 days complete</Text>
            <Text style={styles.heroMessage}>
              Head to settings to begin a new reset or keep reflecting in your journal.
            </Text>
          </View>
        </View>
      ) : (
        <>
          <View style={styles.filterRow}>
            {FILTERS.map((item) => {
              const active = filter === item.key;
              return (
                <Pressable
                  key={item.key}
                  onPress={() => setFilter(item.key)}
                  accessibilityRole="button"
                  accessibilityState={{ selected: active }}
                  style={[styles.filter, active && styles.filterActive]}
                >
                  <Text style={[styles.filterLabel, active && styles.filterLabelActive]}>
                    {item.label}
                  </Text>
                  <View style={[styles.filterCount, active && styles.filterCountActive]}>
                    <Text style={[styles.filterCountText, active && styles.filterCountTextActive]}>
                      {counts[item.key]}
                    </Text>
                  </View>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.taskList}>
            {filtered.length === 0 ? (
              <View style={styles.empty}>
                <Ionicons
                  name={filter === 'todo' ? 'checkmark-circle-outline' : 'sparkles-outline'}
                  size={28}
                  color={colors.textFaint}
                />
                <Text style={styles.emptyText}>
                  {filter === 'todo'
                    ? 'Nothing left for today. Enjoy the win.'
                    : filter === 'done'
                      ? 'Completed quests will show up here.'
                      : 'Skipped quests will show up here.'}
                </Text>
              </View>
            ) : (
              filtered.map((task) => {
                const status = completionFor(state.completions, today, task.id)?.status as
                  | TaskStatus
                  | undefined;
                return (
                  <TaskCard
                    key={task.id}
                    task={task}
                    status={status}
                    onComplete={() => completeTask(today, task.id)}
                    onSkip={() => skipTask(today, task.id)}
                  />
                );
              })
            )}
          </View>
        </>
      )}

      <Pressable
        onPress={() => router.navigate('/(tabs)/journal')}
        style={styles.journalNudge}
        accessibilityRole="button"
      >
        <View style={styles.journalIcon}>
          <Ionicons name="book-outline" size={18} color={colors.accent} />
        </View>
        <View style={styles.journalText}>
          <Text style={styles.journalTitle}>
            {state.journal[today] ? 'Today is in your journal' : 'How did today feel?'}
          </Text>
          <Text style={styles.heroMessage}>
            {state.journal[today]
              ? 'Tap to add a few more thoughts.'
              : 'Log your mood and a line or two before the day ends.'}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={18} color={colors.textFaint} />
      </Pressable>
    </Screen>
  );
}

function QuickStat({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.quickStat}>
      <Ionicons name={icon} size={14} color={colors.textMuted} />
      <Text style={styles.quickValue}>{value}</Text>
      <Text style={styles.quickLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  headerText: {
    flex: 1,
    gap: 2,
  },
  streakChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.warningSoft,
    borderRadius: radius.pill,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  streakValue: {
    color: colors.warning,
    fontSize: 14,
    fontWeight: '800',
  },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  heroCount: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  heroCountLabel: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  heroBody: {
    flex: 1,
    gap: spacing.sm,
  },
  heroTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  heroMessage: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 17,
  },
  quickRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  quickStat: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
  },
  quickValue: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  quickLabel: {
    color: colors.textFaint,
    fontSize: 10,
    fontWeight: '600',
  },
  filterRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  filter: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.pill,
    paddingVertical: 9,
  },
  filterActive: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  filterLabel: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
  filterLabelActive: {
    color: colors.background,
  },
  filterCount: {
    minWidth: 20,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
  },
  filterCountActive: {
    backgroundColor: 'rgba(11, 15, 20, 0.22)',
  },
  filterCountText: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '800',
  },
  filterCountTextActive: {
    color: colors.background,
  },
  taskList: {
    gap: spacing.sm,
  },
  empty: {
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xxl,
    paddingHorizontal: spacing.xl,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '500',
    textAlign: 'center',
  },
  finishedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.warningSoft,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 184, 107, 0.35)',
    padding: spacing.lg,
  },
  finishedText: {
    flex: 1,
    gap: 4,
  },
  finishedTitle: {
    color: colors.warning,
    fontSize: 15,
    fontWeight: '800',
  },
  journalNudge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  journalIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accentSoft,
  },
  journalText: {
    flex: 1,
    gap: 3,
  },
  journalTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
});
