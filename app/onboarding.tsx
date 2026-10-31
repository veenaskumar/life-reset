import React, { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Screen } from '../src/components/Screen';
import { ProgressRing } from '../src/components/ProgressRing';
import { Button } from '../src/components/Button';
import { buildTasks } from '../src/data/programGenerator';
import {
  AREAS,
  INTENSITIES,
  type Area,
  type Intensity,
} from '../src/data/types';
import { useApp } from '../src/store/AppProvider';
import { colors, radius, spacing, typography } from '../src/theme';

const STEPS = 4;

export default function Onboarding() {
  const router = useRouter();
  const { startProgram } = useApp();
  const [step, setStep] = useState(0);
  const [areas, setAreas] = useState<Area[]>(['sleep', 'water', 'exercise', 'mind']);
  const [intensity, setIntensity] = useState<Intensity>('balanced');

  const tasks = useMemo(() => buildTasks(areas, intensity), [areas, intensity]);
  const dailyXp = tasks.reduce((sum, task) => sum + task.xp, 0);

  const toggleArea = (area: Area) => {
    setAreas((prev) =>
      prev.includes(area) ? prev.filter((item) => item !== area) : [...prev, area],
    );
  };

  const next = () => setStep((prev) => Math.min(STEPS - 1, prev + 1));
  const back = () => setStep((prev) => Math.max(0, prev - 1));

  const start = () => {
    startProgram(areas, intensity);
    router.replace('/(tabs)');
  };

  return (
    <Screen contentStyle={styles.screen}>
      <View style={styles.topBar}>
        <Text style={styles.brand}>LIFE RESET</Text>
        <View style={styles.dots}>
          {Array.from({ length: STEPS }).map((_, index) => (
            <View key={index} style={[styles.dot, index <= step && styles.dotActive]} />
          ))}
        </View>
      </View>

      {step === 0 ? (
        <View style={styles.welcome}>
          <ProgressRing size={196} strokeWidth={10} progress={0.66}>
            <Text style={styles.ringNumber}>66</Text>
            <Text style={styles.ringLabel}>DAYS</Text>
          </ProgressRing>
          <View style={styles.welcomeText}>
            <Text style={typography.display}>Reset your life</Text>
            <Text style={styles.subtitle}>
              Small daily quests, visible progress, and a version of you that shows up.
              Build the habits that change everything in 66 days.
            </Text>
          </View>
          <View style={styles.featureRow}>
            <Feature icon="flame-outline" label="Daily streaks" />
            <Feature icon="trending-up-outline" label="XP and levels" />
            <Feature icon="book-outline" label="Journal" />
          </View>
        </View>
      ) : null}

      {step === 1 ? (
        <View style={styles.section}>
          <Text style={typography.h1}>Choose your focus</Text>
          <Text style={styles.subtitle}>
            Pick at least two areas. We will turn each one into a daily quest.
          </Text>
          <View style={styles.grid}>
            {AREAS.map((area) => {
              const selected = areas.includes(area.key);
              return (
                <Pressable
                  key={area.key}
                  onPress={() => toggleArea(area.key)}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  style={[styles.areaCard, selected && styles.areaCardSelected]}
                >
                  <View style={styles.areaHeader}>
                    <View style={[styles.areaIcon, selected && styles.areaIconSelected]}>
                      <Ionicons
                        name={area.icon as keyof typeof Ionicons.glyphMap}
                        size={18}
                        color={selected ? colors.accent : colors.textMuted}
                      />
                    </View>
                    {selected ? (
                      <Ionicons name="checkmark-circle" size={20} color={colors.accent} />
                    ) : null}
                  </View>
                  <Text style={styles.areaLabel}>{area.label}</Text>
                  <Text style={styles.areaDescription}>{area.description}</Text>
                </Pressable>
              );
            })}
          </View>
          <Text style={styles.hint}>{areas.length} of 6 selected</Text>
        </View>
      ) : null}

      {step === 2 ? (
        <View style={styles.section}>
          <Text style={typography.h1}>Set your intensity</Text>
          <Text style={styles.subtitle}>
            You can start gentle and level up whenever you are ready.
          </Text>
          <View style={styles.intensityList}>
            {INTENSITIES.map((option) => {
              const selected = option.key === intensity;
              return (
                <Pressable
                  key={option.key}
                  onPress={() => setIntensity(option.key)}
                  accessibilityRole="button"
                  accessibilityState={{ selected }}
                  style={[styles.intensityCard, selected && styles.intensityCardSelected]}
                >
                  <View style={styles.intensityText}>
                    <Text style={styles.intensityLabel}>{option.label}</Text>
                    <Text style={styles.areaDescription}>{option.description}</Text>
                  </View>
                  <View style={[styles.radio, selected && styles.radioSelected]}>
                    {selected ? <View style={styles.radioDot} /> : null}
                  </View>
                </Pressable>
              );
            })}
          </View>
        </View>
      ) : null}

      {step === 3 ? (
        <View style={styles.section}>
          <Text style={typography.h1}>Your 66-day plan</Text>
          <Text style={styles.subtitle}>
            Here is what a typical day looks like. Complete quests to earn XP and keep
            your streak alive.
          </Text>
          <View style={styles.summaryRow}>
            <Summary value="66" label="days" />
            <Summary value={`${areas.length}`} label="habits" />
            <Summary value={`${dailyXp}`} label="XP / day" />
          </View>
          <View style={styles.previewList}>
            {tasks.map((task) => {
              const area = AREAS.find((item) => item.key === task.area);
              return (
                <View key={task.id} style={styles.previewRow}>
                  <View style={styles.previewIcon}>
                    <Ionicons
                      name={(area?.icon ?? 'ellipse-outline') as keyof typeof Ionicons.glyphMap}
                      size={16}
                      color={colors.accent}
                    />
                  </View>
                  <View style={styles.previewText}>
                    <Text style={styles.previewTitle}>{task.title}</Text>
                    <Text style={styles.areaDescription}>
                      {area?.label} · {task.perWeek} days / week
                    </Text>
                  </View>
                  <Text style={styles.previewXp}>{task.xp} XP</Text>
                </View>
              );
            })}
          </View>
        </View>
      ) : null}

      <View style={styles.footer}>
        {step > 0 ? (
          <Button label="Back" variant="secondary" onPress={back} style={styles.backButton} />
        ) : null}
        {step === 0 ? (
          <Button label="Begin your reset" icon="arrow-forward" onPress={next} style={styles.flex} />
        ) : null}
        {step === 1 ? (
          <Button
            label="Continue"
            icon="arrow-forward"
            onPress={next}
            disabled={areas.length < 2}
            style={styles.flex}
          />
        ) : null}
        {step === 2 ? (
          <Button label="Continue" icon="arrow-forward" onPress={next} style={styles.flex} />
        ) : null}
        {step === 3 ? (
          <Button label="Start my 66 days" icon="sparkles-outline" onPress={start} style={styles.flex} />
        ) : null}
      </View>
    </Screen>
  );
}

