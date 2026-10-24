# Requirements: ClearStep

**Defined:** 2026-10-23
**Core Value:** Make the single next useful action undeniably clear, accessible, and achievable.

## v1 Requirements

### Task Management (TASK)

- [ ] **TASK-01**: User can create a new task with title, optional description, priority (low, medium, high, urgent), optional due date, and category tags.
- [ ] **TASK-02**: User can edit any attribute of an existing task.
- [ ] **TASK-03**: User can mark tasks as completed, reopen completed tasks, and permanently delete tasks with confirmation.
- [ ] **TASK-04**: User can break tasks down into discrete subtasks with individual completion checkmarks.
- [ ] **TASK-05**: User can apply pre-built breakdown templates (e.g., Essay/Assignment, Exam Prep, Project Milestone, Administrative Task) to rapidly generate actionable subtasks.
- [ ] **TASK-06**: User can search tasks in real-time, filter by status (All, Active, Completed, Due Today) and priority, and sort by due date, priority, or title.

### Next Best Action Engine (NBA)

- [ ] **NBA-01**: Application evaluates active tasks with a deterministic scoring algorithm incorporating priority weight, due date urgency (overdue, due today, due soon), remaining subtasks, and manual "Focus Task" designation.
- [ ] **NBA-02**: Prominent Next Action card displays the top recommended task and its first pending subtask.
- [ ] **NBA-03**: The Next Action card presents an explicit, plain-language reason explaining why this task is recommended (e.g., "Overdue by 1 day and high priority", "Due today with 2 subtasks remaining").
- [ ] **NBA-04**: User can manually override the recommendation by selecting another task or pinning their own focus task.

### Focus Mode & Inactivity-Resilient Timer (FOCUS)

- [ ] **FOCUS-01**: User can launch Focus Mode directly from the Next Action card or any individual task.
- [ ] **FOCUS-02**: Focus Mode provides a clean, single-task interface with minimal distractions, highlighting the active task and its next pending subtask.
- [ ] **FOCUS-03**: Configurable timer (Work / Short Break / Long Break) supports Start, Pause, Resume, Reset, and Skip Break.
- [ ] **FOCUS-04**: Timer computes elapsed time against absolute timestamps (`Date.now()`) to prevent timer throttling or drifting when browser tabs are in the background or minimized.
- [ ] **FOCUS-05**: Completing a focus session triggers a calm, non-intrusive notification banner and logs focus session duration to the progress ledger without audio jumps or autoplay.

### Progress & Reflection (PROG)

- [ ] **PROG-01**: Application computes verifiable metrics from persisted history: total tasks completed, total subtasks completed, and focused minutes logged.
- [ ] **PROG-02**: Progress screen shows today's completed items and a calm 7-day activity view based solely on real stored records (no manufactured streaks or shaming penalties).

### User Preferences & Accessibility (PREF / A11Y)

- [ ] **PREF-01**: User can customize default focus duration (15, 25, 45, 60 min) and break duration (5, 10, 15 min).
- [ ] **PREF-02**: User can select theme: System, Calm Light, Calm Dark.
- [ ] **A11Y-01**: Full keyboard navigation across all views (Tab, Shift+Tab, Enter, Space, Escape, and global shortcut `/` for search, `n` for new task, `f` for focus mode).
- [ ] **A11Y-02**: Visible, high-contrast focus indicators on all interactive elements with WCAG AA compliance (minimum 4.5:1 text contrast ratio).
- [ ] **A11Y-03**: Respects `prefers-reduced-motion` and provides an explicit toggle for motion reduction.
- [ ] **A11Y-04**: Proper ARIA landmarks (`role="main"`, `role="navigation"`), live regions for timer and task status updates (`aria-live="polite"`), and screen-reader accessible forms.

### Local-First Persistence & Reliability (STORE)

- [ ] **STORE-01**: All data (tasks, sessions, settings) is persisted in browser LocalStorage using typed Zod schemas with versioning (`schemaVersion: 1`).
- [ ] **STORE-02**: Safe parsing with graceful recovery: corrupt or unparseable local data falls back to default state without crashing the UI, alerting the user politely.
- [ ] **STORE-03**: User can export their data to JSON and import previously exported data.

### Automated Testing & Quality (TEST)

- [ ] **TEST-01**: Unit tests for Next Best Action scoring logic across all boundary conditions (overdue, same day, future, priorities).
- [ ] **TEST-02**: Unit tests for timer calculation and drift prevention logic.
- [ ] **TEST-03**: Component & integration tests for task creation, subtask toggling, search/filtering, and persistence recovery.
- [ ] **TEST-04**: Production build verification with strict TypeScript checks passing without warnings.

## Out of Scope

| Feature | Reason |
|---------|--------|
| Server-side authentication | Unnecessary barrier to entry; local-first offers zero-friction student access |
| Generative AI prompt calls | Unreliable, costly, non-deterministic; deterministic scoring guarantees predictable trust |
| Invasive push notifications & sound autoplay | Triggers anxiety and distraction in neurodivergent users |
| Streak freezing / penalty monetization | Manipulative dark patterns conflicting with accessibility principles |

## Traceability

| Requirement | Phase | Status |
|-------------|-------|--------|
| TASK-01..06 | Phase 2 | Pending |
| NBA-01..04  | Phase 2 | Pending |
| FOCUS-01..05| Phase 3 | Pending |
| PROG-01..02 | Phase 3 | Pending |
| PREF-01..02 | Phase 4 | Pending |
| A11Y-01..04 | Phase 4 | Pending |
| STORE-01..03| Phase 1 | Pending |
| TEST-01..04 | Phase 5 | Pending |

**Coverage:**
- v1 requirements: 24 total
- Mapped to phases: 24
- Unmapped: 0

---
*Requirements defined: 2026-10-23*
