import React, { useMemo } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../src/components/Screen';
import { useApp } from '../../src/store/AppProvider';
import { AREAS, INTENSITIES } from '../../src/data/types';
import { dateKey, formatLong } from '../../src/utils/date';
import { buildStats } from '../../src/utils/stats';
import { levelInfo } from '../../src/utils/xp';
import { colors, radius, spacing, typography } from '../../src/theme';

export default function SettingsScreen() {
  const router = useRouter();
  const { state, resetProgram, eraseAll } = useApp();
  const today = dateKey();
  const stats = useMemo(() => buildStats(state, today), [state, today]);
  const level = useMemo(() => levelInfo(stats.totalXp), [stats.totalXp]);

  const program = state.program;
  const intensity = INTENSITIES.find((item) => item.key === program?.intensity);

  const handleReset = () => {
    Alert.alert(
      'Start a new reset?',
      'Your current program and quest history will be cleared. Your journal entries stay.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Start over',
          style: 'destructive',
          onPress: () => {
            resetProgram();
            router.replace('/onboarding');
          },
        },
      ],
    );
  };

  const handleErase = () => {
    Alert.alert(
      'Erase everything?',
      'This permanently deletes your program, quest history, and journal. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Erase all',
          style: 'destructive',
          onPress: () => {
            eraseAll();
            router.replace('/onboarding');
          },
        },
      ],
    );
  };

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={typography.h1}>Settings</Text>
        <Text style={styles.subtitle}>Your reset, your rules.</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Current program</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{intensity?.label ?? 'Balanced'}</Text>
          </View>
        </View>
        {program ? (
          <>
            <Row icon="calendar-outline" label="Started" value={formatLong(program.startedOn)} />
            <Row icon="hourglass-outline" label="Duration" value={`${program.durationDays} days`} />
            <Row icon="flash-outline" label="Level" value={`${level.level} · ${stats.totalXp} XP`} />
            <View style={styles.areas}>
              {program.areas.map((area) => {
                const meta = AREAS.find((item) => item.key === area);
                return (
                  <View key={area} style={styles.areaChip}>
                    <Ionicons
                      name={(meta?.icon ?? 'ellipse-outline') as keyof typeof Ionicons.glyphMap}
                      size={12}
                      color={colors.accent}
                    />
                    <Text style={styles.areaChipText}>{meta?.label ?? area}</Text>
                  </View>
                );
              })}
            </View>
          </>
        ) : (
          <Text style={styles.subtitle}>No active program.</Text>
        )}
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>How it works</Text>
        <Row icon="sunny-outline" label="Daily quests" value="Complete or skip" />
        <Row icon="flame-outline" label="Streaks" value="Any quest keeps it alive" />
        <Row icon="trending-up-outline" label="XP" value="Earned on completion" />
        <Row icon="cloud-offline-outline" label="Storage" value="On this device" />
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Danger zone</Text>
        <Pressable onPress={handleReset} style={styles.action} accessibilityRole="button">
          <View style={styles.actionIcon}>
            <Ionicons name="refresh-outline" size={18} color={colors.warning} />
          </View>
          <View style={styles.actionText}>
            <Text style={styles.actionLabel}>Start a new reset</Text>
            <Text style={styles.actionHint}>Keeps your journal entries</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textFaint} />
        </Pressable>
        <Pressable onPress={handleErase} style={styles.action} accessibilityRole="button">
          <View style={[styles.actionIcon, styles.actionIconDanger]}>
            <Ionicons name="trash-outline" size={18} color={colors.danger} />
          </View>
          <View style={styles.actionText}>
            <Text style={[styles.actionLabel, styles.dangerText]}>Erase all data</Text>
            <Text style={styles.actionHint}>Program, history, and journal</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.textFaint} />
        </Pressable>
      </View>

      <Text style={styles.footer}>Life Reset · v1.0.0</Text>
    </Screen>
  );
}

function Row({
  icon,
  label,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <View style={styles.row}>
      <View style={styles.rowLabel}>
        <Ionicons name={icon} size={15} color={colors.textMuted} />
        <Text style={styles.rowLabelText}>{label}</Text>
      </View>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
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
  badge: {
    backgroundColor: colors.accentSoft,
    borderRadius: radius.pill,
    paddingVertical: 4,
    paddingHorizontal: 10,
  },
  badgeText: {
    color: colors.accent,
    fontSize: 11,
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  rowLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  rowLabelText: {
    color: colors.textMuted,
    fontSize: 13,
    fontWeight: '500',
  },
  rowValue: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'right',
    flexShrink: 1,
  },
  areas: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    paddingTop: spacing.xs,
  },
  areaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.surfaceAlt,
    borderRadius: radius.pill,
    paddingVertical: 5,
    paddingHorizontal: 9,
  },
  areaChipText: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  actionIcon: {
    width: 36,
    height: 36,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.warningSoft,
  },
  actionIconDanger: {
    backgroundColor: colors.dangerSoft,
  },
  actionText: {
    flex: 1,
    gap: 2,
  },
  actionLabel: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  actionHint: {
    color: colors.textFaint,
    fontSize: 12,
    fontWeight: '500',
  },
  dangerText: {
    color: colors.danger,
  },
  footer: {
    color: colors.textFaint,
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    paddingTop: spacing.sm,
  },
});
