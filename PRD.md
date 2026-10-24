# Product Requirements Document (PRD) — ClearStep

**Product:** ClearStep  
**Tagline:** Less overwhelm. One clear next step.  
**Version:** 1.0.0 (MVP)  
**Status:** Approved  
**Author:** Lead Autonomous Engineering Agent  
**Target Event:** Taskforge Hackathon  
**Target Delivery Date:** October 24, 2026 (Deadline: October 25, 2026, 2:30 AM IST)  

---

## 1. Problem Statement

Students, neurodivergent individuals (e.g., ADHD), and knowledge workers are frequently paralyzed by overwhelming backlogs. Traditional task management tools (Todoist, Jira, Notion) act as infinite accumulation sinks: they display dozens of simultaneous tasks with complex tags, sub-projects, and aggressive reminder badges.

When a student sits down to study, this flood of pending work triggers **executive dysfunction** and **backlog paralysis**. The user spends valuable mental energy trying to choose what to work on rather than actually working, or abandons the tool entirely.

## 2. Intended Users & Persona

### Primary Persona: Maya, 20-year-old Undergraduate Student
- **Profile:** Juggling 4 course modules, lab reports, exam revision, and personal responsibilities. Experiences task paralysis when viewing a list of 25 unorganized tasks.
- **Pain Points:** 
  - Freezes when looking at huge tasks like "Write Philosophy Essay".
  - Procrastinates deciding which assignment has higher true urgency.
  - Gets distracted during study sessions by social media or other tasks on the screen.
  - Feels guilty and anxious from "streak breaks" in gamified apps.
- **Core Need:** A tool that forces simplicity: decomposes huge mountains into small hills, points directly to the single next action to take right now, and gives a quiet, pressure-free focus space.

## 3. Jobs to be Done (JTBD)

1. **When** I feel paralyzed by my mounting assignments and deadlines, **I want to** deconstruct a large assignment into bite-sized 10-15 minute steps, **so that** I can start without fear.
2. **When** I sit down at my desk to work, **I want** the system to tell me the single best next step to take and explain why, **so that** I don't waste willpower deciding.
3. **When** I start working on that task, **I want to** hide all other pending tasks and run a calm, reliable timer, **so that** I stay immersed without distraction.
4. **When** I finish a study session, **I want to** see an honest record of what I accomplished, **so that** I feel legitimate momentum without fake gamification.

## 4. Product Scope & Priority (MoSCoW)

### Must Have (v1.0 MVP)
- **MUST-01: Task & Subtask Management** — Create, edit, complete, delete tasks; decompose into granular subtasks.
- **MUST-02: Next Best Action Engine** — Deterministic, transparent recommendation algorithm calculating urgency, priority, subtask readiness, and focus flags with explicit "Why this task?" explanations.
- **MUST-03: Quick Breakdown Templates** — Pre-populated subtask templates (Essay, Exam Prep, Project, Admin) for instant 1-click deconstruction.
- **MUST-04: Distraction-Free Focus Mode** — Single-action focus view with tab-inactivity resilient timer (using wall-clock timestamps `Date.now()`).
- **MUST-05: Real Progress Metrics** — Accurate logging of completed tasks, subtasks, and focused minutes without artificial streaks or shaming mechanics.
- **MUST-06: Local-First Persistence** — Complete offline capability using browser LocalStorage validated through strict Zod schemas with versioning and corrupted-state recovery.
- **MUST-07: Accessibility (a11y) First** — WCAG 2.2 AA compliant contrast, full keyboard navigation, visible focus rings, ARIA landmarks, and live regions.

### Should Have (v1.1)
- **SHOULD-01: Data Export/Import** — Complete JSON backup and restore capabilities for data sovereignty.
- **SHOULD-02: Sound Toggle** — Optional gentle audio chime upon focus completion (disabled by default; silent visual indicator standard).
- **SHOULD-03: Customizable Break Intervals** — Adjustable short and long break durations in preferences.

### Could Have (v2.0)
- **COULD-01: Calendar Sync** — Read-only iCal feed subscription.
- **COULD-02: Ambient Soundscape** — Offline white noise / brown noise generator.

### Won't Have (Explicit Out-of-Scope)
- **WON'T-01: Cloud accounts / Server authentication** — Eliminates auth fatigue, security surface, and privacy risks for students.
- **WON'T-02: Opaque generative AI chatbots** — Avoids nondeterministic advice, API failures, and hallucinated recommendations.
- **WON'T-03: Streak shaming / Gamified penalties** — Never induces guilt or punishment for taking a rest day.

## 5. Functional Requirements

### FR-01: Task Management
- System shall allow adding tasks with: Title (required, 1-120 chars), Description (optional, max 1000 chars), Priority (`urgent`, `high`, `medium`, `low`), Due Date (optional ISO date), Tags (optional string array).
- System shall validate all fields before state commitment.
- System shall support marking tasks as complete, reopening tasks, and deleting tasks.
- System shall calculate parent task progress as `(completedSubtasks / totalSubtasks) * 100%`.

