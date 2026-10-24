import { describe, it, expect, beforeEach } from 'vitest';
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
  });

  it('initializes with seed data when storage is empty', () => {
    const { store, recoveredFromCorrupt } = loadFromLocalStorage();
    expect(recoveredFromCorrupt).toBe(false);
    expect(store.schemaVersion).toBe(1);
    expect(store.tasks.length).toBeGreaterThan(0);
    expect(localStorage.getItem(STORAGE_KEY)).not.toBeNull();
  });

  it('saves and reloads store successfully', () => {
    const { store } = loadFromLocalStorage();
    store.tasks[0].title = 'Updated Title by Test';
    saveToLocalStorage(store);

    const reloaded = loadFromLocalStorage();
    expect(reloaded.store.tasks[0].title).toBe('Updated Title by Test');
    expect(reloaded.recoveredFromCorrupt).toBe(false);
  });

  it('safely recovers when storage contains corrupted JSON and writes backup', () => {
    localStorage.setItem(STORAGE_KEY, '{invalid json syntax!!!}');

    const result = loadFromLocalStorage();
    expect(result.recoveredFromCorrupt).toBe(true);
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
    expect(result.store.tasks.length).toBeGreaterThan(0);
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
