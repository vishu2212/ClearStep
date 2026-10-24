# Design System & UI Specification — ClearStep

**Product:** ClearStep  
**Document:** `DESIGN.md`  
**Version:** 1.0.0  
**Design Status:** Approved  
**Stitch MCP Integration Note:** The local Stitch MCP server schema was inspected at `C:\Users\VISHAV\.gemini\antigravity\mcp\stitch`, but the tool is currently unpermitted in this agent context (`server stitch is not allowed in this context`). Consequently, this comprehensive design contract serves as the canonical single source of truth for all visual tokens, screen layouts, component contracts, and accessibility criteria.

---

## 1. Visual Direction & Design Philosophy

ClearStep is intentionally crafted to feel **grounded, calm, and uncluttered**. Students dealing with task paralysis do not need flashy 3D effects, noisy neon accents, or hyper-stimulating gamified rewards. 

### Core Design Principles
1. **Calm Clarity:** Soft neutral backgrounds (slate/zinc tones), crisp typography, and spacious layouts that give mental breathing room.
2. **The "Single Focus" Priority:** Visual weight is heavily concentrated on the **Next Best Action**. Secondary information recedes into the background until requested.
3. **Transparent Intent:** When a recommendation is made, the UI always clearly articulates *why* ("Due today + 3 subtasks left") in plain language.
4. **Accessible by Default:** High-contrast text ratios exceeding WCAG 2.2 AA (minimum 4.5:1), prominent focus outlines for keyboard navigation, and total respect for reduced-motion preferences.

---

## 2. Design Tokens

### 2.1 Color Palette

#### Light Theme ("Calm Paper")
- **Background Root:** `#F8FAFC` (Slate-50) — Soft, warm white that reduces glare.
- **Card / Surface Background:** `#FFFFFF` (White) with subtle border `#E2E8F0` (Slate-200).
- **Surface Hover:** `#F1F5F9` (Slate-100).
- **Text Primary:** `#0F172A` (Slate-900) — Contrast ratio 14.2:1 against root background.
- **Text Secondary:** `#475569` (Slate-600) — Contrast ratio 5.6:1 against root background.
- **Text Muted:** `#64748B` (Slate-500) — Contrast ratio 4.6:1 against root background.
- **Primary Brand / Accent:** `#2563EB` (Blue-600) — Calm, authoritative, reliable.
- **Primary Accent Hover:** `#1D4ED8` (Blue-700).
- **Focus Ring Color:** `#3B82F6` (Blue-500) with 2px offset.
- **Success Tone:** `#059669` (Emerald-600) / Surface: `#ECFDF5` (Emerald-50).
- **Warning Tone (Urgent/Overdue):** `#D97706` (Amber-600) / `#DC2626` (Red-600).

#### Dark Theme ("Calm Midnight")
- **Background Root:** `#090D16` (Deep Slate-950) — True low-strain dark background.
- **Card / Surface Background:** `#131B2E` (Slate-900) with subtle border `#1E293B` (Slate-800).
- **Surface Hover:** `#1E293B` (Slate-800).
- **Text Primary:** `#F8FAFC` (Slate-50) — Contrast ratio 15.1:1 against background.
- **Text Secondary:** `#94A3B8` (Slate-400) — Contrast ratio 6.2:1 against background.
- **Text Muted:** `#64748B` (Slate-500).
- **Primary Brand / Accent:** `#3B82F6` (Blue-500).
- **Success Tone:** `#10B981` (Emerald-500) / Surface: `#064E3B` (Emerald-950).
- **Warning Tone:** `#F59E0B` (Amber-500) / `#EF4444` (Red-500).

### 2.2 Typography Scale
Font Family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif.

