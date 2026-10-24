# Roadmap: ClearStep

## Overview

ClearStep is built across 5 focused, sequential phases. The progression moves from a resilient local-first application shell to the core task breakdown and recommendation engine, followed by an inactivity-resilient focus session and progress ledger, comprehensive accessibility and preferences controls, and finally thorough automated testing, CodeRabbit review, and hackathon submission readiness.

## Phases

- [ ] **Phase 1: Foundation & Application Shell** — Vite + React + TypeScript + Tailwind CSS architecture with Zod-validated local persistence, accessible design system, and responsive shell.
- [ ] **Phase 2: Task Management & Next Best Action Engine** — Complete task CRUD, subtask checklist with templates, and deterministic, explainable Next Best Action engine.
- [ ] **Phase 3: Focus Mode & Progress Analytics** — Single-task focus view, timestamp-delta background timer, gentle completion alerts, and honest progress tracking.
- [ ] **Phase 4: User Preferences & Accessibility Refinement** — Timer configuration, calm color themes, keyboard navigation shortcuts, ARIA semantics, and reduced motion.
- [ ] **Phase 5: Verification, Code Review & Submission Delivery** — Automated test suite execution, CodeRabbit review and fix cycle, production build verification, and all mandatory project documentation.

## Phase Details

### Phase 1: Foundation & Application Shell
**Goal**: Establish a modern, strictly typed React + Vite application with Tailwind CSS, accessible base tokens, and a versioned, fault-tolerant LocalStorage layer backed by Zod schemas.
**Depends on**: Nothing
**Requirements**: STORE-01, STORE-02, STORE-03
**Success Criteria**:
  1. Vite dev server and build succeed with zero TypeScript or styling errors.
  2. LocalStorage storage adapter parses data through Zod schemas with fallback recovery from corrupted state.
  3. Responsive navigation shell renders smoothly with high-contrast accessible typography.
**Plans**: 1 plan (01-01)

### Phase 2: Task Management & Next Best Action Engine
**Goal**: Implement complete task management with subtask hierarchy, deconstruction templates, and a transparent Next Best Action recommendation algorithm.
**Depends on**: Phase 1
**Requirements**: TASK-01, TASK-02, TASK-03, TASK-04, TASK-05, TASK-06, NBA-01, NBA-02, NBA-03, NBA-04
**Success Criteria**:
  1. User can create, edit, filter, search, sort, and complete tasks and subtasks.
  2. Pre-built task breakdown templates instantly populate actionable subtasks.
  3. The Next Best Action card highlights the highest-priority action and clearly explains why it was chosen.
**Plans**: 1 plan (02-01)

### Phase 3: Focus Mode & Progress Analytics
**Goal**: Provide a distraction-reduced single-task focus environment with an inactivity-resilient timer and verifiable session tracking.
**Depends on**: Phase 2
**Requirements**: FOCUS-01, FOCUS-02, FOCUS-03, FOCUS-04, FOCUS-05, PROG-01, PROG-02
**Success Criteria**:
  1. Focus Mode isolates the selected task and its immediate next subtask.
  2. The timer calculates elapsed time against absolute timestamps (`Date.now()`), avoiding background tab drift.
  3. Completed focus sessions log verified minutes and tasks into the progress summary without fake streaks.
**Plans**: 1 plan (03-01)

### Phase 4: User Preferences & Accessibility Refinement
**Goal**: Implement user preferences, themes, complete keyboard shortcuts, and WCAG AA accessibility controls.
**Depends on**: Phase 3
**Requirements**: PREF-01, PREF-02, A11Y-01, A11Y-02, A11Y-03, A11Y-04
**Success Criteria**:
  1. User can adjust focus/break durations, switch between Calm Light/Dark themes, and toggle reduced motion.
  2. Global keyboard shortcuts (`/` for search, `n` for new task, `f` for focus mode, `Esc` to close) operate smoothly.
  3. Visible focus rings, screen reader announcements (`aria-live`), and semantic HTML elements verify clean accessibility.
**Plans**: 1 plan (04-01)

### Phase 5: Verification, Code Review & Submission Delivery
**Goal**: Run comprehensive automated unit and component tests, run CodeRabbit code review, verify the production build, and deliver all 7 project specification documents.
**Depends on**: Phase 4
**Requirements**: TEST-01, TEST-02, TEST-03, TEST-04
**Success Criteria**:
  1. Vitest test suites pass with 100% success across scoring, timers, and storage models.
  2. CodeRabbit review evaluates changes and any flagged defects are resolved cleanly.
  3. Production build (`npm run build`) generates clean distribution artifacts.
  4. PRD.md, DESIGN.md, ARCHITECTURE.md, DATABASE.md, API.md, AGENTS.md, and README.md are complete and accurate.
**Plans**: 1 plan (05-01)

---
*Roadmap defined: 2026-10-23*
