import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { asyncStorageAdapter } from '../data/storage/AsyncStorageAdapter';
import { LocalDataSource } from '../data/LocalDataSource';
import { createProgram } from '../data/programGenerator';
import {
  emptyState,
  type AppState,
  type Area,
  type Intensity,
  type JournalEntry,
  type Mood,
} from '../data/types';
import { dateKey } from '../utils/date';
import { completionKey } from '../utils/schedule';
import { colors } from '../theme';

const dataSource = new LocalDataSource(asyncStorageAdapter);

interface AppContextValue {
  state: AppState;
  startProgram: (areas: Area[], intensity: Intensity) => void;
  completeTask: (date: string, taskId: string) => void;
  skipTask: (date: string, taskId: string) => void;
  saveJournal: (date: string, mood: Mood, text: string) => void;
  resetProgram: () => void;
  eraseAll: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AppState | null>(null);
  const hydrated = useRef(false);

  useEffect(() => {
    let active = true;
    dataSource.load().then((loaded) => {
      if (!active) return;
      hydrated.current = true;
      setState(loaded);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!hydrated.current || !state) return;
    void dataSource.save(state);
  }, [state]);

  const startProgram = useCallback((areas: Area[], intensity: Intensity) => {
    const program = createProgram(areas, intensity);
    setState((prev) => ({
      program,
      completions: {},
      journal: prev?.journal ?? {},
    }));
  }, []);

  const completeTask = useCallback((date: string, taskId: string) => {
    setState((prev) => {
      if (!prev?.program) return prev;
      const task = prev.program.tasks.find((item) => item.id === taskId);
      if (!task) return prev;
      const key = completionKey(date, taskId);
      const completions = { ...prev.completions };
      if (completions[key]?.status === 'done') {
        delete completions[key];
      } else {
        completions[key] = {
          id: key,
          date,
          taskId,
          status: 'done',
          xp: task.xp,
          updatedAt: new Date().toISOString(),
        };
      }
      return { ...prev, completions };
    });
  }, []);

  const skipTask = useCallback((date: string, taskId: string) => {
    setState((prev) => {
      if (!prev?.program) return prev;
      const key = completionKey(date, taskId);
      const completions = { ...prev.completions };
      if (completions[key]?.status === 'skipped') {
        delete completions[key];
      } else {
        completions[key] = {
          id: key,
          date,
          taskId,
          status: 'skipped',
          xp: 0,
          updatedAt: new Date().toISOString(),
        };
      }
      return { ...prev, completions };
    });
  }, []);

  const saveJournal = useCallback((date: string, mood: Mood, text: string) => {
    setState((prev) => {
      if (!prev) return prev;
      const journal = { ...prev.journal };
      const trimmed = text.trim();
      if (!trimmed) {
        delete journal[date];
      } else {
        const entry: JournalEntry = {
          date,
          mood,
          text: trimmed,
          updatedAt: new Date().toISOString(),
        };
        journal[date] = entry;
      }
      return { ...prev, journal };
    });
  }, []);

  const resetProgram = useCallback(() => {
    setState((prev) =>
      prev ? { program: null, completions: {}, journal: prev.journal } : prev,
    );
  }, []);

  const eraseAll = useCallback(() => {
    hydrated.current = false;
    void dataSource.clear().then(() => {
      hydrated.current = true;
      setState(emptyState());
    });
  }, []);

  const value = useMemo<AppContextValue | null>(() => {
    if (!state) return null;
    return {
      state,
      startProgram,
      completeTask,
      skipTask,
      saveJournal,
      resetProgram,
      eraseAll,
    };
  }, [state, startProgram, completeTask, skipTask, saveJournal, resetProgram, eraseAll]);

  if (!value) {
    return (
      <View style={styles.loading}>
        <Text style={styles.brand}>LIFE RESET</Text>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppContextValue {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used inside AppProvider');
  }
  return context;
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 16,
  },
  brand: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 4,
  },
});
