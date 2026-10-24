# Internal Application Services & API Reference — ClearStep

**Product:** ClearStep  
**Document:** `API.md`  
**Architecture Type:** Client-Side Single Page Application (Local-First)  
**Public HTTP Endpoints:** None (Frontend-only application; no external backend server)  

---

## 1. Architectural Scope

> [!NOTE]
> ClearStep is a local-first application running 100% in the user's browser. There are no remote HTTP endpoints, REST APIs, or GraphQL servers. All interactions occur through typed TypeScript domain interfaces and internal application services.

---

## 2. Core Service Interfaces

### 2.1 Task Service (`ITaskService`)

Handles creation, modification, deletion, subtask manipulation, and searching.

```typescript
export interface ITaskService {
  /**
   * Retrieves all tasks currently persisted in local storage.
   */
  getAllTasks(): Task[];

  /**
   * Creates a new task with validated inputs.
   */
  createTask(input: CreateTaskInput): Task;

  /**
   * Updates an existing task by ID.
   */
  updateTask(id: string, updates: Partial<Task>): Task;

  /**
   * Toggles task completion state.
   */
  toggleTaskCompletion(id: string): Task;

  /**
   * Permanently deletes a task.
   */
  deleteTask(id: string): void;

  /**
   * Appends a new subtask to a parent task.
   */
  addSubtask(taskId: string, title: string): Task;

  /**
   * Toggles a subtask's completion state.
   */
  toggleSubtask(taskId: string, subtaskId: string): Task;

  /**
   * Deletes a subtask from a parent task.
   */
  deleteSubtask(taskId: string, subtaskId: string): Task;

  /**
   * Applies a pre-built deconstruction template to a task.
   */
  applyTemplate(taskId: string, templateKey: TemplateKey): Task;

  /**
   * Toggles manual Focus Pin on a specific task.
   */
  setFocusPin(taskId: string, isPinned: boolean): Task;
}
```

---

### 2.2 Recommendation Service (`IRecommendationService`)

Provides deterministic evaluation of backlog items to produce the Next Best Action.

```typescript
export interface RecommendationResult {
  recommendedTask: Task | null;
  recommendedSubtask: Subtask | null;
  score: number;
  rationale: string;
}

export interface IRecommendationService {
  /**
   * Calculates the top recommended action from an array of tasks.
   * Deterministic scoring based on: Focus Pin (+100), Overdue (+60),
   * Due Today (+40), Due Soon (+20), Priority tier (+30..0), Progress (+10).
   */
  calculateNextBestAction(tasks: Task[]): RecommendationResult;
}
```

---

### 2.3 Focus Timer Service (`ITimerService`)

Provides background-inactivity-resilient timer calculations.

```typescript
export type TimerMode = 'focus' | 'shortBreak' | 'longBreak';

export interface TimerState {
  mode: TimerMode;
  targetDurationSeconds: number;
  remainingSeconds: number;
  isRunning: boolean;
  activeTaskId: string | null;
  activeTaskTitle: string | null;
}

export interface ITimerService {
  startTimer(taskId?: string, taskTitle?: string): void;
  pauseTimer(): void;
  resumeTimer(): void;
  resetTimer(): void;
  switchMode(mode: TimerMode): void;
  completeSession(): FocusSession;
}
```

---

### 2.4 Storage & Backup Service (`IStorageService`)

Manages versioned browser storage, schema validation, and recovery.

```typescript
export interface IStorageService {
  loadStore(): AppStore;
  saveStore(store: AppStore): void;
  exportBackupJson(): string;
  importBackupJson(jsonString: string): { success: boolean; error?: string };
  resetToDefaults(): AppStore;
}
```

---
*End of API.md*
