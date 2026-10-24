import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import React from 'react';
import { TimerProvider, useTimer } from '../context/TimerContext';
import { PreferencesProvider } from '../context/PreferencesContext';
import { loadFromLocalStorage } from '../storage/localStorageRepo';

const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <PreferencesProvider>
    <TimerProvider>{children}</TimerProvider>
  </PreferencesProvider>
);

describe('TimerContext Task Attribution and Wall-Clock Accuracy', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('records Task A when starting a task-linked session and completing it', () => {
    const { result } = renderHook(() => useTimer(), { wrapper });

    act(() => {
      result.current.clearSessionHistory();
    });

    act(() => {
      result.current.startTimer('task-a', 'Task A: Literature Review');
    });

    expect(result.current.activeTaskId).toBe('task-a');
    expect(result.current.activeTaskTitle).toBe('Task A: Literature Review');
    expect(result.current.isRunning).toBe(true);

    // Complete session early
    act(() => {
      result.current.completeSessionNow();
    });

    expect(result.current.isSessionComplete).toBe(true);

    const savedStore = loadFromLocalStorage().store;
    expect(savedStore.sessions.length).toBe(1);
    expect(savedStore.sessions[0].taskId).toBe('task-a');
    expect(savedStore.sessions[0].taskTitle).toBe('Task A: Literature Review');
  });

  it('resets/finishes, then starts independent session with taskId: null and Independent Focus Session', () => {
    const { result } = renderHook(() => useTimer(), { wrapper });

    act(() => {
      result.current.clearSessionHistory();
    });

    // 1. Run Task A session
    act(() => {
      result.current.startTimer('task-a', 'Task A: Literature Review');
    });
    act(() => {
      result.current.completeSessionNow();
    });
    act(() => {
      result.current.dismissCompleteModal();
    });

    expect(result.current.activeTaskId).toBeNull();
    expect(result.current.activeTaskTitle).toBeNull();

    // Switch back to focus mode if dismiss shifted to break
    act(() => {
      result.current.switchMode('focus');
    });

    // 2. Start independent session with no arguments
    act(() => {
      result.current.startTimer();
    });

    expect(result.current.activeTaskId).toBeNull();
    expect(result.current.activeTaskTitle).toBeNull();

    act(() => {
      result.current.completeSessionNow();
    });

    const savedStore = loadFromLocalStorage().store;
    expect(savedStore.sessions.length).toBe(2);
    expect(savedStore.sessions[0].taskId).toBeNull();
    expect(savedStore.sessions[0].taskTitle).toBe('Independent Focus Session');
  });

  it('records Task B when starting session with Task B after Task A', () => {
    const { result } = renderHook(() => useTimer(), { wrapper });

    act(() => {
      result.current.clearSessionHistory();
    });

    // Task A
    act(() => {
      result.current.startTimer('task-a', 'Task A: Literature Review');
    });
    act(() => {
      result.current.completeSessionNow();
    });
    act(() => {
      result.current.dismissCompleteModal();
    });

    // Task B
    act(() => {
      result.current.switchMode('focus');
      result.current.startTimer('task-b', 'Task B: Math Assignment');
    });

    expect(result.current.activeTaskId).toBe('task-b');
    expect(result.current.activeTaskTitle).toBe('Task B: Math Assignment');

    act(() => {
      result.current.completeSessionNow();
    });

    const savedStore = loadFromLocalStorage().store;
    expect(savedStore.sessions[0].taskId).toBe('task-b');
    expect(savedStore.sessions[0].taskTitle).toBe('Task B: Math Assignment');
  });

  it('clears active task identity when resetTimer or switchMode is invoked', () => {
    const { result } = renderHook(() => useTimer(), { wrapper });

    act(() => {
      result.current.startTimer('task-a', 'Task A');
    });
    expect(result.current.activeTaskId).toBe('task-a');

    act(() => {
      result.current.switchMode('shortBreak');
    });
    expect(result.current.activeTaskId).toBeNull();
    expect(result.current.activeTaskTitle).toBeNull();
  });

  it('accurately adjusts wall-clock remaining time with addSeconds when running and when paused', () => {
    const { result } = renderHook(() => useTimer(), { wrapper });

    // Paused state: add 300s
    expect(result.current.remainingSeconds).toBe(1500);
    act(() => {
      result.current.addSeconds(300);
    });
    expect(result.current.remainingSeconds).toBe(1800);
    expect(result.current.targetSeconds).toBe(1800);

    // Start timer and advance 10 seconds
    act(() => {
      result.current.startTimer();
    });
    // startTimer initializes target and remaining to preferences (1500s)
    expect(result.current.remainingSeconds).toBe(1500);

    act(() => {
      vi.advanceTimersByTime(10000); // 10s elapsed
    });
    expect(result.current.remainingSeconds).toBe(1490);

    // Add 300s while running
    act(() => {
      result.current.addSeconds(300);
    });
    expect(result.current.remainingSeconds).toBe(1790);
    expect(result.current.targetSeconds).toBe(1800);

    // Advance 5 more seconds
    act(() => {
      vi.advanceTimersByTime(5000);
    });
    expect(result.current.remainingSeconds).toBe(1785);
  });
});
