import { describe, it, expect } from 'vitest';
import {
  calculateNextBestAction,
  getDaysDifference,
  SCORING_WEIGHTS,
} from '../domain/recommendationEngine';
import { Task } from '../domain/types';

describe('recommendationEngine', () => {
  const baseDate = '2026-10-24';

  const makeTask = (overrides: Partial<Task>): Task => ({
    id: `test-${Math.random()}`,
    title: 'Test Task',
    description: '',
    priority: 'medium',
    dueDate: null,
    tags: [],
    subtasks: [],
    completed: false,
    completedAt: null,
    createdAt: '2026-10-24T00:00:00.000Z',
    updatedAt: '2026-10-24T00:00:00.000Z',
    isFocusPinned: false,
    ...overrides,
  });

  it('returns graceful empty recommendation when no active tasks exist', () => {
    const res = calculateNextBestAction([], baseDate);
    expect(res.recommendedTask).toBeNull();
    expect(res.recommendedSubtask).toBeNull();
    expect(res.score).toBe(0);
    expect(res.rationale).toContain('All caught up');
  });

  it('ignores completed tasks and only evaluates active tasks', () => {
    const completed = makeTask({ title: 'Done Task', completed: true });
    const active = makeTask({ title: 'Active Task', completed: false });

    const res = calculateNextBestAction([completed, active], baseDate);
    expect(res.recommendedTask?.title).toBe('Active Task');
  });

  it('prioritizes user Focus Pin above all other signals (User Intent Sovereignty)', () => {
    // Overdue urgent task gets: Overdue (+60) + Urgent (+30) = 90
    const overdueTask = makeTask({
      id: 'task-overdue',
      title: 'Overdue Task',
      dueDate: '2026-10-20',
      priority: 'urgent',
      isFocusPinned: false,
    });
    // Low priority pinned task gets: Pinned (+100) + Low (+0) = 100
    const pinnedTask = makeTask({
      id: 'task-pinned',
      title: 'Pinned Focus Task',
      dueDate: '2026-10-30',
      priority: 'low',
      isFocusPinned: true,
    });

    const res = calculateNextBestAction([overdueTask, pinnedTask], baseDate);
    expect(res.recommendedTask?.title).toBe('Pinned Focus Task');
    expect(res.score).toBeGreaterThanOrEqual(100);
    expect(res.rationale).toContain('Pinned as your chosen focus');
  });

  it('prioritizes overdue tasks over future tasks with same priority', () => {
    const future = makeTask({ id: 'task-future', title: 'Future Task', dueDate: '2026-10-28', priority: 'high' });
    const overdue = makeTask({ id: 'task-overdue', title: 'Overdue Task', dueDate: '2026-10-22', priority: 'high' });

    const res = calculateNextBestAction([future, overdue], baseDate);
    expect(res.recommendedTask?.title).toBe('Overdue Task');
    expect(res.rationale).toContain('Overdue by 2 days');
  });

  it('handles tasks due today, missing due dates, and malformed due dates safely without NaN', () => {
    const dueToday = makeTask({
      id: 'task-today',
      title: 'Due Today',
      dueDate: '2026-10-24',
      priority: 'medium',
    });
    const missingDate = makeTask({
      id: 'task-missing',
      title: 'Missing Due Date',
      dueDate: null,
      priority: 'medium',
    });
    const malformedDate = makeTask({
      id: 'task-malformed',
      title: 'Malformed Date',
      dueDate: 'not-a-valid-date',
      priority: 'medium',
    });

    const res = calculateNextBestAction([missingDate, malformedDate, dueToday], baseDate);
    expect(res.recommendedTask?.id).toBe('task-today');
    expect(res.score).toBe(SCORING_WEIGHTS.DUE_TODAY + SCORING_WEIGHTS.PRIORITY_MEDIUM);
    expect(res.rationale).toContain('Due today');
    expect(isNaN(res.score)).toBe(false);

    // If only malformed and missing exist, neither crashes and score is valid
    const res2 = calculateNextBestAction([missingDate, malformedDate], baseDate);
    expect(isNaN(res2.score)).toBe(false);
    expect(res2.score).toBe(SCORING_WEIGHTS.PRIORITY_MEDIUM);
  });

  it('rewards momentum when subtasks are partially complete (1/3), but not when 0/3 or 3/3 done', () => {
    const noProgress = makeTask({
      id: 'task-0-3',
      title: '0 of 3 done',
      priority: 'medium',
      subtasks: [
        { id: 's1', title: 'Step 1', completed: false, completedAt: null },
        { id: 's2', title: 'Step 2', completed: false, completedAt: null },
        { id: 's3', title: 'Step 3', completed: false, completedAt: null },
      ],
    });
    const partialProgress = makeTask({
      id: 'task-1-3',
      title: '1 of 3 done',
      priority: 'medium',
      subtasks: [
        { id: 's1', title: 'Step 1', completed: true, completedAt: null },
        { id: 's2', title: 'Step 2', completed: false, completedAt: null },
        { id: 's3', title: 'Step 3', completed: false, completedAt: null },
      ],
    });
    const allDone = makeTask({
      id: 'task-3-3',
      title: '3 of 3 done',
      priority: 'medium',
      subtasks: [
        { id: 's1', title: 'Step 1', completed: true, completedAt: null },
        { id: 's2', title: 'Step 2', completed: true, completedAt: null },
        { id: 's3', title: 'Step 3', completed: true, completedAt: null },
      ],
    });

    // 1 of 3 has momentum bonus (+10), while 0 of 3 does not
    const res = calculateNextBestAction([noProgress, partialProgress], baseDate);
    expect(res.recommendedTask?.id).toBe('task-1-3');
    expect(res.score).toBe(SCORING_WEIGHTS.PRIORITY_MEDIUM + SCORING_WEIGHTS.MOMENTUM_SUBTASKS);
    expect(res.recommendedSubtask?.id).toBe('s2');
    expect(res.rationale).toContain('Momentum: 1/3 subtasks done');

    // 3 of 3 does not get momentum bonus because completed === total
    const resAll = calculateNextBestAction([allDone], baseDate);
    expect(resAll.score).toBe(SCORING_WEIGHTS.PRIORITY_MEDIUM);
    expect(resAll.rationale).not.toContain('Momentum');
  });

  it('resolves identical score ties deterministically using older createdAt', () => {
    const olderTask = makeTask({
      id: 'task-older',
      title: 'Older Task',
      priority: 'high',
      createdAt: '2026-10-01T00:00:00.000Z',
    });
    const newerTask = makeTask({
      id: 'task-newer',
      title: 'Newer Task',
      priority: 'high',
      createdAt: '2026-10-20T00:00:00.000Z',
    });

    // Regardless of array order, older task wins tie
    const res1 = calculateNextBestAction([newerTask, olderTask], baseDate);
    const res2 = calculateNextBestAction([olderTask, newerTask], baseDate);
    expect(res1.recommendedTask?.id).toBe('task-older');
    expect(res2.recommendedTask?.id).toBe('task-older');
  });

  it('resolves identical score and identical createdAt ties deterministically using alphabetical task ID', () => {
    const taskAlpha = makeTask({
      id: 'task-aaa',
      title: 'Alpha Task',
      priority: 'medium',
      createdAt: '2026-10-24T00:00:00.000Z',
    });
    const taskBeta = makeTask({
      id: 'task-bbb',
      title: 'Beta Task',
      priority: 'medium',
      createdAt: '2026-10-24T00:00:00.000Z',
    });

    // 'task-aaa' < 'task-bbb'
    const res1 = calculateNextBestAction([taskBeta, taskAlpha], baseDate);
    const res2 = calculateNextBestAction([taskAlpha, taskBeta], baseDate);
    expect(res1.recommendedTask?.id).toBe('task-aaa');
    expect(res2.recommendedTask?.id).toBe('task-aaa');
  });

  it('guarantees exact reproducibility across multiple calls with same todayStr', () => {
    const tasks = [
      makeTask({ id: 't1', title: 'T1', priority: 'high', dueDate: '2026-10-24' }),
      makeTask({ id: 't2', title: 'T2', priority: 'urgent', dueDate: '2026-10-26' }),
      makeTask({ id: 't3', title: 'T3', priority: 'medium', isFocusPinned: true }),
    ];

    const run1 = calculateNextBestAction(tasks, baseDate);
    const run2 = calculateNextBestAction(tasks, baseDate);
    const run3 = calculateNextBestAction([...tasks].reverse(), baseDate);

    expect(run1.score).toBe(run2.score);
    expect(run1.recommendedTask?.id).toBe(run2.recommendedTask?.id);
    expect(run1.rationale).toBe(run2.rationale);

    expect(run3.score).toBe(run1.score);
    expect(run3.recommendedTask?.id).toBe(run1.recommendedTask?.id);
    expect(run3.rationale).toBe(run1.rationale);
  });

  it('accurately calculates day differences and safely returns NaN for malformed dates', () => {
    expect(getDaysDifference('2026-10-24', '2026-10-24')).toBe(0);
    expect(getDaysDifference('2026-10-26', '2026-10-24')).toBe(2);
    expect(getDaysDifference('2026-10-20', '2026-10-24')).toBe(-4);
    expect(isNaN(getDaysDifference('invalid', '2026-10-24'))).toBe(true);
    expect(isNaN(getDaysDifference('2026-10-24', 'invalid'))).toBe(true);
    expect(isNaN(getDaysDifference('', ''))).toBe(true);
  });
});
