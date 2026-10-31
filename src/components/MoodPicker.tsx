import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { Mood } from '../data/types';
import { colors, radius, spacing } from '../theme';

export const MOOD_META: { value: Mood; label: string; color: string }[] = [
  { value: 1, label: 'Rough', color: '#FF6B81' },
  { value: 2, label: 'Low', color: '#FF9F6B' },
  { value: 3, label: 'Okay', color: '#FFD166' },
  { value: 4, label: 'Good', color: '#8FD694' },
  { value: 5, label: 'Great', color: '#5EE6A8' },
];

interface MoodPickerProps {
  value: Mood;
  onChange: (mood: Mood) => void;
}

export function MoodPicker({ value, onChange }: MoodPickerProps) {
  return (
    <View style={styles.row}>
      {MOOD_META.map((mood) => {
        const selected = mood.value === value;
        return (
          <Pressable
            key={mood.value}
            onPress={() => onChange(mood.value)}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            style={styles.option}
          >
            <View
              style={[
                styles.dot,
                { borderColor: mood.color },
                selected && { backgroundColor: mood.color },
              ]}
            >
              <Text style={[styles.dotText, selected && styles.dotTextSelected]}>
                {mood.value}
              </Text>
            </View>
            <Text style={[styles.label, selected && { color: mood.color }]}>{mood.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.xs,
  },
  option: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
  },
  dot: {
    width: 42,
    height: 42,
    borderRadius: radius.pill,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dotText: {
    color: colors.textMuted,
    fontSize: 15,
    fontWeight: '800',
  },
  dotTextSelected: {
    color: colors.background,
  },
  label: {
    color: colors.textFaint,
    fontSize: 11,
    fontWeight: '600',
  },
});
