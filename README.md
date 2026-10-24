# ClearStep — Less Overwhelm. One Clear Next Step.

> **Taskforge Hackathon Submission**  
> An accessible, local-first web application designed to conquer task paralysis and cognitive overwhelm for students.

---

## 1. Project Overview

Students and overwhelmed individuals face a recurring barrier: **executive dysfunction and backlog paralysis**. Traditional to-do managers function as bottomless accumulation pits, displaying dozens of competing assignments simultaneously. This flood of pending work forces the user to expend mental willpower just deciding what to work on, or triggers complete avoidance.

**ClearStep reverses this dynamic:**
1. **Deconstructs Mountains:** Breaks large, frightening assignments into 10–15 minute micro-steps using 1-click breakdown templates (Essays, Exams, Projects, Admin).
2. **Recommends One Next Action:** Uses a transparent, deterministic prioritization engine that highlights the single best task to start right now—and explains *why* in plain language.
3. **Calm Focus Space:** Hides the rest of the backlog behind a distraction-reduced Focus Mode with an inactivity-resilient timer that never drifts when browser tabs sleep.
4. **Zero Guilt & Real Progress:** Tracks real completed effort without artificial streaks, manipulative gamification, or shaming mechanics.

---

## 2. Core Features

- **Next Best Action Hero:** A prominent recommendation card with a transparent rationale (e.g., *"Why now: Overdue by 1 day & high priority • Momentum: 2/4 subtasks done"*).
- **Subtask Checklist & Quick Templates:** 1-click templates for Research Papers, Exam Prep, Software Milestones, and Administrative Applications.
- **Inactivity-Resilient Focus Timer:** Computes remaining time from wall-clock timestamp differences (`Date.now() - startTime`), preventing drift when tabs are backgrounded or minimized.
- **Local-First & 100% Offline:** Runs entirely client-side in the browser. Zero account registration required, zero network latency, zero data exfiltration.
- **Fault-Tolerant Persistence:** Validates all storage via strict Zod schemas (`clearstep_v1_store`). If corrupted data is ever encountered, it archives the snapshot to `clearstep_backup_<timestamp>` and reinitializes defaults without crashing.
- **Accessibility by Design (WCAG 2.2 AA):** High-contrast color palette, visible double-ring focus states, screen reader landmarks, polite live regions (`aria-live="polite"`), and explicit reduced-motion support.
- **Global Keyboard Shortcuts:**
  - `/` — Focus search bar
  - `n` — Create new task
  - `f` — Enter focus mode
  - `Space` — Start / Pause focus timer
  - `Esc` — Close modal or return to overview

---

## 3. Technology Stack

- **Framework:** React 19, TypeScript (Strict Mode enabled, `noImplicitAny: true`)
- **Build Tool:** Vite
- **Styling:** Tailwind CSS (custom semantic tokens, responsive layouts, CSS variables)
- **Icons:** Lucide React
- **Validation:** Zod
- **Testing:** Vitest, React Testing Library, jsdom
- **Code Review:** CodeRabbit CLI (`npx --yes coderabbit review --agent`)

---

## 4. Getting Started & Local Reproduction

### Prerequisites
- Node.js v18+ (tested on Node.js v24.21.0)
- npm 9+ (tested on npm 11.19.0)
- Any modern web browser (Edge, Chrome, Firefox, Safari)

### Quick Setup (PowerShell / Bash)

```powershell
# 1. Clone repository
git clone https://github.com/vishu2212/ClearStep.git
cd ClearStep

# 2. Install dependencies
npm install

# 3. Start local development server
npm run dev
```

The application will be live at `http://localhost:5173`.

---

## 5. Verification & Testing

ClearStep includes comprehensive unit, domain, and integration test suites:

```powershell
# Run automated Vitest test suites
npm run test

# Run TypeScript strict typecheck
npx tsc --noEmit

# Run production build
npm run build
```

