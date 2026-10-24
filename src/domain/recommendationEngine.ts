import { Task, Subtask, RecommendationResult } from './types';

/**
 * Deterministic scoring weights for the Next Best Action engine.
 * Transparent and predictable: user intent and urgency are weighted explicitly.
 */
export const SCORING_WEIGHTS = {
  FOCUS_PINNED: 100, // User Intent Sovereignty: explicit manual priority
  OVERDUE: 60,
  DUE_TODAY: 40,
  DUE_SOON: 20,
  PRIORITY_URGENT: 30,
  PRIORITY_HIGH: 20,
  PRIORITY_MEDIUM: 10,
  PRIORITY_LOW: 0,
  MOMENTUM_SUBTASKS: 10,
  MAX_AGE_BONUS: 5,
} as const;

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Normalizes a date string or Date object to YYYY-MM-DD in local time
 */
export function getLocalDateString(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Calculates days difference between target YYYY-MM-DD and today's date.
 * Returns NaN if either date string is invalid or improperly formatted.
 */
export function getDaysDifference(dueDateStr: string, todayStr: string = getLocalDateString()): number {
  if (!DATE_REGEX.test(dueDateStr) || !DATE_REGEX.test(todayStr)) {
    return NaN;
  }
  const target = new Date(dueDateStr + 'T00:00:00');
  const today = new Date(todayStr + 'T00:00:00');
  if (isNaN(target.getTime()) || isNaN(today.getTime())) {
    return NaN;
  }
  const diffTime = target.getTime() - today.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Evaluates active tasks with a transparent, deterministic scoring algorithm
 * and returns the single highest-priority task and its immediate next step.
 *
 * Core Principles:
 * 1. User Intent Sovereignty: If a task is manually pinned (isFocusPinned: true),
 *    it receives an immediate +100 weight. Explicit human agency is paramount;
 *    algorithmic heuristics must never override a user's intentional commitment.
 * 2. Reproducibility: Reference dates (todayStr) are used exclusively for age
 *    and deadline calculations rather than non-deterministic Date.now() calls.
 * 3. Strict Deterministic Tie-Breaking: When scores tie, the older task
 *    (createdAt) takes precedence to avoid backlog stagnation. If createdAt
 *    timestamps are identical, alphabetical task.id ordering breaks the tie.
 */
export function calculateNextBestAction(tasks: Task[], todayStr: string = getLocalDateString()): RecommendationResult {
  const activeTasks = tasks.filter((t) => !t.completed);

  if (activeTasks.length === 0) {
    return {
      recommendedTask: null,
      recommendedSubtask: null,
      score: 0,
      rationale: 'All caught up! No active tasks pending. Take a break or create a new task.',
    };
  }

  // Derive reference timestamp from todayStr for reproducible age calculations
  const referenceTimestamp = DATE_REGEX.test(todayStr)
    ? new Date(todayStr + 'T00:00:00').getTime()
    : Date.now();

  let topTask: Task | null = null;
  let highestScore = -Infinity;
  let topRationale = '';
  let topSubtask: Subtask | null = null;

  for (const task of activeTasks) {
    let score = 0;
    const reasons: string[] = [];

    // 1. Manual Focus Pin (+100) — User Intent Sovereignty
    if (task.isFocusPinned) {
      score += SCORING_WEIGHTS.FOCUS_PINNED;
      reasons.push('Pinned as your chosen focus');
    }

    // 2. Due Date Evaluation
    if (task.dueDate) {
      const daysDiff = getDaysDifference(task.dueDate, todayStr);
      if (!isNaN(daysDiff)) {
        if (daysDiff < 0) {
          const daysOver = Math.abs(daysDiff);
          score += SCORING_WEIGHTS.OVERDUE;
          reasons.push(`Overdue by ${daysOver} day${daysOver > 1 ? 's' : ''}`);
        } else if (daysDiff === 0) {
          score += SCORING_WEIGHTS.DUE_TODAY;
          reasons.push('Due today');
        } else if (daysDiff <= 2) {
          score += SCORING_WEIGHTS.DUE_SOON;
          reasons.push(`Due in ${daysDiff} day${daysDiff > 1 ? 's' : ''}`);
        }
      }
    }

    // 3. Priority Weighting
    switch (task.priority) {
      case 'urgent':
        score += SCORING_WEIGHTS.PRIORITY_URGENT;
        reasons.push('Urgent priority');
        break;
      case 'high':
        score += SCORING_WEIGHTS.PRIORITY_HIGH;
        reasons.push('High priority');
        break;
      case 'medium':
        score += SCORING_WEIGHTS.PRIORITY_MEDIUM;
        break;
      case 'low':
        score += SCORING_WEIGHTS.PRIORITY_LOW;
        break;
    }

    // 4. Subtask Momentum & Readiness (only when partially complete)
    const totalSubtasks = task.subtasks.length;
    const completedSubtasks = task.subtasks.filter((s) => s.completed).length;
    const pendingSubtask = task.subtasks.find((s) => !s.completed) || null;

    if (totalSubtasks > 0 && completedSubtasks > 0 && completedSubtasks < totalSubtasks) {
      score += SCORING_WEIGHTS.MOMENTUM_SUBTASKS;
      reasons.push(`Momentum: ${completedSubtasks}/${totalSubtasks} subtasks done`);
    }

    // 5. Age Bonus: Older tasks get slight priority over brand new ones to prevent backlog stagnation
    const createdTime = new Date(task.createdAt).getTime();
    if (!isNaN(createdTime) && referenceTimestamp >= createdTime) {
      const ageWeeks = Math.floor((referenceTimestamp - createdTime) / (1000 * 60 * 60 * 24 * 7));
      score += Math.min(SCORING_WEIGHTS.MAX_AGE_BONUS, Math.max(0, ageWeeks));
    }

    // Strict deterministic tie-breaker
    let isBetter = false;
    if (topTask === null || score > highestScore) {
      isBetter = true;
    } else if (score === highestScore) {
      const topCreated = new Date(topTask.createdAt).getTime();
      const currentCreated = new Date(task.createdAt).getTime();
      const validCurrent = !isNaN(currentCreated);
      const validTop = !isNaN(topCreated);

      if (validCurrent && validTop && currentCreated !== topCreated) {
        // Tie-breaker 1: older createdAt wins (lower timestamp)
        isBetter = currentCreated < topCreated;
      } else {
        // Tie-breaker 2: alphabetical task id
        isBetter = task.id.localeCompare(topTask.id) < 0;
      }
    }

    if (isBetter) {
      highestScore = score;
      topTask = task;
      topSubtask = pendingSubtask;
      topRationale = reasons.length > 0 ? reasons.join(' • ') : 'Ready for next step';
    }
  }

  return {
    recommendedTask: topTask,
    recommendedSubtask: topSubtask,
    score: highestScore,
    rationale: topRationale,
  };
}
