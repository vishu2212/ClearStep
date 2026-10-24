import React, { createContext, useContext, useState, useMemo } from 'react';
import {
  Task,
  Subtask,
  TaskPriority,
  RecommendationResult,
  TaskStatusFilter,
  TaskPriorityFilter,
  TaskSortOption,
} from '../domain/types';
import { calculateNextBestAction, getLocalDateString } from '../domain/recommendationEngine';
import { loadFromLocalStorage, saveToLocalStorage } from '../storage/localStorageRepo';
import { TASK_TEMPLATES } from '../domain/templates';

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

interface CreateTaskInput {
  title: string;
  description?: string;
  priority?: TaskPriority;
  dueDate?: string | null;
  tags?: string[];
  subtasks?: (string | Subtask)[];
  isFocusPinned?: boolean;
}

interface TaskContextType {
  tasks: Task[];
  filteredTasks: Task[];
  recommendation: RecommendationResult;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: TaskStatusFilter;
  setStatusFilter: (filter: TaskStatusFilter) => void;
  priorityFilter: TaskPriorityFilter;
  setPriorityFilter: (filter: TaskPriorityFilter) => void;
  sortOption: TaskSortOption;
  setSortOption: (sort: TaskSortOption) => void;
  createTask: (input: CreateTaskInput) => Task;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskCompletion: (id: string) => void;
  addSubtask: (taskId: string, title: string) => void;
  toggleSubtask: (taskId: string, subtaskId: string) => void;
  deleteSubtask: (taskId: string, subtaskId: string) => void;
  applyTemplate: (taskId: string, templateId: string) => void;
  setFocusPin: (taskId: string, isPinned: boolean) => void;
  reloadFromStorage: () => void;
  persistenceError: string | null;
  clearPersistenceError: () => void;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>(() => loadFromLocalStorage().store.tasks);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatusFilter>('all');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriorityFilter>('all');
  const [sortOption, setSortOption] = useState<TaskSortOption>('recommended');
  const [persistenceError, setPersistenceError] = useState<string | null>(null);

  const clearPersistenceError = () => {
    setPersistenceError(null);
  };

  const persistTasks = (updater: Task[] | ((prev: Task[]) => Task[])) => {
    setTasks((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      const store = loadFromLocalStorage().store;
      store.tasks = next;
      const saveRes = saveToLocalStorage(store);
      if (!saveRes.success) {
        setPersistenceError(
          saveRes.isQuotaExceeded
            ? 'Storage quota exceeded — task changes cannot be saved to browser storage.'
            : (saveRes.error || 'Failed to save task changes to browser storage.')
        );
      } else {
        setPersistenceError(null);
      }
      return next;
    });
  };

  const reloadFromStorage = () => {
    const updated = loadFromLocalStorage().store.tasks;
    setTasks(updated);
  };

  // Next Best Action is computed reactively from active tasks
  const recommendation = useMemo(() => {
    return calculateNextBestAction(tasks);
  }, [tasks]);

