import type { Completion, Program, Task } from '../data/types';
import { daysBetween } from './date';

function hashString(value: string): number {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash << 5) - hash + value.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function isScheduled(task: Task, program: Program, key: string): boolean {
  if (task.perWeek >= 7) return true;
  const offset = daysBetween(program.startedOn, key);
  const weekday = ((offset % 7) + 7) % 7;
  return (weekday + (hashString(task.id) % 7)) % 7 < task.perWeek;
}

export function tasksForDate(program: Program, key: string): Task[] {
  return program.tasks.filter((task) => isScheduled(task, program, key));
}

export function completionKey(date: string, taskId: string): string {
  return `${date}:${taskId}`;
}

export function completionFor(
  completions: Record<string, Completion>,
  date: string,
  taskId: string,
): Completion | undefined {
  return completions[completionKey(date, taskId)];
}

export function programDay(program: Program, key: string): number {
  return daysBetween(program.startedOn, key) + 1;
}

export function isProgramFinished(program: Program, key: string): boolean {
  return programDay(program, key) > program.durationDays;
}
