# ClearStep

## What This Is

ClearStep is an accessible, local-first productivity web application designed to eliminate cognitive overwhelm for students and overwhelmed individuals. Rather than bombarding users with endless to-do lists, ClearStep breaks complex responsibilities into manageable subtasks, deterministically recommends one clear Next Best Action, offers a distraction-reduced Focus Mode with an inactivity-resilient timer, and tracks progress honestly without manipulative gamification.

## Core Value

Make the single next useful action undeniably clear, accessible, and achievable.

## Business Context

- **Customer**: Students, neurodivergent learners, and knowledge workers suffering from task paralysis and backlog fatigue.
- **Revenue model**: Open-source hackathon prototype / free accessible utility.
- **Success metric**: Task initiation rate (time from opening the app to starting the first focus action < 30 seconds).
- **Strategy notes**: Built for the Taskforge Hackathon (Deadline: Oct 25, 2026, 2:30 AM IST).

## Requirements

### Validated

(None yet — ship to validate)

### Active

- [ ] Complete Task CRUD: Create, edit, complete, reopen, delete tasks with title, description, priority, deadline, and tags.
- [ ] Subtask Management: Add, edit, check off, and reorder subtasks; calculate granular task progress.
- [ ] Next Best Action Engine: Transparent, deterministic prioritization scoring based on focus flag, urgency/due date, priority weight, and progress state, with an explicit explanation of why it is chosen.
- [ ] Task Breakdown Templates: Pre-built, scaffolded study/assignment checklists for quick deconstruction.
- [ ] Distraction-Reduced Focus Mode: Single-task view with configurable Pomodoro/focus timer, elapsed-time accuracy during background tab inactivity, and gentle completion/break alerts without intrusive sounds.
- [ ] Accurate Progress Metrics: Persisted statistics showing completed tasks, subtasks completed, and focused minutes without falsified streaks.
- [ ] User Preferences: Configurable timer lengths (focus/break), theme preferences, and accessibility toggles (reduced motion, high contrast, readable typography).
- [ ] Resilient Local-First Persistence: LocalStorage repository with Zod schema validation, schema versioning, and auto-recovery from malformed state.
- [ ] Rigorous Accessibility (a11y): Full keyboard navigation, visible focus rings, ARIA landmarks and live regions, screen reader compatibility, and WCAG AA contrast.
- [ ] Comprehensive Test Suite: Automated unit, integration, and accessibility tests using Vitest and React Testing Library.

### Out of Scope

- Cloud sync / External account authentication — keep local-first, privacy-respecting, and zero-latency for MVP.
- Intrusive push notifications / Aggressive streak penalty mechanisms — contrary to cognitive accessibility and calmness.
- Hallucinatory generative AI chatbots — all recommendation logic must remain deterministic and verifiable.

## Context

- Hackathon environment: Taskforge Hackathon.
- Target audience: Students facing deadline panic and executive dysfunction.
- Tech stack: React 19 / TypeScript / Vite / Tailwind CSS / Lucide React / Zod / Vitest.

## Constraints

- **Platform**: Web browser (Chrome, Edge, Firefox, Safari).
- **Architecture**: Local-first browser storage; no external server dependencies required for core functionality.
- **Accessibility**: Strict WCAG 2.2 AA compliance (color contrast, keyboard navigability, screen-reader semantics).
- **Deadline**: October 25, 2026 at 2:30 AM IST.

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Local-first with Zod validation | Eliminates auth friction and backend latency; ensures 100% privacy and offline reliability | ✓ Good |
| Deterministic Next Action rule engine | Transparent and predictable; students need to know *why* a task is suggested, not a black-box AI guess | ✓ Good |
| Web Workers / Date-delta timer | Avoids timer throttling when browser tabs are in the background or minimized | ✓ Good |
| Tailwind CSS design tokens | Ensures consistent spacing, typography hierarchy, and effortless reduced-motion support | ✓ Good |

---
*Last updated: 2026-10-23 after initialization*
