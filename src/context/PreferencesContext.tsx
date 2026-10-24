import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserPreferences, ThemeMode } from '../domain/types';
import { loadFromLocalStorage, saveToLocalStorage } from '../storage/localStorageRepo';

interface PreferencesContextType {
  preferences: UserPreferences;
  updatePreferences: (updates: Partial<UserPreferences>) => void;
  setTheme: (theme: ThemeMode) => void;
  resetPreferences: () => void;
  recoveredFromCorrupt: boolean;
  clearCorruptionAlert: () => void;
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

export const PreferencesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [initialData] = useState(() => loadFromLocalStorage());
  const [preferences, setPreferences] = useState<UserPreferences>(initialData.store.preferences);
  const [recoveredFromCorrupt, setRecoveredFromCorrupt] = useState(initialData.recoveredFromCorrupt);

  // Apply dark theme class to document element
  useEffect(() => {
    const root = document.documentElement;
    const isDark =
      preferences.theme === 'dark' ||
      (preferences.theme === 'system' &&
        typeof window !== 'undefined' &&
        typeof window.matchMedia === 'function' &&
        window.matchMedia('(prefers-color-scheme: dark)').matches);

    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    // High contrast focus preference
    if (preferences.highContrastFocus) {
      root.classList.add('high-contrast-focus');
    } else {
      root.classList.remove('high-contrast-focus');
    }

    // Reduced motion preference
    if (preferences.reducedMotion) {
      root.classList.add('force-reduced-motion');
    } else {
      root.classList.remove('force-reduced-motion');
    }
  }, [preferences]);

  const updatePreferences = (updates: Partial<UserPreferences>) => {
    setPreferences((prev) => {
      const updated = { ...prev, ...updates };
      const current = loadFromLocalStorage().store;
      current.preferences = updated;
      saveToLocalStorage(current);
      return updated;
    });
  };

  const setTheme = (theme: ThemeMode) => {
    updatePreferences({ theme });
  };

  const resetPreferences = () => {
    const defaults: UserPreferences = {
      focusDuration: 25,
      shortBreakDuration: 5,
      longBreakDuration: 15,
      theme: 'system',
      reducedMotion: false,
      highContrastFocus: false,
      soundAlerts: false,
    };
    updatePreferences(defaults);
  };

  const clearCorruptionAlert = () => {
    setRecoveredFromCorrupt(false);
  };

  return (
    <PreferencesContext.Provider
      value={{
        preferences,
        updatePreferences,
        setTheme,
        resetPreferences,
        recoveredFromCorrupt,
        clearCorruptionAlert,
      }}
    >
      {children}
    </PreferencesContext.Provider>
  );
};

export const usePreferences = () => {
  const ctx = useContext(PreferencesContext);
  if (!ctx) {
    throw new Error('usePreferences must be used within a PreferencesProvider');
  }
  return ctx;
};