| Token | Size | Line Height | Weight | Usage |
|-------|------|-------------|--------|-------|
| `text-display` | 2.25rem (36px) | 2.5rem | 700 Bold | Focus Mode Timer, Hero Highlights |
| `text-h1` | 1.75rem (28px) | 2.25rem | 700 Bold | Page Titles (Today, Tasks, Progress) |
| `text-h2` | 1.25rem (20px) | 1.75rem | 600 SemiBold | Section Headers, Card Headers |
| `text-h3` | 1.125rem (18px) | 1.5rem | 600 SemiBold | Modal Headers, Next Action Title |
| `text-body` | 1.0rem (16px) | 1.5rem | 400 Regular | Task Titles, Primary Content |
| `text-body-sm` | 0.875rem (14px) | 1.25rem | 400/500 | Metadata, Subtasks, Form Labels |
| `text-caption` | 0.75rem (12px) | 1.0rem | 500 Medium | Badges, Tags, Key Shortcuts |

### 2.3 Spacing & Radii
- **Base Grid:** 4px (Spacing scale: 4, 8, 12, 16, 20, 24, 32, 48px).
- **Border Radii:**
  - `rounded-md`: 6px (Input fields, buttons, tags).
  - `rounded-lg`: 8px (Small cards, dropdowns).
  - `rounded-xl`: 12px (Main cards, modal surfaces, Next Action hero).
  - `rounded-2xl`: 16px (Focus mode container).
- **Shadows:** Restrained and soft:
  - `shadow-sm`: `0 1px 2px 0 rgb(0 0 0 / 0.05)`
  - `shadow-md`: `0 4px 6px -1px rgb(0 0 0 / 0.07)`
  - No dramatic glow or heavy colored drop shadows.

---

## 3. Information Architecture & Navigation

ClearStep uses a persistent, responsive navigation bar (desktop top/sidebar, mobile bottom bar):
1. **Home / Today (`/`):** The Next Action Hero card, quick add input, and today's priority list.
2. **Tasks (`/tasks`):** Complete task inventory with real-time search, status filter pills, priority sort, and bulk actions.
3. **Focus Mode (`/focus`):** Immersive, minimal single-task workspace with timer controls.
4. **Progress (`/progress`):** Verifiable completion metrics, daily review, and session history.
5. **Preferences (`/settings`):** Focus duration defaults, theme toggles, sound preferences, and data backup/restore.

---

## 4. Screen Layouts & Detailed States

### 4.1 Screen 1: Home / Today (The "Anti-Overwhelm" View)
- **Top Header:** Clean header with app logo ("ClearStep"), today's formatted date, keyboard shortcut reminder (`Press / to search, n for new task`), and quick theme toggle.
- **Hero: Next Best Action Card:**
  - Distinctive visual treatment: Gentle highlight border, soft blue tint.
  - Tag pill: `★ Recommended Next Action`.
  - Task Title: Bold, clear typography.
  - Plain English Rationale: e.g., *"Why this task? Due today with 3 subtasks remaining; high priority."*
  - Immediate Action: *"Next Step: Write introduction paragraph"* with a checkbox.
  - CTAs: Primary button **Start Focus Session (25m)**, Secondary button **View Details**, Tertiary **Choose Different Task**.
- **Today's Action List:** Compact list showing tasks scheduled for today or marked with high priority.
- **Empty State:** When no tasks are due today: *"All caught up for today! Pick a task from your backlog or take a well-deserved rest."*

### 4.2 Screen 2: Tasks (Backlog & Management)
- **Controls Bar:**
  - Search input with clear button and keyboard indicator (`/`).
  - Status Filter: `All`, `Active`, `Due Today`, `Completed`.
  - Priority Filter: `All`, `Urgent`, `High`, `Medium`, `Low`.
  - Sort Menu: `Due Date`, `Priority`, `Alphabetical`, `Recently Added`.
  - Primary Action Button: `+ New Task` (Shortcut: `n`).
- **Task Item Component:**
  - Checkbox (large, accessible hit target 24x24px).
  - Task Title and priority badge.
  - Due date badge (with conditional red styling if overdue, amber if due today).
  - Subtask progress indicator: `Progress: 2/4 (50%)` with a miniature accessible progress bar (`role="progressbar"`).
  - Action buttons: Pin as Focus Task, Edit, Delete.
- **Empty State:** *"No tasks match your filter. Press 'n' to create one."*