  // Filtered and Sorted Tasks
  const filteredTasks = useMemo(() => {
    const todayStr = getLocalDateString();

    return tasks
      .filter((task) => {
        // Search filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = task.title.toLowerCase().includes(q);
          const matchDesc = task.description.toLowerCase().includes(q);
          const matchTags = task.tags.some((t) => t.toLowerCase().includes(q));
          const matchSub = task.subtasks.some((s) => s.title.toLowerCase().includes(q));
          if (!matchTitle && !matchDesc && !matchTags && !matchSub) return false;
        }

        // Status filter
        if (statusFilter === 'active' && task.completed) return false;
        if (statusFilter === 'completed' && !task.completed) return false;
        if (statusFilter === 'due-today') {
          if (task.completed || task.dueDate !== todayStr) return false;
        }

        // Priority filter
        if (priorityFilter !== 'all' && task.priority !== priorityFilter) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortOption === 'recommended') {
          // Incompleted tasks first, then priority / due date
          if (a.completed !== b.completed) return a.completed ? 1 : -1;
          if (a.isFocusPinned !== b.isFocusPinned) return a.isFocusPinned ? -1 : 1;
          const priorityWeight = { urgent: 4, high: 3, medium: 2, low: 1 };
          if (priorityWeight[a.priority] !== priorityWeight[b.priority]) {
            return priorityWeight[b.priority] - priorityWeight[a.priority];
          }
          if (a.dueDate && b.dueDate) return a.dueDate.localeCompare(b.dueDate);
          if (a.dueDate) return -1;
          if (b.dueDate) return 1;
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }

        if (sortOption === 'dueDate') {
          if (!a.dueDate && !b.dueDate) return 0;
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return a.dueDate.localeCompare(b.dueDate);
        }

        if (sortOption === 'priority') {
          const priorityWeight = { urgent: 4, high: 3, medium: 2, low: 1 };
          return priorityWeight[b.priority] - priorityWeight[a.priority];
        }

        if (sortOption === 'alphabetical') {
          return a.title.localeCompare(b.title);
        }

        if (sortOption === 'createdAt') {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }

        return 0;
      });
  }, [tasks, searchQuery, statusFilter, priorityFilter, sortOption]);

  const createTask = (input: CreateTaskInput): Task => {
    const trimmedTitle = (input.title || '').trim();
    if (!trimmedTitle) {
      throw new Error('Task title cannot be empty.');
    }

    if (input.dueDate && !DATE_REGEX.test(input.dueDate)) {
      throw new Error('Invalid due date format. Expected YYYY-MM-DD.');
    }

    const validDueDate = input.dueDate || null;

    const newTask: Task = {
      id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title: trimmedTitle,
      description: input.description?.trim() || '',
      priority: input.priority || 'medium',
      dueDate: validDueDate,
      tags: (input.tags || []).map((t) => t.trim()).filter(Boolean),
      subtasks: (input.subtasks || [])
        .map((st, idx) => {
          if (typeof st === 'object' && st !== null) {
            const item = st as Subtask;
            const trimmed = (item.title || '').trim();
            if (!trimmed) return null;
            return {
              id: item.id || `sub-${Date.now()}-${idx}`,
              title: trimmed,
              completed: Boolean(item.completed),
              completedAt: item.completedAt || null,
            };
          }
          if (typeof st === 'string') {
            const trimmed = st.trim();
            if (!trimmed) return null;
            return {
              id: `sub-${Date.now()}-${idx}`,
              title: trimmed,
              completed: false,
              completedAt: null,
            };
          }
          return null;
        })
        .filter((s): s is Subtask => s !== null),
      completed: false,
      completedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isFocusPinned: !!input.isFocusPinned,
    };

    persistTasks((prev) => [newTask, ...prev]);
    return newTask;
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    const next = tasks.map((t) => {
      if (t.id === id) {
        let validTitle = t.title;
        if (updates.title !== undefined) {
          const trimmed = updates.title.trim();
          if (trimmed) validTitle = trimmed;
        }

        let validDueDate = t.dueDate;
        if (updates.dueDate !== undefined) {
          if (updates.dueDate !== null && !DATE_REGEX.test(updates.dueDate)) {
            throw new Error('Invalid due date format. Expected YYYY-MM-DD.');
          }
          validDueDate = updates.dueDate;
        }

        let isTaskCompleted = updates.completed !== undefined ? updates.completed : t.completed;
        let taskCompletedAt = updates.completedAt !== undefined ? updates.completedAt : t.completedAt;

        if (updates.subtasks !== undefined) {
          const subs = updates.subtasks;
          const allCompleted = subs.length > 0 && subs.every((s) => s.completed);
          const anyIncomplete = subs.some((s) => !s.completed);

          if (allCompleted) {
            isTaskCompleted = true;
            taskCompletedAt = t.completedAt || new Date().toISOString();
          } else if (anyIncomplete) {
            isTaskCompleted = false;
            taskCompletedAt = null;
          }
        }

        return {
          ...t,
          ...updates,
          title: validTitle,
          dueDate: validDueDate,
          completed: isTaskCompleted,
          completedAt: taskCompletedAt,
          updatedAt: new Date().toISOString(),
        };
      }
      return t;
    });
    persistTasks(next);
  };

  const deleteTask = (id: string) => {
    const next = tasks.filter((t) => t.id !== id);
    persistTasks(next);
  };

  const toggleTaskCompletion = (id: string) => {
    const next = tasks.map((t) => {
      if (t.id === id) {
        const willComplete = !t.completed;
        return {
          ...t,
          completed: willComplete,
          completedAt: willComplete ? new Date().toISOString() : null,
          // If completing parent task, complete all subtasks
          subtasks: willComplete
            ? t.subtasks.map((s) => ({ ...s, completed: true, completedAt: s.completedAt || new Date().toISOString() }))
            : t.subtasks,
          updatedAt: new Date().toISOString(),
        };
      }
      return t;
    });
    persistTasks(next);
  };

  const addSubtask = (taskId: string, title: string) => {
    const trimmedTitle = title.trim();
    if (!trimmedTitle) return;
    const newSub: Subtask = {
      id: `sub-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: trimmedTitle,
      completed: false,
      completedAt: null,
    };

    const next = tasks.map((t) => {
      if (t.id === taskId) {
        return {
          ...t,
          subtasks: [...t.subtasks, newSub],
          completed: false,
          completedAt: null,
          updatedAt: new Date().toISOString(),
        };
      }
      return t;
    });
    persistTasks(next);
  };

  const toggleSubtask = (taskId: string, subtaskId: string) => {
    const next = tasks.map((t) => {
      if (t.id === taskId) {
        const updatedSubs = t.subtasks.map((s) => {
          if (s.id === subtaskId) {
            const nextComp = !s.completed;
            return {
              ...s,
              completed: nextComp,
              completedAt: nextComp ? new Date().toISOString() : null,
            };
          }
          return s;
        });

        const allCompleted = updatedSubs.length > 0 && updatedSubs.every((s) => s.completed);
        const anyIncomplete = updatedSubs.some((s) => !s.completed);

        // If all subtasks complete, complete task.
        // If any subtask is unchecked on a previously completed task, reopen task.
        const shouldBeCompleted = allCompleted ? true : anyIncomplete ? false : t.completed;

        return {
          ...t,
          subtasks: updatedSubs,
          completed: shouldBeCompleted,
          completedAt: shouldBeCompleted
            ? (t.completedAt || new Date().toISOString())
            : null,
          updatedAt: new Date().toISOString(),
        };
      }
      return t;
    });
    persistTasks(next);
  };

  const deleteSubtask = (taskId: string, subtaskId: string) => {
    const next = tasks.map((t) => {
      if (t.id === taskId) {
        const remainingSubs = t.subtasks.filter((s) => s.id !== subtaskId);
        const allCompleted = remainingSubs.length > 0 && remainingSubs.every((s) => s.completed);

        return {
          ...t,
          subtasks: remainingSubs,
          completed: allCompleted ? true : (remainingSubs.length === 0 ? t.completed : t.completed),
          updatedAt: new Date().toISOString(),
        };
      }
      return t;
    });
    persistTasks(next);
  };

  const applyTemplate = (taskId: string, templateId: string) => {
    const tpl = TASK_TEMPLATES.find((t) => t.id === templateId);
    if (!tpl) return;

    const newSubtasks: Subtask[] = tpl.subtasks.map((title, idx) => ({
      id: `sub-tpl-${Date.now()}-${idx}`,
      title,
      completed: false,
      completedAt: null,
    }));

    const next = tasks.map((t) => {
      if (t.id === taskId) {
        return {
          ...t,
          subtasks: [...t.subtasks, ...newSubtasks],
          updatedAt: new Date().toISOString(),
        };
      }
      return t;
    });
    persistTasks(next);
  };

  const setFocusPin = (taskId: string, isPinned: boolean) => {
    // Single focus pin at a time keeps clarity high
    const next = tasks.map((t) => {
      if (t.id === taskId) {
        return { ...t, isFocusPinned: isPinned, updatedAt: new Date().toISOString() };
      }
      return isPinned ? { ...t, isFocusPinned: false } : t;
    });
    persistTasks(next);
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        filteredTasks,
        recommendation,
        searchQuery,
        setSearchQuery,
        statusFilter,
        setStatusFilter,
        priorityFilter,
        setPriorityFilter,
        sortOption,
        setSortOption,
        createTask,
        updateTask,
        deleteTask,
        toggleTaskCompletion,
        addSubtask,
        toggleSubtask,
        deleteSubtask,
        applyTemplate,
        setFocusPin,
        reloadFromStorage,
        persistenceError,
        clearPersistenceError,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
};

export const useTasks = () => {
  const ctx = useContext(TaskContext);
  if (!ctx) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return ctx;
};
