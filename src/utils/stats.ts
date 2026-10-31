import type { AppState, Area, Completion } from '../data/types';
import { addDays, dateKey, daysBetween } from './date';
import { completionFor, programDay, tasksForDate } from './schedule';

export interface DayStat {
  key: string;
  day: number;
  scheduled: number;
  done: number;
  skipped: number;
  missed: number;
  xp: number;
  complete: boolean;
}

export interface AreaStat {
  area: Area;
  done: number;
  total: number;
  rate: number;
}

export interface Stats {
  days: DayStat[];
  totalXp: number;
  doneCount: number;
  skippedCount: number;
  missedCount: number;
  completionRate: number;
  currentStreak: number;
  bestStreak: number;
  daysActive: number;
  perfectDays: number;
  areaStats: AreaStat[];
}

const EMPTY_STATS: Stats = {
  days: [],
  totalXp: 0,
  doneCount: 0,
  skippedCount: 0,
  missedCount: 0,
  completionRate: 0,
  currentStreak: 0,
  bestStreak: 0,
  daysActive: 0,
  perfectDays: 0,
  areaStats: [],
};

export function buildStats(state: AppState, today: string = dateKey()): Stats {
  const program = state.program;
  if (!program) return EMPTY_STATS;

  const lastDay = program.durationDays;
  const elapsed = Math.min(
    lastDay,
    Math.max(1, daysBetween(program.startedOn, today) + 1),
  );

  const days: DayStat[] = [];
  const areaTotals = new Map<Area, { done: number; total: number }>();
  let totalXp = 0;
  let doneCount = 0;
  let skippedCount = 0;
  let missedCount = 0;
  let perfectDays = 0;

  for (let day = 1; day <= elapsed; day += 1) {
    const key = addDays(program.startedOn, day - 1);
    const scheduledTasks = tasksForDate(program, key);
    const isToday = key === today;

    let done = 0;
    let skipped = 0;
    let xp = 0;

    scheduledTasks.forEach((task) => {
      const completion = completionFor(state.completions, key, task.id);
      const totals = areaTotals.get(task.area) ?? { done: 0, total: 0 };
      if (completion?.status === 'done') {
        done += 1;
        xp += completion.xp;
        totals.done += 1;
      } else if (completion?.status === 'skipped') {
        skipped += 1;
      }
      totals.total += 1;
      areaTotals.set(task.area, totals);
    });

    const missed = isToday ? 0 : Math.max(0, scheduledTasks.length - done - skipped);
    const complete = scheduledTasks.length > 0 && done === scheduledTasks.length;

    totalXp += xp;
    doneCount += done;
    skippedCount += skipped;
    missedCount += missed;
    if (complete && !isToday) perfectDays += 1;

    days.push({
      key,
      day,
      scheduled: scheduledTasks.length,
      done,
      skipped,
      missed,
      xp,
      complete,
    });
  }

  const resolved = doneCount + skippedCount + missedCount;
  const completionRate = resolved === 0 ? 0 : doneCount / resolved;

  const dayMap = new Map(days.map((day) => [day.key, day]));
  let currentStreak = 0;
  let cursor = today;
  if ((dayMap.get(cursor)?.done ?? 0) === 0) {
    cursor = addDays(today, -1);
  }
  while (true) {
    const entry = dayMap.get(cursor);
    if (!entry || entry.done === 0) break;
    currentStreak += 1;
    cursor = addDays(cursor, -1);
  }

  let bestStreak = 0;
  let running = 0;
  days.forEach((day) => {
    if (day.done > 0) {
      running += 1;
      bestStreak = Math.max(bestStreak, running);
    } else {
      running = 0;
    }
  });

  const areaStats: AreaStat[] = program.areas.map((area) => {
    const totals = areaTotals.get(area) ?? { done: 0, total: 0 };
    return {
      area,
      done: totals.done,
      total: totals.total,
      rate: totals.total === 0 ? 0 : totals.done / totals.total,
    };
  });

  return {
    days,
    totalXp,
    doneCount,
    skippedCount,
    missedCount,
    completionRate,
    currentStreak,
    bestStreak,
    daysActive: days.filter((day) => day.done > 0).length,
    perfectDays,
    areaStats,
  };
}

export function xpForCompletions(completions: Record<string, Completion>): number {
  return Object.values(completions)
    .filter((completion) => completion.status === 'done')
    .reduce((sum, completion) => sum + completion.xp, 0);
}

export function currentDayNumber(state: AppState, today: string = dateKey()): number {
  if (!state.program) return 0;
  return Math.max(1, programDay(state.program, today));
}
