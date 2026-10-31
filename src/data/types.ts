export type Area = 'sleep' | 'water' | 'exercise' | 'mind' | 'screen' | 'shower';

export type Intensity = 'gentle' | 'balanced' | 'intense';

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Task {
  id: string;
  title: string;
  area: Area;
  difficulty: Difficulty;
  xp: number;
  perWeek: number;
}

export interface Program {
  id: string;
  startedOn: string;
  durationDays: number;
  areas: Area[];
  intensity: Intensity;
  tasks: Task[];
  createdAt: string;
}

export type TaskStatus = 'done' | 'skipped';

export interface Completion {
  id: string;
  date: string;
  taskId: string;
  status: TaskStatus;
  updatedAt: string;
  xp: number;
}

export type Mood = 1 | 2 | 3 | 4 | 5;

export interface JournalEntry {
  date: string;
  mood: Mood;
  text: string;
  updatedAt: string;
}

export interface AppState {
  program: Program | null;
  completions: Record<string, Completion>;
  journal: Record<string, JournalEntry>;
}

export const AREAS: {
  key: Area;
  label: string;
  description: string;
  icon: string;
}[] = [
  { key: 'sleep', label: 'Sleep', description: 'Wind down and rest deeply', icon: 'moon-outline' },
  { key: 'water', label: 'Water', description: 'Stay hydrated all day', icon: 'water-outline' },
  { key: 'exercise', label: 'Exercise', description: 'Move your body daily', icon: 'barbell-outline' },
  { key: 'mind', label: 'Mind', description: 'Train focus and calm', icon: 'leaf-outline' },
  { key: 'screen', label: 'Screen time', description: 'Reclaim your attention', icon: 'phone-portrait-outline' },
  { key: 'shower', label: 'Shower', description: 'Fresh start, cold finish', icon: 'rainy-outline' },
];

export const INTENSITIES: {
  key: Intensity;
  label: string;
  description: string;
}[] = [
  { key: 'gentle', label: 'Gentle', description: 'Small steps, easy wins' },
  { key: 'balanced', label: 'Balanced', description: 'A steady daily push' },
  { key: 'intense', label: 'Intense', description: 'Push your edges' },
];

export function emptyState(): AppState {
  return { program: null, completions: {}, journal: {} };
}
