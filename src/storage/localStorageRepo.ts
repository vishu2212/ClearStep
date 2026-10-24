import { AppStore, AppStoreSchema } from '../domain/types';
import { getInitialSeedData } from './seedData';

export const STORAGE_KEY = 'clearstep_v1_store';

export interface StorageLoadResult {
  store: AppStore;
  recoveredFromCorrupt: boolean;
  backupKey?: string;
}

/**
 * Loads the application store from localStorage with strict Zod validation.
 * If data is corrupted or fails validation, creates a timestamped backup
 * and safely initializes with default seed data without crashing.
 */
export function loadFromLocalStorage(): StorageLoadResult {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = getInitialSeedData();
      saveToLocalStorage(initial);
      return { store: initial, recoveredFromCorrupt: false };
    }

    const parsedJson = JSON.parse(raw);
    const result = AppStoreSchema.safeParse(parsedJson);

    if (result.success) {
      return { store: result.data, recoveredFromCorrupt: false };
    } else {
      // Validation failed: save backup
      const backupKey = `clearstep_backup_${Date.now()}`;
      try {
        localStorage.setItem(backupKey, raw);
      } catch (backupErr) {
        console.error('Failed to write backup snapshot:', backupErr);
      }

      console.warn('Storage schema validation failed. Backed up corrupted data to:', backupKey, result.error);
      const fallback = getInitialSeedData();
      saveToLocalStorage(fallback);
      return { store: fallback, recoveredFromCorrupt: true, backupKey };
    }
  } catch (err) {
    // JSON syntax error or storage access error
    const backupKey = `clearstep_backup_${Date.now()}`;
    try {
      const raw = localStorage.getItem(STORAGE_KEY) || '';
      localStorage.setItem(backupKey, raw);
    } catch {
      // Ignore secondary error
    }

    console.warn('LocalStorage parse error. Backed up to:', backupKey, err);
    const fallback = getInitialSeedData();
    saveToLocalStorage(fallback);
    return { store: fallback, recoveredFromCorrupt: true, backupKey };
  }
}

/**
 * Persists the application store to localStorage
 */
export function saveToLocalStorage(store: AppStore): void {
  try {
    store.lastUpdated = new Date().toISOString();
    const serialized = JSON.stringify(store);
    localStorage.setItem(STORAGE_KEY, serialized);
  } catch (err) {
    console.error('Failed to save to localStorage:', err);
  }
}

/**
 * Exports current store as a formatted JSON string
 */
export function exportBackupJson(store: AppStore): string {
  return JSON.stringify(store, null, 2);
}

/**
 * Validates and imports a JSON backup string
 */
export function importBackupJson(rawJson: string): { success: boolean; store?: AppStore; error?: string } {
  try {
    const parsed = JSON.parse(rawJson);
    const result = AppStoreSchema.safeParse(parsed);
    if (!result.success) {
      return {
        success: false,
        error: `Invalid backup format: ${result.error.issues.map((i) => i.message).join(', ')}`,
      };
    }
    saveToLocalStorage(result.data);
    return { success: true, store: result.data };
  } catch {
    return { success: false, error: 'The provided file is not valid JSON.' };
  }
}
