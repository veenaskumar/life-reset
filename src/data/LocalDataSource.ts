import type { DataSource } from './DataSource';
import type { StorageAdapter } from './storage/StorageAdapter';
import { emptyState, type AppState } from './types';

const STATE_KEY = 'lifereset.state.v1';

export class LocalDataSource implements DataSource {
  constructor(
    private readonly storage: StorageAdapter,
    private readonly key: string = STATE_KEY,
  ) {}

  async load(): Promise<AppState> {
    const raw = await this.storage.getItem(this.key);
    if (!raw) return emptyState();
    try {
      const parsed = JSON.parse(raw) as Partial<AppState>;
      return {
        program: parsed.program ?? null,
        completions: parsed.completions ?? {},
        journal: parsed.journal ?? {},
      };
    } catch {
      return emptyState();
    }
  }

  async save(state: AppState): Promise<void> {
    await this.storage.setItem(this.key, JSON.stringify(state));
  }

  async clear(): Promise<void> {
    await this.storage.removeItem(this.key);
  }
}
