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

interface CreateTaskInput {
  title: string;
  description?: string;
  priority?: TaskPriority;
  dueDate?: string | null;
  tags?: string[];
  subtasks?: string[];
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
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>(() => loadFromLocalStorage().store.tasks);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<TaskStatusFilter>('all');
  const [priorityFilter, setPriorityFilter] = useState<TaskPriorityFilter>('all');
  const [sortOption, setSortOption] = useState<TaskSortOption>('recommended');

  const persistTasks = (updater: Task[] | ((prev: Task[]) => Task[])) => {
    setTasks((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      const store = loadFromLocalStorage().store;
      store.tasks = next;
      saveToLocalStorage(store);
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
    const newTask: Task = {
      id: `task-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      title: input.title.trim(),
      description: input.description?.trim() || '',
      priority: input.priority || 'medium',
      dueDate: input.dueDate || null,
      tags: input.tags || [],
      subtasks: (input.subtasks || []).map((st, idx) => ({
        id: `sub-${Date.now()}-${idx}`,
        title: st.trim(),
        completed: false,
        completedAt: null,
      })),
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
        return {
          ...t,
          ...updates,
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
    if (!title.trim()) return;
    const newSub: Subtask = {
      id: `sub-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      title: title.trim(),
      completed: false,
      completedAt: null,
    };

    const next = tasks.map((t) => {
      if (t.id === taskId) {
        return {
          ...t,
          subtasks: [...t.subtasks, newSub],
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

        // If all subtasks completed, auto-complete parent task
        const allCompleted = updatedSubs.length > 0 && updatedSubs.every((s) => s.completed);

        return {
          ...t,
          subtasks: updatedSubs,
          completed: allCompleted ? true : t.completed,
          completedAt: allCompleted ? (t.completedAt || new Date().toISOString()) : (t.completed ? t.completedAt : null),
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
        return {
          ...t,
          subtasks: t.subtasks.filter((s) => s.id !== subtaskId),
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
