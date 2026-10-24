import { Task, Subtask, RecommendationResult } from './types';

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
 * Calculates days difference between target YYYY-MM-DD and today's date
 */
export function getDaysDifference(dueDateStr: string, todayStr: string = getLocalDateString()): number {
  const target = new Date(dueDateStr + 'T00:00:00');
  const today = new Date(todayStr + 'T00:00:00');
  const diffTime = target.getTime() - today.getTime();
  return Math.round(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Evaluates active tasks with a deterministic scoring algorithm
 * and returns the single highest-priority task and its immediate next step.
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

  let topTask: Task | null = null;
  let highestScore = -Infinity;
  let topRationale = '';
  let topSubtask: Subtask | null = null;

  for (const task of activeTasks) {
    let score = 0;
    const reasons: string[] = [];

    // 1. Manual Focus Pin (+100)
    if (task.isFocusPinned) {
      score += 100;
      reasons.push('Pinned as your chosen focus');
    }

    // 2. Due Date Evaluation
    if (task.dueDate) {
      const daysDiff = getDaysDifference(task.dueDate, todayStr);
      if (daysDiff < 0) {
        const daysOver = Math.abs(daysDiff);
        score += 60;
        reasons.push(`Overdue by ${daysOver} day${daysOver > 1 ? 's' : ''}`);
      } else if (daysDiff === 0) {
        score += 40;
        reasons.push('Due today');
      } else if (daysDiff <= 2) {
        score += 20;
        reasons.push(`Due in ${daysDiff} day${daysDiff > 1 ? 's' : ''}`);
      }
    }

    // 3. Priority Weighting
    switch (task.priority) {
      case 'urgent':
        score += 30;
        reasons.push('Urgent priority');
        break;
      case 'high':
        score += 20;
        reasons.push('High priority');
        break;
      case 'medium':
        score += 10;
        break;
      case 'low':
        score += 0;
        break;
    }

    // 4. Subtask Momentum & Readiness
    const totalSubtasks = task.subtasks.length;
    const completedSubtasks = task.subtasks.filter((s) => s.completed).length;
    const pendingSubtask = task.subtasks.find((s) => !s.completed) || null;

    if (totalSubtasks > 0 && completedSubtasks > 0 && completedSubtasks < totalSubtasks) {
      score += 10;
      reasons.push(`Momentum: ${completedSubtasks}/${totalSubtasks} subtasks done`);
    }

    // Tie-breaker: older tasks get slight priority over brand new ones to prevent backlog stagnation
    const createdTime = new Date(task.createdAt).getTime();
    if (!isNaN(createdTime)) {
      score += Math.min(5, Math.floor((Date.now() - createdTime) / (1000 * 60 * 60 * 24 * 7)));
    }

    if (score > highestScore) {
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
