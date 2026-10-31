import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../theme';
import type { LevelInfo } from '../utils/xp';

interface LevelBarProps {
  info: LevelInfo;
}

export function LevelBar({ info }: LevelBarProps) {
  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Text style={styles.level}>Level {info.level}</Text>
        <Text style={styles.xp}>
          {info.xpIntoLevel} / {info.xpForNext} XP
        </Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${Math.round(info.progress * 100)}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  level: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '800',
  },
  xp: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },
  track: {
    height: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceAlt,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: radius.pill,
    backgroundColor: colors.accent,
  },
});