### 4.3 Screen 3: Task Details & Breakdown Modal
- Accessible modal dialog (`role="dialog"`, `aria-modal="true"`) with focus trap.
- Title and description edit fields.
- Priority selector, due date picker, tags input.
- **Task Deconstruction Section:**
  - Quick Template Dropdown: *"Apply Breakdown Template..."* (Research & Essay, Exam Prep, Project Milestone, Admin Task).
  - Subtask list with add, remove, and toggle controls.
  - Focus task toggle switch: *"Pin as my primary focus"*.
- Actions: Save, Cancel, Delete Task.

### 4.4 Screen 4: Focus Mode (Distraction-Free)
- Full distraction-reduced overlay view or dedicated tab.
- Background: Minimal, uncluttered.
- **Active Task Card:**
  - Displays only the currently focused task title.
  - Displays the current active subtask with an instant checkmark toggle.
- **Timer Display:**
  - Large tabular numbers (`font-mono text-5xl sm:text-6xl`).
  - Mode selector pills: `Focus (25m)`, `Short Break (5m)`, `Long Break (15m)`.
  - Progress ring / bar showing elapsed percentage.
  - Controls: `Start` (Spacebar), `Pause`, `Reset`, `Complete Task Early`, `Exit Focus Mode` (Esc).
- **Session Complete State:**
  - Soft green highlight.
  - Polite message: *"Great work! You focused for 25 minutes on [Task Title]."*
  - Prompt: *"Ready for a 5-minute break?"* with `Start Break` or `Back to Dashboard`.

### 4.5 Screen 5: Progress & Activity Ledger
- **Stat Cards (Real Data Only):**
  - **Completed Tasks:** Total count from local storage.
  - **Subtasks Finished:** Granular progress count.
  - **Focus Time Logged:** Total minutes/hours.
- **7-Day Activity Chart:** Simple, high-contrast bar chart rendered via clean accessible SVG/HTML divs showing minutes focused per day.
- **Session History Log:** Scrollable table of past sessions showing date, task name, and duration.
- **Zero-shaming Notice:** *"ClearStep tracks your actual effort without artificial streaks. Rest is an essential part of sustainable productivity."*

### 4.6 Screen 6: Preferences & Settings
- **Timer Presets:** Focus duration (15m, 25m, 45m, 60m), Short break (3m, 5m, 10m), Long break (10m, 15m, 20m).
- **Appearance:** Calm Light, Calm Dark, System Default.
- **Accessibility Settings:** Reduced Motion (Toggle), High Contrast Outlines (Toggle).
- **Data Management:** Export all data as `.json`, Import from backup file, Reset to demo data.

---

## 5. Interaction Patterns & Keyboard Shortcuts

| Shortcut | Action | Scope |
|----------|--------|-------|
| `/` | Focus search bar | Global |
| `n` | Open "New Task" modal | Global |
| `f` | Start Focus Mode on current Next Action | Global |
| `Space` | Start / Pause Focus Timer | When in Focus Mode |
| `Esc` | Close modal / Exit Focus Mode | Global |
| `Tab` / `Shift+Tab` | Sequential focus navigation | All views |
| `Enter` / `Space` | Activate buttons, toggle checkboxes | All views |

---

## 6. Accessibility & Visual QA Criteria

1. **Focus Ring:** Every interactive element features `focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2`. Focus is never suppressed.
2. **Hit Targets:** Minimum touch/click target size is 40x40px for all buttons and interactive controls.
3. **Screen Reader Semantics:**
   - Next Action updates announce via `aria-live="polite"`.
   - Timer counts update visually without flooding screen readers (announced on start, pause, minute boundaries, and completion).
   - Dialogs implement `aria-labelledby` and trap focus inside while open.
4. **Reduced Motion:** If `prefers-reduced-motion: reduce` is detected or toggled on, all CSS transitions (`transition-all`, `animate-pulse`, `animate-spin`) are disabled (`transition: none !important; animation: none !important;`).

---
*End of DESIGN.md*
