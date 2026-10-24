import { describe, it, expect } from 'vitest';
import {
  calculateNextBestAction,
  getDaysDifference,
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
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
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

  it('prioritizes user Focus Pin above all other signals', () => {
    const overdueTask = makeTask({
      title: 'Overdue Task',
      dueDate: '2026-10-20',
      priority: 'urgent',
      isFocusPinned: false,
    });
    const pinnedTask = makeTask({
      title: 'Pinned Focus Task',
      dueDate: '2026-10-30',
      priority: 'low',
      isFocusPinned: true,
    });

    const res = calculateNextBestAction([overdueTask, pinnedTask], baseDate);
    expect(res.recommendedTask?.title).toBe('Pinned Focus Task');
    expect(res.rationale).toContain('Pinned as your chosen focus');
  });

  it('prioritizes overdue tasks over future tasks with same priority', () => {
    const future = makeTask({ title: 'Future Task', dueDate: '2026-10-28', priority: 'high' });
    const overdue = makeTask({ title: 'Overdue Task', dueDate: '2026-10-22', priority: 'high' });

    const res = calculateNextBestAction([future, overdue], baseDate);
    expect(res.recommendedTask?.title).toBe('Overdue Task');
    expect(res.rationale).toContain('Overdue by 2 days');
  });

  it('rewards momentum when subtasks are partially complete', () => {
    const noSubtasks = makeTask({ title: 'No Subtasks', priority: 'medium' });
    const withMomentum = makeTask({
      title: 'Has Momentum',
      priority: 'medium',
      subtasks: [
        { id: '1', title: 'Step 1', completed: true, completedAt: null },
        { id: '2', title: 'Step 2', completed: false, completedAt: null },
      ],
    });

    const res = calculateNextBestAction([noSubtasks, withMomentum], baseDate);
    expect(res.recommendedTask?.title).toBe('Has Momentum');
    expect(res.recommendedSubtask?.title).toBe('Step 2');
    expect(res.rationale).toContain('Momentum: 1/2 subtasks done');
  });

  it('accurately calculates day differences', () => {
    expect(getDaysDifference('2026-10-24', '2026-10-24')).toBe(0);
    expect(getDaysDifference('2026-10-26', '2026-10-24')).toBe(2);
    expect(getDaysDifference('2026-10-20', '2026-10-24')).toBe(-4);
  });
});
