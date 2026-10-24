import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  loadFromLocalStorage,
  saveToLocalStorage,
  exportBackupJson,
  importBackupJson,
  STORAGE_KEY,
} from '../storage/localStorageRepo';

describe('localStorageRepo', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('initializes with seed data when storage is empty', () => {
    const { store, recoveredFromCorrupt, backupSuccess } = loadFromLocalStorage();
    expect(recoveredFromCorrupt).toBe(false);
    expect(backupSuccess).toBe(false);
    expect(store.schemaVersion).toBe(1);
    expect(store.tasks.length).toBeGreaterThan(0);
    expect(localStorage.getItem(STORAGE_KEY)).not.toBeNull();
  });

  it('saves and reloads store successfully', () => {
    const { store } = loadFromLocalStorage();
    store.tasks[0].title = 'Updated Title by Test';
    const saveRes = saveToLocalStorage(store);
    expect(saveRes.success).toBe(true);

    const reloaded = loadFromLocalStorage();
    expect(reloaded.store.tasks[0].title).toBe('Updated Title by Test');
    expect(reloaded.recoveredFromCorrupt).toBe(false);
  });

  it('safely recovers when storage contains corrupted JSON and writes backup', () => {
    localStorage.setItem(STORAGE_KEY, '{invalid json syntax!!!}');

    const result = loadFromLocalStorage();
    expect(result.recoveredFromCorrupt).toBe(true);
    expect(result.backupSuccess).toBe(true);
    expect(result.backupKey).toBeDefined();
    expect(result.store.schemaVersion).toBe(1);

    // Verify backup key was written
    if (result.backupKey) {
      expect(localStorage.getItem(result.backupKey)).toBe('{invalid json syntax!!!}');
    }
  });

  it('safely recovers when storage contains invalid schema structure', () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ wrongField: 123 }));

    const result = loadFromLocalStorage();
    expect(result.recoveredFromCorrupt).toBe(true);
    expect(result.backupSuccess).toBe(true);
    expect(result.store.tasks.length).toBeGreaterThan(0);
  });

  it('detects QuotaExceededError on saveToLocalStorage and returns typed failure result', () => {
    const { store } = loadFromLocalStorage();

    const quotaError = new DOMException('Storage quota exceeded', 'QuotaExceededError');
    vi.spyOn(Storage.prototype, 'setItem').mockImplementationOnce(() => {
      throw quotaError;
    });

    const result = saveToLocalStorage(store);
    expect(result.success).toBe(false);
    expect(result.isQuotaExceeded).toBe(true);
    expect(result.error).toBe('Storage quota exceeded');
  });

  it('recovers gracefully with fallback seed data when localStorage.getItem throws security exception', () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementationOnce(() => {
      throw new DOMException('Access denied by browser security settings', 'SecurityError');
    });

    const result = loadFromLocalStorage();
    expect(result.recoveredFromCorrupt).toBe(true);
    expect(result.backupSuccess).toBe(false);
    expect(result.store.schemaVersion).toBe(1);
    expect(result.store.tasks.length).toBeGreaterThan(0);
  });

  it('accurately reports backupSuccess: false when corrupted data cannot be written to backup', () => {
    localStorage.setItem(STORAGE_KEY, '{broken json!!!}');

    // Mock setItem so saving backup throws QuotaExceededError
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation((key: string) => {
      if (key.startsWith('clearstep_backup_')) {
        throw new DOMException('Quota exceeded', 'QuotaExceededError');
      }
    });

    const result = loadFromLocalStorage();
    expect(result.recoveredFromCorrupt).toBe(true);
    expect(result.backupSuccess).toBe(false);
    expect(result.backupKey).toBeUndefined();
    expect(result.store.schemaVersion).toBe(1);
  });

  it('exports valid formatted JSON', () => {
    const { store } = loadFromLocalStorage();
    const exported = exportBackupJson(store);
    const parsed = JSON.parse(exported);
    expect(parsed.schemaVersion).toBe(1);
  });

  it('imports valid backup and rejects invalid backup', () => {
    const { store } = loadFromLocalStorage();
    const validJson = exportBackupJson(store);

    const importRes = importBackupJson(validJson);
    expect(importRes.success).toBe(true);
    expect(importRes.store?.schemaVersion).toBe(1);

    const invalidRes = importBackupJson('{"broken": true}');
    expect(invalidRes.success).toBe(false);
  });
});