### FR-02: Next Best Action Engine
- System shall compute a `recommendationScore` for every active (incomplete) task using the formula:
  $$\text{Score} = W_{\text{focus}} + W_{\text{overdue}} + W_{\text{dueToday}} + W_{\text{dueSoon}} + W_{\text{priority}} + W_{\text{progress}}$$
  - Focus Pin: $+100$ if marked as user focus.
  - Overdue: $+60$ if due date is before today.
  - Due Today: $+40$ if due date is today.
  - Due Soon (within 48h): $+20$.
  - Priority: Urgent ($+30$), High ($+20$), Medium ($+10$), Low ($+0$).
  - Subtask Readiness: $+10$ if partially underway ($>0\%$ subtasks completed).
- System shall select the highest scoring task as the Next Best Action.
- System shall produce a human-readable explanation string explaining the exact factors contributing to the choice.
- System shall allow manual override at any time.

### FR-03: Task Breakdown Templates
- System shall provide at least four built-in templates:
  1. **Research & Essay**: "Topic & thesis statement", "Gather 3 primary sources", "Outline key arguments", "Draft introduction & body", "Review against rubric & proofread".
  2. **Exam Preparation**: "Review syllabus objectives", "Create flashcards for key definitions", "Solve 3 practice questions", "Summarize difficult formulas", "Timed mock run".
  3. **Coding Project**: "Clarify requirements & constraints", "Design data structures", "Implement core logic", "Write unit tests", "Refactor and documentation".
  4. **Administrative**: "Gather documents", "Fill required form fields", "Double-check submission checklist", "Submit and archive confirmation".
- Applying a template shall append actionable subtasks to the task.

### FR-04: Inactivity-Resilient Focus Mode
- System shall provide a dedicated Focus view hiding all other backlog items.
- Focus timer shall track work duration using timestamp deltas:
  $$\text{Remaining} = \text{TargetDuration} - (\text{Now} - \text{StartTime} - \text{PausedDuration})$$
- When a browser tab is placed in background or throttled by OS sleep/battery saver, the timer shall immediately recalibrate to true elapsed wall-clock time upon wake.
- Supported modes: Focus (default 25m), Short Break (5m), Long Break (15m).
- Controls: Start, Pause, Resume, Reset, Complete Early, Skip to Break.

### FR-05: Real Progress & Activity Ledger
- Every completed focus session of $\ge 1$ minute shall record an immutable entry with `id`, `taskId`, `taskTitle`, `durationMinutes`, `completedAt`.
- Progress screen shall display:
  - Today's completed tasks and subtasks.
  - Total focused minutes logged today.
  - 7-day visual activity distribution.

### FR-06: Local-First Repository & Resilience
- All data stored under key `clearstep_v1_store`.
- Zod schema parses storage on application boot.
- If storage contains invalid data or schema version mismatch, the store shall back up corrupted data to `clearstep_backup_<timestamp>` and restore defaults with an in-app non-blocking alert.
- One-click JSON export and import with structural validation.

## 6. Non-Functional Requirements

- **Performance**: Initial paint under 500ms; zero noticeable UI lag during search or filtering ($< 16\text{ms}$ frame time).
- **Bundle Size**: Under 250KB gzipped (Vite optimized chunking).
- **Privacy**: Zero external analytics, tracking pixels, or third-party telemetry. 100% of data stays on the user's device.
- **Reliability**: 100% offline capability.
- **Maintainability**: Strict TypeScript (`noImplicitAny`, strict null checks), clear separation between domain logic, state hooks, and UI presentation.

## 7. Accessibility Objectives (WCAG 2.2 AA)

1. **Color Contrast**: Normal text minimum 4.5:1 against background; large text/icons minimum 3:1.
2. **Keyboard Focus**: Focus visible with crisp double-ring styling on all interactive controls.
3. **Screen Readers**: Semantic headings `h1`..`h3`, `aria-live="polite"` on timer updates and next-action changes, accessible modal dialogs with focus trap.
4. **Reduced Motion**: All transitions and pulses disabled when `prefers-reduced-motion: reduce` or the user setting is active.
5. **Shortcuts**: Global accessible shortcuts:
   - `/`: Focus search
   - `n`: Open new task dialog
   - `f`: Enter focus mode on current Next Action
   - `Escape`: Close modals or return to overview

## 8. Acceptance Criteria (Sample)

| ID | Description | Acceptance Criteria |
|----|-------------|---------------------|
| AC-01 | Create Task with Subtasks | User can create "History Paper" with 3 subtasks. Subtask count shows `0/3 (0%)`. |
| AC-02 | Deterministic Recommendation | Given Task A (urgent, due today) and Task B (low, due next week), Task A is highlighted as Next Action with label "Urgent priority & due today". |
| AC-03 | Inactivity Timer Accuracy | Start a 25m timer, switch browser tab for 2 minutes, return. Remaining time shows 23m elapsed accurately. |
| AC-04 | Malformed LocalStorage Recovery | Manually setting `clearstep_v1_store` to invalid JSON triggers recovery notification, restores initial state, and does not crash the React app. |
| AC-05 | Keyboard Operability | A user can navigate from Home to Task List, create a task, and launch Focus mode using only the keyboard. |

---
*End of PRD*
