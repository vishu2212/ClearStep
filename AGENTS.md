# Agent Instructions & Operating Standards — ClearStep (TaskForge)

**Project:** ClearStep  
**Repository:** `D:\TaskForge`  
**Target Event:** Taskforge Hackathon  
**GSD Version:** v1.18.0  
**Primary Agent Environment:** Antigravity / Gemini 3.8 Flash (High)  

---

## 1. Project Mission & Identity

ClearStep is an accessible, local-first productivity web application engineered to solve task paralysis and cognitive overwhelm for students. Its primary directive is: **Make the single next useful action undeniably clear, accessible, and achievable.**

---

## 2. Technical Stack & Conventions

- **Runtime:** Node.js v24+, npm 11+
- **Framework:** React 19, TypeScript (Strict mode enabled, `noImplicitAny: true`)
- **Build Tool:** Vite
- **Styling:** Tailwind CSS with semantic tokens and CSS variables
- **Icons:** Lucide React
- **Validation:** Zod for all persistence and input boundaries
- **Testing:** Vitest, React Testing Library, jsdom
- **Code Review:** CodeRabbit (`npx --yes coderabbit review --agent`)

---

## 3. Architecture & Code Organization

```
src/
  domain/          # Pure TypeScript business logic (zero React dependencies)
  storage/         # LocalStorage repository, Zod schemas, error recovery
  context/         # React Context providers & hooks (TaskContext, TimerContext)
  components/      # UI components structured by feature domain
```

### Critical Implementation Rules
1. **Never use `setInterval` alone for duration math:** Background browser tabs throttle intervals to 1 per second or 1 per minute. Always measure elapsed time using wall-clock timestamp differences: `remaining = target - (Date.now() - startTime)`.
2. **Never claim AI generation for deterministic logic:** The Next Best Action engine is a transparent, predictable weighting algorithm. Always explain why a task is chosen.
3. **No External Backends:** The application must remain 100% functional offline. Do not add external database connections or mandatory login walls.
4. **Accessible by Design:** All interactive buttons must have accessible labels (`aria-label` where icon-only), clear visible focus rings, and proper keyboard listeners.

---

## 4. Installed Skills & Invocation Protocols

- **GSD Core (`gsd-*`):** Primary workflow orchestrator for requirements, planning, execution, and verification (`.agents/gsd-core/`).
- **CodeRabbit (`code-review`, `autofix`):** Available via `.agents/skills/code-review` and `npx --yes coderabbit`. Must be invoked to audit changes, check security, and fix code quality defects.
- **AAS Core Skills (`.agents/skills/`):** Use specialized design, React, and accessibility playbooks selectively.

---

## 5. Security & Boundary Rules

1. Treat all user-supplied inputs as untrusted: parse through Zod schemas.
2. Never store secrets, passwords, or tokens in source code or browser LocalStorage.
3. If LocalStorage data fails schema validation, safely back up the raw corrupted string to `clearstep_backup_<timestamp>` and reinitialize defaults rather than crashing the React root.
4. Never disable tests or suppress legitimate TypeScript compiler errors with `// @ts-ignore`.

---

## 6. Definition of Done (DoD)

A phase or task is only marked complete when:
- [x] TypeScript compiler passes cleanly (`tsc --noEmit` exits with 0 errors).
- [x] Automated Vitest tests execute and pass (`npm run test`).
- [x] Production build passes cleanly (`npm run build`).
- [x] CodeRabbit review has been executed and critical/major findings resolved.
- [x] Keyboard navigation and visual focus have been verified.
- [x] Related documentation (`README.md`, `PRD.md`, etc.) is kept in sync with code reality.

---
*End of AGENTS.md*
