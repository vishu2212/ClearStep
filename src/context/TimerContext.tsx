import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { FocusMode, FocusSession } from '../domain/types';
import { calculateRemainingSeconds, calculateTimerProgress } from '../domain/timerCalculations';
import { loadFromLocalStorage, saveToLocalStorage } from '../storage/localStorageRepo';
import { usePreferences } from './PreferencesContext';

interface TimerContextType {
  mode: FocusMode;
  targetSeconds: number;
  remainingSeconds: number;
  progressPercent: number;
  isRunning: boolean;
  activeTaskId: string | null;
  activeTaskTitle: string | null;
  sessions: FocusSession[];
  isSessionComplete: boolean;
  startTimer: (taskId?: string | null, taskTitle?: string | null) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  resetTimer: () => void;
  switchMode: (newMode: FocusMode) => void;
  dismissCompleteModal: () => void;
  clearSessionHistory: () => void;
}

const TimerContext = createContext<TimerContextType | undefined>(undefined);

export const TimerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { preferences } = usePreferences();
  const [sessions, setSessions] = useState<FocusSession[]>(() => loadFromLocalStorage().store.sessions);

  const [mode, setMode] = useState<FocusMode>('focus');
  const [isRunning, setIsRunning] = useState(false);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [activeTaskTitle, setActiveTaskTitle] = useState<string | null>(null);
  const [isSessionComplete, setIsSessionComplete] = useState(false);

  // Get target duration based on mode from preferences
  const getDurationForMode = (m: FocusMode): number => {
    switch (m) {
      case 'focus':
        return preferences.focusDuration * 60;
      case 'shortBreak':
        return preferences.shortBreakDuration * 60;
      case 'longBreak':
        return preferences.longBreakDuration * 60;
    }
  };

  const [targetSeconds, setTargetSeconds] = useState<number>(() => getDurationForMode('focus'));
  const [remainingSeconds, setRemainingSeconds] = useState<number>(() => getDurationForMode('focus'));

  // Wall-clock tracking refs for background tab immunity
  const startTimeRef = useRef<number | null>(null);
  const pausedRemainingRef = useRef<number>(getDurationForMode('focus'));

  // When preferences change and timer is not running, update durations
  useEffect(() => {
    if (!isRunning) {
      const dur = getDurationForMode(mode);
      setTargetSeconds(dur);
      setRemainingSeconds(dur);
      pausedRemainingRef.current = dur;
    }
  }, [preferences.focusDuration, preferences.shortBreakDuration, preferences.longBreakDuration, mode, isRunning]);

  // Main timer engine: wall-clock delta calculation on interval
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      if (startTimeRef.current === null) return;

      const remaining = calculateRemainingSeconds(
        startTimeRef.current,
        pausedRemainingRef.current,
        Date.now()
      );

      if (remaining <= 0) {
        // Session Complete!
        clearInterval(interval);
        setIsRunning(false);
        setRemainingSeconds(0);
        setIsSessionComplete(true);

        // Record focus session to persistent storage if mode is focus
        if (mode === 'focus') {
          const durationMins = Math.max(1, Math.round(targetSeconds / 60));
          const newSession: FocusSession = {
            id: `session-${Date.now()}`,
            taskId: activeTaskId,
            taskTitle: activeTaskTitle || 'Independent Focus Session',
            mode: 'focus',
            durationMinutes: durationMins,
            completedAt: new Date().toISOString(),
          };

          setSessions((prev) => {
            const next = [newSession, ...prev];
            const store = loadFromLocalStorage().store;
            store.sessions = next;
            saveToLocalStorage(store);
            return next;
          });
        }
      } else {
        setRemainingSeconds(remaining);
      }
    }, 250); // High-frequency polling ensures immediate responsiveness on tab refocus

    return () => clearInterval(interval);
  }, [isRunning, targetSeconds, mode, activeTaskId, activeTaskTitle]);

  const startTimer = (taskId: string | null = null, taskTitle: string | null = null) => {
    if (taskId) setActiveTaskId(taskId);
    if (taskTitle) setActiveTaskTitle(taskTitle);

    const dur = getDurationForMode(mode);
    setTargetSeconds(dur);
    setRemainingSeconds(dur);
    pausedRemainingRef.current = dur;
    startTimeRef.current = Date.now();
    setIsRunning(true);
    setIsSessionComplete(false);
  };

  const pauseTimer = () => {
    if (!isRunning) return;
    setIsRunning(false);
    pausedRemainingRef.current = remainingSeconds;
    startTimeRef.current = null;
  };

  const resumeTimer = () => {
    if (isRunning || remainingSeconds <= 0) return;
    startTimeRef.current = Date.now();
    setIsRunning(true);
  };

  const resetTimer = () => {
    setIsRunning(false);
    startTimeRef.current = null;
    const dur = getDurationForMode(mode);
    setTargetSeconds(dur);
    setRemainingSeconds(dur);
    pausedRemainingRef.current = dur;
    setIsSessionComplete(false);
  };

  const switchMode = (newMode: FocusMode) => {
    setIsRunning(false);
    startTimeRef.current = null;
    setMode(newMode);
    const dur = getDurationForMode(newMode);
    setTargetSeconds(dur);
    setRemainingSeconds(dur);
    pausedRemainingRef.current = dur;
    setIsSessionComplete(false);
  };

  const dismissCompleteModal = () => {
    setIsSessionComplete(false);
    // Transition to appropriate next mode (e.g. break after focus)
    if (mode === 'focus') {
      switchMode('shortBreak');
    } else {
      switchMode('focus');
    }
  };

  const clearSessionHistory = () => {
    setSessions([]);
    const store = loadFromLocalStorage().store;
    store.sessions = [];
    saveToLocalStorage(store);
  };

  const progressPercent = calculateTimerProgress(remainingSeconds, targetSeconds);

  return (
    <TimerContext.Provider
      value={{
        mode,
        targetSeconds,
        remainingSeconds,
        progressPercent,
        isRunning,
        activeTaskId,
        activeTaskTitle,
        sessions,
        isSessionComplete,
        startTimer,
        pauseTimer,
        resumeTimer,
        resetTimer,
        switchMode,
        dismissCompleteModal,
        clearSessionHistory,
      }}
    >
      {children}
    </TimerContext.Provider>
  );
};

export const useTimer = () => {
  const ctx = useContext(TimerContext);
  if (!ctx) {
    throw new Error('useTimer must be used within a TimerProvider');
  }
  return ctx;
};
