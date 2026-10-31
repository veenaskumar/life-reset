import { dateKey } from '../utils/date';
import type { Area, Intensity, Program, Task } from './types';

type Template = {
  title: string;
  difficulty: Task['difficulty'];
  perWeek: number;
};

const TEMPLATES: Record<Area, Record<Intensity, Template>> = {
  sleep: {
    gentle: { title: 'Lights out by 11:30pm', difficulty: 'easy', perWeek: 7 },
    balanced: { title: 'Sleep 7+ hours tonight', difficulty: 'medium', perWeek: 7 },
    intense: { title: 'Sleep by 10:30pm and wake at 6:30am', difficulty: 'hard', perWeek: 7 },
  },
  water: {
    gentle: { title: 'Drink 1.5L of water', difficulty: 'easy', perWeek: 7 },
    balanced: { title: 'Drink 2L of water', difficulty: 'medium', perWeek: 7 },
    intense: { title: 'Drink 3L of water', difficulty: 'hard', perWeek: 7 },
  },
  exercise: {
    gentle: { title: 'Take a 10-minute walk', difficulty: 'easy', perWeek: 5 },
    balanced: { title: 'Complete a 30-minute workout', difficulty: 'medium', perWeek: 5 },
    intense: { title: 'Complete a 45-minute workout', difficulty: 'hard', perWeek: 5 },
  },
  mind: {
    gentle: { title: 'Meditate for 5 minutes', difficulty: 'easy', perWeek: 7 },
    balanced: { title: 'Meditate 10 minutes and read 1 page', difficulty: 'medium', perWeek: 7 },
    intense: { title: 'Meditate 20 minutes and read 10 pages', difficulty: 'hard', perWeek: 7 },
  },
  screen: {
    gentle: { title: 'Keep screen time under 3 hours', difficulty: 'easy', perWeek: 7 },
    balanced: { title: 'Keep screen time under 2 hours', difficulty: 'medium', perWeek: 7 },
    intense: { title: 'Keep screen time under 1 hour', difficulty: 'hard', perWeek: 7 },
  },
  shower: {
    gentle: { title: 'Wash your face morning and night', difficulty: 'easy', perWeek: 7 },
    balanced: { title: 'Finish your shower with 30s cold', difficulty: 'medium', perWeek: 7 },
    intense: { title: 'Take a 3-minute cold shower', difficulty: 'hard', perWeek: 7 },
  },
};

const XP_BY_DIFFICULTY: Record<Task['difficulty'], number> = {
  easy: 10,
  medium: 15,
  hard: 20,
};

export function buildTasks(areas: Area[], intensity: Intensity): Task[] {
  return areas.map((area) => {
    const template = TEMPLATES[area][intensity];
    return {
      id: `${area}-${intensity}`,
      title: template.title,
      area,
      difficulty: template.difficulty,
      perWeek: template.perWeek,
      xp: XP_BY_DIFFICULTY[template.difficulty],
    };
  });
}

export function createProgram(areas: Area[], intensity: Intensity): Program {
  const now = new Date();
  return {
    id: `program-${now.getTime()}`,
    startedOn: dateKey(now),
    durationDays: 66,
    areas,
    intensity,
    tasks: buildTasks(areas, intensity),
    createdAt: now.toISOString(),
  };
}
