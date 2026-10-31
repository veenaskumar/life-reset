import React, { useMemo, useState } from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../../src/components/Screen';
import { MoodPicker, MOOD_META } from '../../src/components/MoodPicker';
import { Button } from '../../src/components/Button';
import { useApp } from '../../src/store/AppProvider';
import { dateKey, formatLong, formatShort } from '../../src/utils/date';
import type { Mood } from '../../src/data/types';
import { colors, radius, spacing, typography } from '../../src/theme';

export default function JournalScreen() {
  const { state, saveJournal } = useApp();
  const today = dateKey();
  const existing = state.journal[today];

  const [mood, setMood] = useState<Mood>(existing?.mood ?? 3);
  const [text, setText] = useState(existing?.text ?? '');
  const [saved, setSaved] = useState(false);

  const history = useMemo(
    () =>
      Object.values(state.journal)
        .filter((entry) => entry.date !== today)
        .sort((a, b) => (a.date < b.date ? 1 : -1)),
    [state.journal, today],
  );

  const handleSave = () => {
    saveJournal(today, mood, text);
    setSaved(true);
    setTimeout(() => setSaved(false), 2200);
  };

  const changed = text.trim() !== (existing?.text ?? '') || mood !== (existing?.mood ?? 3);

  return (
    <Screen>
      <View style={styles.header}>
        <Text style={typography.h1}>Journal</Text>
        <Text style={styles.subtitle}>{formatLong(today)}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>How are you feeling?</Text>
        <MoodPicker
          value={mood}
          onChange={(next) => {
            setMood(next);
            setSaved(false);
          }}
        />
        <TextInput
          value={text}
          onChangeText={(next) => {
            setText(next);
            setSaved(false);
          }}
          placeholder="What happened today? What are you proud of? What will you do better tomorrow?"
          placeholderTextColor={colors.textFaint}
          multiline
          textAlignVertical="top"
          style={styles.input}
        />
        <View style={styles.saveRow}>
          <Text style={styles.savedText}>
            {saved ? 'Saved to your journal' : changed ? 'Unsaved changes' : ' '}
          </Text>
          <Button
            label="Save entry"
            icon="save-outline"
            onPress={handleSave}
            disabled={!text.trim()}
            style={styles.saveButton}
          />
        </View>
      </View>

      <View style={styles.historyHeader}>
        <Text style={styles.cardTitle}>Previous entries</Text>
        <Text style={styles.historyCount}>{history.length}</Text>
      </View>

      {history.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="book-outline" size={28} color={colors.textFaint} />
          <Text style={styles.emptyText}>
            Your past reflections will collect here. One honest line a day is enough.
          </Text>
        </View>
      ) : (
        <View style={styles.historyList}>
          {history.map((entry) => {
            const meta = MOOD_META.find((item) => item.value === entry.mood);
            return (
              <View key={entry.date} style={styles.historyCard}>
                <View style={styles.historyTop}>
                  <View style={styles.historyDate}>
                    <View style={[styles.moodDot, { backgroundColor: meta?.color ?? colors.accent }]} />
                    <Text style={styles.historyDateText}>{formatShort(entry.date)}</Text>
                  </View>
                  <Text style={[styles.moodLabel, { color: meta?.color ?? colors.textMuted }]}>
                    {meta?.label}
                  </Text>
                </View>
                <Text style={styles.historyText}>{entry.text}</Text>
              </View>
            );
          })}
        </View>
      )}
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
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.lg,
  },
  cardTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  input: {
    minHeight: 132,
    backgroundColor: colors.background,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 22,
    padding: spacing.md,
  },
  saveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  savedText: {
    flex: 1,
    color: colors.success,
    fontSize: 12,
    fontWeight: '600',
  },
  saveButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  historyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  historyCount: {
    color: colors.textFaint,
    fontSize: 12,
    fontWeight: '700',
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
    lineHeight: 19,
  },
  historyList: {
    gap: spacing.sm,
  },
  historyCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  historyTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  historyDate: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  moodDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  historyDateText: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '700',
  },
  moodLabel: {
    fontSize: 11,
    fontWeight: '700',
  },
  historyText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
  },
});