### Verified Test Coverage
- `src/test/recommendationEngine.test.ts`: Deterministic scoring rules, priority weighting, due-date urgency, tie-breakers, and plain-English rationale generation.
- `src/test/timerCalculations.test.ts`: Timestamp-delta elapsed time calculation, background tab drift immunity, MM:SS formatting, and percentage math.
- `src/test/localStorageRepo.test.ts`: Zod schema validation, default seed generation, corrupted state recovery with automatic backup archiving, and JSON export/import.
- `src/test/App.test.tsx`: Component integration, tab switching, search filtering, focus launching, and accessible modal lifecycles.

---

## 6. Architecture & System Design

```
src/
├── domain/                    # Pure TypeScript domain logic (zero React dependencies)
│   ├── types.ts               # Zod schemas & TypeScript types
│   ├── recommendationEngine.ts# Deterministic Next Best Action scoring
│   ├── templates.ts           # Pre-built task deconstruction checklists
│   └── timerCalculations.ts   # Wall-clock drift-resistant timer math
├── storage/                   # Local-first persistence
│   ├── localStorageRepo.ts    # Safe typed repository with schema validation
│   └── seedData.ts            # Starter student tasks for first-time use
├── context/                   # React Context Providers & Reducers
│   ├── TaskContext.tsx        # Tasks, subtasks, search, filter, sort
│   ├── TimerContext.tsx       # Focus sessions, background timer sync
│   └── PreferencesContext.tsx # User theme, timer durations, accessibility
├── components/                # Modular UI Components
│   ├── common/                # Button, Modal, Badge, ProgressBar
│   ├── layout/                # Navbar, CorruptionAlert
│   ├── nextAction/            # NextActionHero card
│   ├── tasks/                 # TaskCard, TaskFilterBar, TaskModal
│   ├── focus/                 # FocusModeView
│   ├── progress/              # ProgressView (Stats & 7-Day Chart)
│   └── settings/              # SettingsView (Preferences & Backup)
├── App.tsx                    # Top-level coordinator & keyboard listener
└── main.tsx                   # React root entry point
```

For in-depth architectural and design contracts, see:
- [`PRD.md`](./PRD.md) — Product Requirements & User Stories
- [`DESIGN.md`](./DESIGN.md) — Visual Design System & Component Contracts
- [`ARCHITECTURE.md`](./ARCHITECTURE.md) — System Boundaries & State Flow
- [`DATABASE.md`](./DATABASE.md) — Local Storage Schemas & Recovery Protocols
- [`API.md`](./API.md) — Internal Application Service Interfaces
- [`AGENTS.md`](./AGENTS.md) — Agent Guidelines & Definition of Done

---

## 7. Accessibility (WCAG 2.2 AA) Highlights

1. **Color Contrast:** All body text meets or exceeds a 4.5:1 contrast ratio against light (`#F8FAFC`) and dark (`#090D16`) surfaces.
2. **Focus Visibility:** Every button, input, and tab features an active double-ring focus indicator (`focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2`).
3. **Motion Sensitivity:** Respects system `prefers-reduced-motion` settings and provides an in-app toggle to instantly disable all animations.
4. **Screen Reader Support:** Semantic HTML landmarks (`header`, `main`, `nav`, `section`, `footer`), polite live regions (`aria-live="polite"`) for timer updates, and modal focus trapping.

---

## 8. Limitations & Future Roadmap

- **Single Device Scope:** ClearStep currently operates locally per browser origin. Future v2 releases may add end-to-end encrypted peer-to-peer WebRTC synchronization.
- **Audio Prompts:** Sound notifications are disabled by default for sensory calm; customizable sound cues are planned for future versions.

---

## 9. AI Assistance Disclosure & License

ClearStep was engineered for the Taskforge Hackathon using the GSD Core v1.18.0 meta-prompting workflow, with automated code review and security audits conducted via CodeRabbit.

Licensed under the [MIT License](./LICENSE).