function Feature({ icon, label }: { icon: keyof typeof Ionicons.glyphMap; label: string }) {
  return (
    <View style={styles.feature}>
      <Ionicons name={icon} size={18} color={colors.accent} />
      <Text style={styles.featureLabel}>{label}</Text>
    </View>
  );
}

function Summary({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.summary}>
      <Text style={styles.summaryValue}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flexGrow: 1,
    justifyContent: 'space-between',
    gap: spacing.xl,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brand: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 3,
  },
  dots: {
    flexDirection: 'row',
    gap: 6,
  },
  dot: {
    width: 22,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.surfaceAlt,
  },
  dotActive: {
    backgroundColor: colors.accent,
  },
  welcome: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xl,
    paddingVertical: spacing.xl,
  },
  ringNumber: {
    color: colors.text,
    fontSize: 56,
    fontWeight: '800',
    letterSpacing: -2,
  },
  ringLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 3,
  },
  welcomeText: {
    alignItems: 'center',
    gap: spacing.md,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 15,
    fontWeight: '500',
    lineHeight: 22,
  },
  featureRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  feature: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
  },
  featureLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },
  section: {
    flex: 1,
    gap: spacing.md,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  areaCard: {
    width: '47%',
    flexGrow: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.xs,
  },
  areaCardSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.accentSoft,
  },
  areaHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  areaIcon: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceAlt,
  },
  areaIconSelected: {
    backgroundColor: colors.background,
  },
  areaLabel: {
    color: colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  areaDescription: {
    color: colors.textMuted,
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 17,
  },
  hint: {
    color: colors.textFaint,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  intensityList: {
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  intensityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.lg,
  },
  intensityCardSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.accentSoft,
  },
  intensityText: {
    flex: 1,
    gap: 4,
  },
  intensityLabel: {
    color: colors.text,
    fontSize: 16,
    fontWeight: '700',
  },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: colors.accent,
  },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.accent,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  summary: {
    flex: 1,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    gap: 2,
  },
  summaryValue: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
  },
  summaryLabel: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },
  previewList: {
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  previewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  previewIcon: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.accentSoft,
  },
  previewText: {
    flex: 1,
    gap: 2,
  },
  previewTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  previewXp: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: '800',
  },
  footer: {
    flexDirection: 'row',
    gap: spacing.md,
    alignItems: 'center',
  },
  backButton: {
    paddingHorizontal: spacing.lg,
  },
  flex: {
    flex: 1,
  },
});
