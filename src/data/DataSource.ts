import type { AppState } from './types';

export interface DataSource {
  load(): Promise<AppState>;
  save(state: AppState): Promise<void>;
  clear(): Promise<void>;
}
