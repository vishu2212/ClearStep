import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { render, screen, fireEvent, renderHook, act } from '@testing-library/react';
import React from 'react';
import { TaskProvider, useTasks } from '../context/TaskContext';
import { PreferencesProvider } from '../context/PreferencesContext';
import { TimerProvider, useTimer } from '../context/TimerContext';
import { TaskModal } from '../components/tasks/TaskModal';
import { ContextualSidePanel } from '../components/layout/ContextualSidePanel';
import { NextActionHero } from '../components/nextAction/NextActionHero';
import { App } from '../App';
import {
  salvageOrMigrateStore,
  validateBackupJson,
  commitImportedStore,
  loadFromLocalStorage,
  saveToLocalStorage,
} from '../storage/localStorageRepo';
import { getLocalDateString, getDaysDifference } from '../domain/recommendationEngine';
import type { Task, FocusSession } from '../domain/types';

const wrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <PreferencesProvider>
    <TaskProvider>
      <TimerProvider>{children}</TimerProvider>
    </TaskProvider>
  </PreferencesProvider>
);

describe('Seven-Defect Remediation & Data Integrity Verification Suite', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  // =========================================================================
  // DEFECT 1: TaskModal & TaskContext Subtask Identity and Completion Preservation
  // =========================================================================
  describe('Fix 1: Subtask Identity, Renaming, Duplicate Titles, and Parent Reopening', () => {
    it('renaming a completed subtask in TaskModal preserves its stable ID, completed: true, and completedAt', () => {
      // 1. Prepare initial task in localStorage with 1 completed subtask and 1 pending subtask
      const testTask: Task = {
        id: 'task-subtask-test',
        title: 'Original Research Paper',
        description: 'Complete literature review',
        priority: 'urgent',
        dueDate: '2026-11-01',
        tags: ['Research'],
        subtasks: [
          {
            id: 'sub-completed-123',
            title: 'Find 3 peer-reviewed sources',
            completed: true,
            completedAt: '2026-10-24T09:00:00.000Z',
          },
          {
            id: 'sub-pending-456',
            title: 'Draft methodology',
            completed: false,
            completedAt: null,
          },
        ],
        completed: false,
        completedAt: null,
        createdAt: '2026-10-24T08:00:00.000Z',
        updatedAt: '2026-10-24T08:00:00.000Z',
        isFocusPinned: true,
      };

      const store = loadFromLocalStorage().store;
      store.tasks = [testTask];
      saveToLocalStorage(store);

      const onClose = vi.fn();

      render(
        <PreferencesProvider>
          <TaskProvider>
            <TimerProvider>
              <TaskModal isOpen={true} onClose={onClose} taskIdToEdit="task-subtask-test" />
            </TimerProvider>
          </TaskProvider>
        </PreferencesProvider>
      );

      // Verify the completed subtask input is rendered
      const step1Input = screen.getByLabelText(/Edit step 1: Find 3 peer-reviewed sources/i) as HTMLInputElement;
      expect(step1Input).toBeInTheDocument();
      expect(step1Input.value).toBe('Find 3 peer-reviewed sources');

      // Edit title of step 1
      fireEvent.change(step1Input, { target: { value: 'Find 5 peer-reviewed sources' } });

      // Save changes
      const saveBtn = screen.getByRole('button', { name: /Save Changes/i });
      fireEvent.click(saveBtn);
      expect(onClose).toHaveBeenCalled();

      // Inspect updated localStorage
      const updatedStore = loadFromLocalStorage().store;
      const updatedTask = updatedStore.tasks.find((t) => t.id === 'task-subtask-test')!;
      expect(updatedTask.subtasks).toHaveLength(2);

      const updatedSubtask1 = updatedTask.subtasks[0];
      expect(updatedSubtask1.id).toBe('sub-completed-123'); // ID PRESERVED
      expect(updatedSubtask1.title).toBe('Find 5 peer-reviewed sources');
      expect(updatedSubtask1.completed).toBe(true); // COMPLETION PRESERVED
      expect(updatedSubtask1.completedAt).toBe('2026-10-24T09:00:00.000Z'); // TIMESTAMP PRESERVED

      const updatedSubtask2 = updatedTask.subtasks[1];
      expect(updatedSubtask2.id).toBe('sub-pending-456');
      expect(updatedSubtask2.completed).toBe(false);
    });

    it('supports duplicate subtask titles with distinct stable IDs and independent completion', () => {
      const testTask: Task = {
        id: 'task-duplicate-titles',
        title: 'Baking Recipe',
        description: 'Two separate review steps',
        priority: 'medium',
        dueDate: null,
        tags: [],
        subtasks: [
          {
            id: 'sub-review-1',
            title: 'Review checklist',
            completed: true,
            completedAt: '2026-10-24T10:00:00.000Z',
          },
          {
            id: 'sub-review-2',
            title: 'Review checklist', // duplicate title
            completed: false,
            completedAt: null,
          },
        ],
        completed: false,
        completedAt: null,
        createdAt: '2026-10-24T08:00:00.000Z',
        updatedAt: '2026-10-24T08:00:00.000Z',
        isFocusPinned: false,
      };

      const store = loadFromLocalStorage().store;
      store.tasks = [testTask];
      saveToLocalStorage(store);

      render(
        <PreferencesProvider>
          <TaskProvider>
            <TimerProvider>
              <TaskModal isOpen={true} onClose={vi.fn()} taskIdToEdit="task-duplicate-titles" />
            </TimerProvider>
          </TaskProvider>
        </PreferencesProvider>
      );

      const step1Input = screen.getByLabelText(/Edit step 1: Review checklist/i);
      const step2Input = screen.getByLabelText(/Edit step 2: Review checklist/i);
      expect(step1Input).toBeInTheDocument();

      // Rename second duplicate title
      fireEvent.change(step2Input, { target: { value: 'Review checklist final pass' } });

      const saveBtn = screen.getByRole('button', { name: /Save Changes/i });
      fireEvent.click(saveBtn);

      const updatedStore = loadFromLocalStorage().store;
      const updatedTask = updatedStore.tasks.find((t) => t.id === 'task-duplicate-titles')!;
      expect(updatedTask.subtasks[0].id).toBe('sub-review-1');
      expect(updatedTask.subtasks[0].completed).toBe(true);
      expect(updatedTask.subtasks[1].id).toBe('sub-review-2');
      expect(updatedTask.subtasks[1].title).toBe('Review checklist final pass');
      expect(updatedTask.subtasks[1].completed).toBe(false);
    });

    it('addSubtask in TaskContext safely reopens a completed parent task', () => {
      const { result } = renderHook(() => useTasks(), { wrapper });

      let createdId = '';
      act(() => {
        result.current.createTask({
          title: 'Finished Project Report',
          priority: 'high',
          dueDate: null,
          tags: [],
          subtasks: ['Original Final Step'],
          isFocusPinned: false,
        });
      });

      const task = result.current.tasks.find((t) => t.title === 'Finished Project Report')!;
      createdId = task.id;

      // Mark the subtask done to auto-complete parent
      act(() => {
        result.current.toggleSubtask(createdId, task.subtasks[0].id);
      });

      let updated = result.current.tasks.find((t) => t.id === createdId)!;
      expect(updated.completed).toBe(true);
      expect(updated.completedAt).not.toBeNull();

      // Now add a new subtask to the completed task -> must reopen parent task
      act(() => {
        result.current.addSubtask(createdId, 'New Follow-up Review');
      });

      updated = result.current.tasks.find((t) => t.id === createdId)!;
      expect(updated.completed).toBe(false);
      expect(updated.completedAt).toBeNull();
      expect(updated.subtasks).toHaveLength(2);
      expect(updated.subtasks[1].title).toBe('New Follow-up Review');
      expect(updated.subtasks[1].completed).toBe(false);
    });

    it('updateTask with all completed subtasks marks parent task complete', () => {
      const { result } = renderHook(() => useTasks(), { wrapper });

      act(() => {
        result.current.createTask({
          title: 'Quick Audit',
          priority: 'medium',
          dueDate: null,
          tags: [],
          subtasks: ['Audit 1', 'Audit 2'],
          isFocusPinned: false,
        });
      });

      const task = result.current.tasks.find((t) => t.title === 'Quick Audit')!;
      expect(task.completed).toBe(false);

      act(() => {
        result.current.updateTask(task.id, {
          subtasks: [
            { id: task.subtasks[0].id, title: 'Audit 1', completed: true, completedAt: new Date().toISOString() },
            { id: task.subtasks[1].id, title: 'Audit 2', completed: true, completedAt: new Date().toISOString() },
          ],
        });
      });

      const updated = result.current.tasks.find((t) => t.id === task.id)!;
      expect(updated.completed).toBe(true);
      expect(updated.completedAt).not.toBeNull();
    });
  });

  // =========================================================================
  // DEFECT 2: Session Persistence & Timer Reload on Import
  // =========================================================================
  describe('Fix 2: Backup Import & Session History Reload', () => {
    it('reloads imported sessions into TimerContext and preserves them when subsequent session completes', () => {
      const { result: timerResult } = renderHook(() => useTimer(), { wrapper });

      // Initial clean session history
      act(() => {
        timerResult.current.clearSessionHistory();
      });
      expect(timerResult.current.sessions).toHaveLength(0);

      // Simulate an imported backup with 3 historical sessions
      const importedSessions: FocusSession[] = [
        {
          id: 'imported-sess-1',
          taskId: 'task-chem',
          taskTitle: 'Chemistry Lab',
          mode: 'focus',
          durationMinutes: 25,
          completedAt: '2026-10-23T14:00:00.000Z',
        },
        {
          id: 'imported-sess-2',
          taskId: null,
          taskTitle: 'Independent Focus Session',
          mode: 'focus',
          durationMinutes: 30,
          completedAt: '2026-10-23T16:00:00.000Z',
        },
      ];

      const currentStore = loadFromLocalStorage().store;
      currentStore.sessions = importedSessions;
      commitImportedStore(currentStore);

      // Trigger reloadSessionsFromStorage as SettingsView does on import
      act(() => {
        timerResult.current.reloadSessionsFromStorage();
      });

      expect(timerResult.current.sessions).toHaveLength(2);
      expect(timerResult.current.sessions[0].id).toBe('imported-sess-1');

      // Now complete a brand new focus session
      act(() => {
        timerResult.current.startTimer('task-fresh', 'Fresh Task Today');
      });
      act(() => {
        timerResult.current.completeSessionNow();
      });

      // The new session MUST be prepended and imported sessions MUST NOT be overwritten or lost
      expect(timerResult.current.sessions).toHaveLength(3);
      expect(timerResult.current.sessions[0].taskId).toBe('task-fresh');
      expect(timerResult.current.sessions[1].id).toBe('imported-sess-1');
      expect(timerResult.current.sessions[2].id).toBe('imported-sess-2');

      const savedStore = loadFromLocalStorage().store;
      expect(savedStore.sessions).toHaveLength(3);
      expect(savedStore.sessions[1].id).toBe('imported-sess-1');
    });

    it('preserves existing storage sessions if import validation fails', () => {
      const store = loadFromLocalStorage().store;
      store.sessions = [
        {
          id: 'pre-existing-sess',
          taskId: null,
          taskTitle: 'Existing Session',
          mode: 'focus',
          durationMinutes: 25,
          completedAt: new Date().toISOString(),
        },
      ];
      saveToLocalStorage(store);

      const invalidJson = '{ not valid json syntax ...';
      const validation = validateBackupJson(invalidJson);
      expect(validation.success).toBe(false);

      // Verify original session is completely preserved in storage
      const reloaded = loadFromLocalStorage().store;
      expect(reloaded.sessions).toHaveLength(1);
      expect(reloaded.sessions[0].id).toBe('pre-existing-sess');
    });
  });

  // =========================================================================
  // DEFECT 3: No Seed Resurrection for Clean Workspaces
  // =========================================================================
  describe('Fix 3: Storage Salvaging Preserves Empty Workspace (No Seed Resurrection)', () => {
    it('preserves an intentionally empty tasks array (tasks: []) without resurrecting starter seeds', () => {
      const emptyTasksPayload = {
        schemaVersion: 999, // Unknown/future schema version triggers salvageOrMigrateStore
        tasks: [], // User deliberately completed or deleted all tasks
        sessions: [
          {
            id: 'session-salvage-1',
            taskId: null,
            taskTitle: 'Study Block',
            mode: 'focus',
            durationMinutes: 45,
            completedAt: '2026-10-24T12:00:00.000Z',
          },
        ],
        preferences: {
          focusDuration: 30,
          shortBreakDuration: 5,
          longBreakDuration: 15,
          sessionsBeforeLongBreak: 4,
          dailyGoalSessions: 4,
          soundEnabled: false,
          theme: 'light',
          reduceMotion: false,
          highContrast: false,
        },
        lastUpdated: '2026-10-24T12:00:00.000Z',
      };

      const salvaged = salvageOrMigrateStore(emptyTasksPayload);
      expect(salvaged).not.toBeNull();
      expect(salvaged?.schemaVersion).toBe(1);
      // Crucial test: tasks MUST be empty array, NOT seed tasks!
      expect(salvaged?.tasks).toEqual([]);
      expect(salvaged?.tasks).toHaveLength(0);
      expect(salvaged?.sessions).toHaveLength(1);
    });

    it('falls back to seed tasks only when tasks property is missing or not an array', () => {
      const missingTasksPayload = {
        schemaVersion: 999,
        // tasks is omitted entirely
        sessions: [
          {
            id: 'sess-1',
            taskId: null,
            taskTitle: 'Session',
            mode: 'focus',
            durationMinutes: 25,
            completedAt: '2026-10-24T10:00:00.000Z',
          },
        ],
        preferences: null,
      };

      const salvaged = salvageOrMigrateStore(missingTasksPayload);
      expect(salvaged).not.toBeNull();
      // Since tasks was undefined, it gracefully supplies starter tasks
      expect(salvaged?.tasks.length).toBeGreaterThan(0);
    });
  });

  // =========================================================================
  // DEFECTS 4 & 5: Local Date Math in ContextualSidePanel & NextActionHero
  // =========================================================================
  describe('Fix 4 & 5: Local Date Math in ContextualSidePanel & NextActionHero', () => {
    it('renders "Tomorrow" in ContextualSidePanel even at late evening boundary (23:30 local time)', () => {
      // Mock system time to 11:30 PM local time on Oct 24, 2026
      vi.useFakeTimers();
      const mockNow = new Date('2026-10-24T23:30:00');
      vi.setSystemTime(mockNow);

      const todayStr = getLocalDateString(mockNow);
      expect(todayStr).toBe('2026-10-24');

      // Task due tomorrow (2026-10-25)
      const diff = getDaysDifference('2026-10-25', todayStr);
      expect(diff).toBe(1); // Exactly 1 day difference regardless of time of day!

      const store = loadFromLocalStorage().store;
      store.tasks = [
        {
          id: 'task-tomorrow-test',
          title: 'Genetics Lab Report Submission',
          description: '',
          priority: 'urgent',
          dueDate: '2026-10-25',
          tags: ['BIO 201'],
          subtasks: [],
          completed: false,
          completedAt: null,
          createdAt: mockNow.toISOString(),
          updatedAt: mockNow.toISOString(),
          isFocusPinned: false,
        },
      ];
      saveToLocalStorage(store);

      render(
        <PreferencesProvider>
          <TaskProvider>
            <TimerProvider>
              <ContextualSidePanel />
            </TimerProvider>
          </TaskProvider>
        </PreferencesProvider>
      );

      // Verify that ContextualSidePanel groups it under "Tomorrow"
      expect(screen.getByText(/Tomorrow, Oct 25/i)).toBeInTheDocument();
      expect(screen.getByText('Genetics Lab Report Submission')).toBeInTheDocument();
    });

    it('renders "Due today", "Due tomorrow", and "Overdue by X days" accurately in NextActionHero', () => {
      const mockNow = new Date('2026-10-24T20:00:00');
      vi.useFakeTimers();
      vi.setSystemTime(mockNow);

      const store = loadFromLocalStorage().store;
      // Task due today
      store.tasks = [
        {
          id: 'task-due-today',
          title: 'Physics Homework 4',
          description: '',
          priority: 'urgent',
          dueDate: '2026-10-24',
          tags: ['PHYS 102'],
          subtasks: [],
          completed: false,
          completedAt: null,
          createdAt: mockNow.toISOString(),
          updatedAt: mockNow.toISOString(),
          isFocusPinned: true, // Guarantees recommendation engine selects it
        },
      ];
      saveToLocalStorage(store);

      const { unmount: unmountToday } = render(
        <PreferencesProvider>
          <TaskProvider>
            <TimerProvider>
              <NextActionHero onStartFocus={vi.fn()} onEditTask={vi.fn()} onCreateTask={vi.fn()} />
            </TimerProvider>
          </TaskProvider>
        </PreferencesProvider>
      );

      expect(screen.getAllByText('Due today').length).toBeGreaterThanOrEqual(1);
      unmountToday();

      // Update to due tomorrow
      store.tasks[0].dueDate = '2026-10-25';
      saveToLocalStorage(store);

      const { unmount: unmountTomorrow } = render(
        <PreferencesProvider>
          <TaskProvider>
            <TimerProvider>
              <NextActionHero onStartFocus={vi.fn()} onEditTask={vi.fn()} onCreateTask={vi.fn()} />
            </TimerProvider>
          </TaskProvider>
        </PreferencesProvider>
      );

      expect(screen.getAllByText(/Due tomorrow/i).length).toBeGreaterThanOrEqual(1);
      unmountTomorrow();

      // Update to overdue by 3 days
      store.tasks[0].dueDate = '2026-10-21';
      saveToLocalStorage(store);

      render(
        <PreferencesProvider>
          <TaskProvider>
            <TimerProvider>
              <NextActionHero onStartFocus={vi.fn()} onEditTask={vi.fn()} onCreateTask={vi.fn()} />
            </TimerProvider>
          </TaskProvider>
        </PreferencesProvider>
      );

      expect(screen.getAllByText(/Overdue by 3 days/i).length).toBeGreaterThanOrEqual(1);
      vi.useRealTimers();
    });
  });

  // =========================================================================
  // DEFECT 6: Modal-Safe Global Keyboard Shortcuts
  // =========================================================================
  describe('Fix 6: Modal-Safe Global Keyboard Shortcuts', () => {
    it('pressing "/", "n", and "f" does not hijack inputs, textareas, contenteditable, or open dialogs', () => {
      render(
        <PreferencesProvider>
          <TaskProvider>
            <TimerProvider>
              <App />
            </TimerProvider>
          </TaskProvider>
        </PreferencesProvider>
      );

      // Verify starting tab is Today
      expect(screen.getByText('One clear next step for today.')).toBeInTheDocument();

      // 1. Open Task Modal
      const openModalBtn = screen.getByLabelText(/Create new task/i);
      fireEvent.click(openModalBtn);
      expect(screen.getByText('Create New Task')).toBeInTheDocument();

      // While modal is open, simulate pressing 'f' (which normally navigates to Focus tab)
      fireEvent.keyDown(window, { key: 'f', code: 'KeyF' });
      // Modal MUST remain open, not navigate to Focus tab
      expect(screen.getByText('Create New Task')).toBeInTheDocument();

      // Simulate pressing '/' (which normally focuses search)
      fireEvent.keyDown(window, { key: '/', code: 'Slash' });
      expect(screen.getByText('Create New Task')).toBeInTheDocument();

      // Close modal
      const cancelBtn = screen.getByText('Cancel');
      fireEvent.click(cancelBtn);
      expect(screen.queryByText('Create New Task')).not.toBeInTheDocument();

      // 2. Test input focus immunity
      const quickAddInput = screen.getByPlaceholderText(/Add a task for today/i);
      quickAddInput.focus();

      // Pressing 'n' while typing in input must NOT open modal
      fireEvent.keyDown(quickAddInput, { key: 'n', code: 'KeyN' });
      expect(screen.queryByText('Create New Task')).not.toBeInTheDocument();

      // 3. Test contenteditable element immunity
      const editableDiv = document.createElement('div');
      editableDiv.contentEditable = 'true';
      document.body.appendChild(editableDiv);
      editableDiv.focus();

      fireEvent.keyDown(editableDiv, { key: 'f', code: 'KeyF' });
      expect(screen.getByText('One clear next step for today.')).toBeInTheDocument();

      document.body.removeChild(editableDiv);
    });

    it('global shortcuts work when no modal is open and no input is focused', () => {
      render(
        <PreferencesProvider>
          <TaskProvider>
            <TimerProvider>
              <App />
            </TimerProvider>
          </TaskProvider>
        </PreferencesProvider>
      );

      // Press 'f' to switch to Focus mode
      fireEvent.keyDown(window, { key: 'f', code: 'KeyF' });
      expect(screen.getByText('Deep Focus')).toBeInTheDocument();

      // Press 'Escape' to return to Today tab
      fireEvent.keyDown(window, { key: 'Escape', code: 'Escape' });
      expect(screen.getByText('One clear next step for today.')).toBeInTheDocument();
    });
  });

  // =========================================================================
  // DEFECT 7: Exact Wall-Clock Pause Math Under Tab Throttling
  // =========================================================================
  describe('Fix 7: Wall-Clock Pause Math Under Tab Throttling', () => {
    it('pauseTimer calculates exact elapsed wall-clock time even when background tab throttles intervals', () => {
      vi.useFakeTimers();
      const { result } = renderHook(() => useTimer(), { wrapper });

      act(() => {
        result.current.resetTimer();
        result.current.startTimer('task-calc-1', 'Physics Problem Set');
      });

      expect(result.current.remainingSeconds).toBe(1500); // 25 min default
      expect(result.current.isRunning).toBe(true);

      // Simulate browser tab throttling: interval does NOT tick, but wall-clock time advances 120s
      act(() => {
        vi.advanceTimersByTime(120000); // 120 seconds
      });

      // Calling pauseTimer MUST calculate wall-clock difference: 1500 - 120 = 1380
      act(() => {
        result.current.pauseTimer();
      });

      expect(result.current.isRunning).toBe(false);
      expect(result.current.remainingSeconds).toBe(1380);

      // Resume timer
      act(() => {
        result.current.resumeTimer();
      });
      expect(result.current.isRunning).toBe(true);

      // Advance another 80 seconds
      act(() => {
        vi.advanceTimersByTime(80000);
      });

      act(() => {
        result.current.pauseTimer();
      });

      // 1380 - 80 = 1300
      expect(result.current.remainingSeconds).toBe(1300);
    });
  });
});
