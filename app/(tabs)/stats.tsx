import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../src/components/Screen';
import { ProgressRing } from '../../src/components/ProgressRing';
import { StatTile } from '../../src/components/StatTile';
import { LevelBar } from '../../src/components/LevelBar';
import { useApp } from '../../src/store/AppProvider';
import { AREAS } from '../../src/data/types';
import { dateKey, formatWeekday, lastNDays } from '../../src/utils/date';
import { buildStats } from '../../src/utils/stats';
import { levelInfo } from '../../src/utils/xp';
import { colors, radius, spacing, typography } from '../../src/theme';

function heatColor(done: number, scheduled: number): string {
  if (scheduled === 0 || done === 0) return colors.surfaceAlt;
  const ratio = done / scheduled;
  if (ratio >= 1) return colors.success;
  if (ratio >= 0.66) return colors.accent;
  if (ratio >= 0.33) return colors.accentDark;
  return colors.accentSoft;
}

export default function StatsScreen() {
  const { state } = useApp();
  const today = dateKey();
  const stats = useMemo(() => buildStats(state, today), [state, today]);
  const level = useMemo(() => levelInfo(stats.totalXp), [stats.totalXp]);

  const program = state.program;
  if (!program) {
    return (
      <Screen>
        <Text style={typography.h1}>Stats</Text>
        <Text style={styles.subtitle}>Start a reset to see your progress here.</Text>
      </Screen>
    );
  }

  const dayMap = new Map(stats.days.map((day) => [day.key, day]));
  const week = lastNDays(7, today);
  const maxScheduled = Math.max(1, ...week.map((key) => dayMap.get(key)?.scheduled ?? 0));

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={typography.h1}>Stats</Text>
        <Text style={styles.subtitle}>Your consistency, in plain sight.</Text>
      </View>

      <View style={styles.levelCard}>
        <ProgressRing
          size={104}
          strokeWidth={9}
          progress={level.progress}
          color={colors.accent}
        >
          <Text style={styles.levelNumber}>{level.level}</Text>
          <Text style={styles.levelLabel}>LEVEL</Text>
        </ProgressRing>
        <View style={styles.levelBody}>
          <Text style={styles.levelTitle}>{stats.totalXp} total XP</Text>
          <Text style={styles.subtitle}>
            {level.xpForNext - level.xpIntoLevel} XP to level {level.level + 1}
          </Text>
          <LevelBar info={level} />
        </View>
      </View>

      <View style={styles.tileRow}>
        <StatTile
          icon="checkmark-done-outline"
          label="Completion"
          value={`${Math.round(stats.completionRate * 100)}%`}
          tint={colors.success}
        />
        <StatTile
          icon="flame-outline"
          label="Streak"
          value={`${stats.currentStreak}d`}
          tint={colors.warning}
        />
      </View>
      <View style={styles.tileRow}>
        <StatTile icon="trophy-outline" label="Best streak" value={`${stats.bestStreak}d`} />
        <StatTile
          icon="calendar-outline"
          label="Active days"
          value={`${stats.daysActive}`}
          tint={colors.success}
        />
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>66-day map</Text>
          <Text style={styles.cardHint}>{stats.perfectDays} perfect days</Text>
        </View>
        <View style={styles.heatGrid}>
          {Array.from({ length: program.durationDays }).map((_, index) => {
            const day = stats.days[index];
            const future = !day;
            return (
              <View
                key={index}
                style={[
                  styles.heatCell,
                  {
                    backgroundColor: day
                      ? heatColor(day.done, day.scheduled)
                      : colors.surfaceAlt,
                  },
                  future && styles.heatCellFuture,
                  day?.key === today && styles.heatCellToday,
                ]}
              />
            );
          })}
        </View>
        <View style={styles.legend}>
          <Text style={styles.cardHint}>Less</Text>
          <View style={[styles.legendCell, { backgroundColor: colors.surfaceAlt }]} />
          <View style={[styles.legendCell, { backgroundColor: colors.accentSoft }]} />
          <View style={[styles.legendCell, { backgroundColor: colors.accentDark }]} />
          <View style={[styles.legendCell, { backgroundColor: colors.accent }]} />
          <View style={[styles.legendCell, { backgroundColor: colors.success }]} />
          <Text style={styles.cardHint}>More</Text>
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Last 7 days</Text>
          <Text style={styles.cardHint}>quests done</Text>
        </View>
        <View style={styles.barChart}>
          {week.map((key) => {
            const day = dayMap.get(key);
            const done = day?.done ?? 0;
            const scheduled = day?.scheduled ?? 0;
            const height = scheduled === 0 ? 0 : Math.max(4, (done / maxScheduled) * 64);
            return (
              <View key={key} style={styles.barColumn}>
                <Text style={styles.barValue}>{done}</Text>
                <View style={styles.barTrack}>
                  <View
                    style={[
                      styles.barFill,
                      {
                        height,
                        backgroundColor: done === scheduled && scheduled > 0
                          ? colors.success
                          : colors.accent,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.barLabel}>{formatWeekday(key).slice(0, 2)}</Text>
              </View>
            );
          })}
        </View>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>By area</Text>
          <Text style={styles.cardHint}>{program.durationDays} days</Text>
        </View>
        <View style={styles.areaList}>
          {stats.areaStats.map((areaStat) => {
            const area = AREAS.find((item) => item.key === areaStat.area);
            const percent = Math.round(areaStat.rate * 100);
            return (
              <View key={areaStat.area} style={styles.areaRow}>
                <View style={styles.areaHeader}>
                  <View style={styles.areaName}>
                    <Ionicons
                      name={(area?.icon ?? 'ellipse-outline') as keyof typeof Ionicons.glyphMap}
                      size={14}
                      color={colors.textMuted}
                    />
                    <Text style={styles.areaLabel}>{area?.label ?? areaStat.area}</Text>
                  </View>
                  <Text style={styles.areaPercent}>{percent}%</Text>
                </View>
                <View style={styles.areaTrack}>
                  <View style={[styles.areaFill, { width: `${percent}%` }]} />
                </View>
              </View>
            );
          })}
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: 2,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '500',
    lineHeight: 18,
  },
  levelCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
  },
  levelNumber: {
    color: colors.text,
    fontSize: 34,
    fontWeight: '800',
    letterSpacing: -1,
  },
  levelLabel: {
    color: colors.textMuted,
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  levelBody: {
    flex: 1,
    gap: spacing.sm,
  },
  levelTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: '800',
  },
  tileRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cardTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  cardHint: {
    color: colors.textFaint,
    fontSize: 11,
    fontWeight: '600',
  },
  heatGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
  },
  heatCell: {
    width: 22,
    height: 22,
    borderRadius: 6,
  },
  heatCellFuture: {
    opacity: 0.35,
  },
  heatCellToday: {
    borderWidth: 1.5,
    borderColor: colors.text,
  },
  legend: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    justifyContent: 'flex-end',
  },
  legendCell: {
    width: 12,
    height: 12,
    borderRadius: 3,
  },
  barChart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: spacing.sm,
    paddingTop: spacing.sm,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  barValue: {
    color: colors.textMuted,
    fontSize: 10,
    fontWeight: '700',
  },
  barTrack: {
    width: '100%',
    height: 64,
    justifyContent: 'flex-end',
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.sm,
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: radius.sm,
  },
  barLabel: {
    color: colors.textFaint,
    fontSize: 10,
    fontWeight: '700',
  },
  areaList: {
    gap: spacing.md,
  },
  areaRow: {
    gap: 6,
  },
  areaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  areaName: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  areaLabel: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
  },
  areaPercent: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
  areaTrack: {
    height: 6,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceAlt,
    overflow: 'hidden',
  },
  areaFill: {
    height: '100%',
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
  },
});
