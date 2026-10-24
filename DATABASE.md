# Data Architecture & Storage Specification — ClearStep

**Product:** ClearStep  
**Document:** `DATABASE.md`  
**Storage Engine:** Browser Web Storage (`window.localStorage`)  
**Schema Validator:** Zod  
**Version:** 1.0.0  
**Storage Scope:** Client-Local Only (No server, no cross-device sync)  

---

## 1. Storage Overview

ClearStep adopts a **local-first, browser-local persistence architecture**. All tasks, subtasks, focus sessions, and user preferences reside entirely within the user's browser `localStorage`. 

> [!NOTE]
> ClearStep does not use an external SQL or NoSQL database server. Storage is private, client-local, and limited to approximately 5MB by the browser's origin quota. Data does not synchronize across different browsers or devices unless the user explicitly exports and imports a JSON backup.

---

## 2. Schema Definition (Zod Model)

### 2.1 Subtask Schema
```typescript
import { z } from 'zod';

export const SubtaskSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1, 'Title is required').max(120),
  completed: z.boolean().default(false),
  completedAt: z.string().datetime().nullable().default(null),
});

export type Subtask = z.infer<typeof SubtaskSchema>;
```

### 2.2 Task Schema
```typescript
export const TaskPrioritySchema = z.enum(['low', 'medium', 'high', 'urgent']);
export type TaskPriority = z.infer<typeof TaskPrioritySchema>;

export const TaskSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1, 'Title is required').max(120),
  description: z.string().max(1000).default(''),
  priority: TaskPrioritySchema.default('medium'),
  dueDate: z.string().nullable().default(null), // ISO Date string (YYYY-MM-DD)
  tags: z.array(z.string().max(30)).default([]),
  subtasks: z.array(SubtaskSchema).default([]),
  completed: z.boolean().default(false),
  completedAt: z.string().datetime().nullable().default(null),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  isFocusPinned: z.boolean().default(false),
});

export type Task = z.infer<typeof TaskSchema>;
```

### 2.3 Focus Session Record Schema
```typescript
export const FocusSessionSchema = z.object({
  id: z.string().uuid(),
  taskId: z.string().uuid().nullable(),
  taskTitle: z.string(),
  mode: z.enum(['focus', 'shortBreak', 'longBreak']),
  durationMinutes: z.number().int().min(1),
  completedAt: z.string().datetime(),
});

export type FocusSession = z.infer<typeof FocusSessionSchema>;
```

### 2.4 User Preferences Schema
```typescript
export const UserPreferencesSchema = z.object({
  focusDuration: z.number().int().min(5).max(120).default(25),
  shortBreakDuration: z.number().int().min(1).max(30).default(5),
  longBreakDuration: z.number().int().min(5).max(60).default(15),
  theme: z.enum(['system', 'light', 'dark']).default('system'),
  reducedMotion: z.boolean().default(false),
  highContrastFocus: z.boolean().default(false),
  soundAlerts: z.boolean().default(false),
});

export type UserPreferences = z.infer<typeof UserPreferencesSchema>;
```

### 2.5 Root App Store Schema
```typescript
export const AppStoreSchema = z.object({
  schemaVersion: z.literal(1),
  tasks: z.array(TaskSchema),
  sessions: z.array(FocusSessionSchema),
  preferences: UserPreferencesSchema,
  lastUpdated: z.string().datetime(),
});

export type AppStore = z.infer<typeof AppStoreSchema>;
```

---

## 3. Storage Keys & Lifecycle

| Storage Key | Content | Purpose |
|-------------|---------|---------|
| `clearstep_v1_store` | JSON string matching `AppStoreSchema` | Canonical store containing all active tasks, history, and preferences. |
| `clearstep_backup_<timestamp>` | Raw string (unvalidated snapshot) | Created automatically prior to restoring defaults if corruption is detected. |

---

## 4. Error Handling & Malformed Data Recovery

1. **Boot Inspection:**  
   During app startup, the repository calls `localStorage.getItem('clearstep_v1_store')`.
2. **Safe Parse:**  
   The raw JSON string is parsed and evaluated via `AppStoreSchema.safeParse(data)`.
3. **Recovery Sequence:**  
   - **Case A: Clean Boot (Success)** → The state is loaded into React Context.
   - **Case B: First Time Visit (Null)** → Default starter seed data is written and loaded.
   - **Case C: Malformed JSON or Schema Incompatibility (Failure)** → 
     1. The unparseable data is preserved in `localStorage.setItem('clearstep_backup_' + Date.now(), raw)`.
     2. A valid store is initialized with clean defaults.
     3. An in-app banner notifies the user: *"Your local data could not be parsed and has been safely archived to backup. Default settings restored."*

---

## 5. Storage Limitations & Data Sovereignty

- **Storage Limit:** Standard browsers enforce a 5MB to 10MB limit per origin. With minimal JSON payloads, ClearStep can store over 10,000 tasks and 50,000 session records without exceeding 1.5MB.
- **Data Export & Import:** Users can export the complete database as a readable `.json` file (`clearstep_backup_YYYY-MM-DD.json`) and import it on any device running ClearStep.

---
*End of DATABASE.md*
