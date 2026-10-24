import { AppStore, AppStoreSchema } from '../domain/types';
import { getInitialSeedData } from './seedData';

export const STORAGE_KEY = 'clearstep_v1_store';

export interface StorageLoadResult {
  store: AppStore;
  recoveredFromCorrupt: boolean;
  backupSuccess: boolean;
  backupKey?: string;
}

export interface StorageSaveResult {
  success: boolean;
  error?: string;
  isQuotaExceeded?: boolean;
}

/**
 * Loads the application store from localStorage with strict Zod validation.
 * If data is corrupted or fails validation, attempts to create a timestamped backup
 * and safely initializes with default seed data without crashing.
 */
export function loadFromLocalStorage(): StorageLoadResult {
  try {
    let raw: string | null = null;
    try {
      raw = localStorage.getItem(STORAGE_KEY);
    } catch (storageErr) {
      console.warn('LocalStorage access blocked by browser security policy:', storageErr);
      const fallback = getInitialSeedData();
      return { store: fallback, recoveredFromCorrupt: true, backupSuccess: false };
    }

    if (!raw) {
      const initial = getInitialSeedData();
      saveToLocalStorage(initial);
      return { store: initial, recoveredFromCorrupt: false, backupSuccess: false };
    }

    let parsedJson: unknown;
    try {
      parsedJson = JSON.parse(raw);
    } catch (parseErr) {
      // JSON syntax error: attempt backup
      const backupKey = `clearstep_backup_${Date.now()}`;
      let backupSuccess = false;
      try {
        localStorage.setItem(backupKey, raw);
        backupSuccess = true;
      } catch (backupErr) {
        console.error('Failed to write backup snapshot on JSON parse error:', backupErr);
      }

      console.warn('LocalStorage parse error. Backed up to:', backupSuccess ? backupKey : 'none', parseErr);
      const fallback = getInitialSeedData();
      saveToLocalStorage(fallback);
      return {
        store: fallback,
        recoveredFromCorrupt: true,
        backupSuccess,
        backupKey: backupSuccess ? backupKey : undefined,
      };
    }

    const result = AppStoreSchema.safeParse(parsedJson);

    if (result.success) {
      return { store: result.data, recoveredFromCorrupt: false, backupSuccess: false };
    } else {
      // Schema validation failed: attempt backup
      const backupKey = `clearstep_backup_${Date.now()}`;
      let backupSuccess = false;
      try {
        localStorage.setItem(backupKey, raw);
        backupSuccess = true;
      } catch (backupErr) {
        console.error('Failed to write backup snapshot on schema failure:', backupErr);
      }

      console.warn('Storage schema validation failed. Backed up corrupted data to:', backupSuccess ? backupKey : 'none', result.error);
      const fallback = getInitialSeedData();
      saveToLocalStorage(fallback);
      return {
        store: fallback,
        recoveredFromCorrupt: true,
        backupSuccess,
        backupKey: backupSuccess ? backupKey : undefined,
      };
    }
  } catch (err) {
    // Unexpected top-level error: ensure application never crashes
    console.error('Unexpected error in loadFromLocalStorage:', err);
    const fallback = getInitialSeedData();
    return { store: fallback, recoveredFromCorrupt: true, backupSuccess: false };
  }
}

/**
 * Persists the application store to localStorage with typed error reporting.
 */
export function saveToLocalStorage(store: AppStore): StorageSaveResult {
  try {
    store.lastUpdated = new Date().toISOString();
    const serialized = JSON.stringify(store);
    localStorage.setItem(STORAGE_KEY, serialized);
    return { success: true };
  } catch (err: unknown) {
    const errObj = typeof err === 'object' && err !== null ? (err as Record<string, unknown>) : {};
    const errName = typeof errObj.name === 'string' ? errObj.name : '';
    const errCode = typeof errObj.code === 'number' ? errObj.code : 0;

    const isQuota =
      errName === 'QuotaExceededError' ||
      errName === 'NS_ERROR_DOM_QUOTA_REACHED' ||
      errCode === 22 ||
      errCode === 1014;

    const errorMessage =
      typeof errObj.message === 'string'
        ? errObj.message
        : err instanceof Error
          ? err.message
          : 'Unknown storage error';

    console.error('Failed to save to localStorage:', err);
    return {
      success: false,
      error: errorMessage,
      isQuotaExceeded: isQuota,
    };
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
    const saveRes = saveToLocalStorage(result.data);
    if (!saveRes.success) {
      return {
        success: false,
        error: saveRes.error || 'Failed to persist imported data to local storage.',
      };
    }
    return { success: true, store: result.data };
  } catch {
    return { success: false, error: 'The provided file is not valid JSON.' };
  }
}
