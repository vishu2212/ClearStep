import { z } from 'zod';

// Subtask Schema
export const SubtaskSchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'Title cannot be empty').max(120),
  completed: z.boolean().default(false),
  completedAt: z.string().nullable().default(null),
});

export type Subtask = z.infer<typeof SubtaskSchema>;

// Task Priority
export const TaskPrioritySchema = z.enum(['low', 'medium', 'high', 'urgent']);
export type TaskPriority = z.infer<typeof TaskPrioritySchema>;

// Task Schema
export const TaskSchema = z.object({
  id: z.string(),
  title: z.string().min(1, 'Task title is required').max(120),
  description: z.string().max(1000).default(''),
  priority: TaskPrioritySchema.default('medium'),
  dueDate: z.string().nullable().default(null), // YYYY-MM-DD
  tags: z.array(z.string().max(30)).default([]),
  subtasks: z.array(SubtaskSchema).default([]),
  completed: z.boolean().default(false),
  completedAt: z.string().nullable().default(null),
  createdAt: z.string(),
  updatedAt: z.string(),
  isFocusPinned: z.boolean().default(false),
});

export type Task = z.infer<typeof TaskSchema>;

// Focus Session Record Schema
export const FocusModeSchema = z.enum(['focus', 'shortBreak', 'longBreak']);
export type FocusMode = z.infer<typeof FocusModeSchema>;

export const FocusSessionSchema = z.object({
  id: z.string(),
  taskId: z.string().nullable(),
  taskTitle: z.string(),
  mode: FocusModeSchema,
  durationMinutes: z.number().int().min(1),
  completedAt: z.string(),
});

export type FocusSession = z.infer<typeof FocusSessionSchema>;

// User Preferences Schema
export const ThemeModeSchema = z.enum(['system', 'light', 'dark']);
export type ThemeMode = z.infer<typeof ThemeModeSchema>;

export const UserPreferencesSchema = z.object({
  focusDuration: z.number().int().min(5).max(120).default(25),
  shortBreakDuration: z.number().int().min(1).max(30).default(5),
  longBreakDuration: z.number().int().min(5).max(60).default(15),
  theme: ThemeModeSchema.default('system'),
  reducedMotion: z.boolean().default(false),
  highContrastFocus: z.boolean().default(false),
  soundAlerts: z.boolean().default(false),
});

export type UserPreferences = z.infer<typeof UserPreferencesSchema>;

// Root App Store Schema
export const AppStoreSchema = z.object({
  schemaVersion: z.literal(1),
  tasks: z.array(TaskSchema),
  sessions: z.array(FocusSessionSchema),
  preferences: UserPreferencesSchema,
  lastUpdated: z.string(),
});

export type AppStore = z.infer<typeof AppStoreSchema>;

// Next Best Action Calculation Result
export interface RecommendationResult {
  recommendedTask: Task | null;
  recommendedSubtask: Subtask | null;
  score: number;
  rationale: string;
}

// Filter and Sort Options
export type TaskStatusFilter = 'all' | 'active' | 'completed' | 'due-today';
export type TaskPriorityFilter = 'all' | TaskPriority;
export type TaskSortOption = 'recommended' | 'dueDate' | 'priority' | 'alphabetical' | 'createdAt';
