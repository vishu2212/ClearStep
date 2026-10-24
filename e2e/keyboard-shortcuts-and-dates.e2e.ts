import { test, expect } from '@playwright/test';
import { clearAndResetStorage, setupErrorMonitoring, setLocalStorageStore } from './helpers';
import { getLocalDateString } from '../src/domain/recommendationEngine';

test.describe('Keyboard Shortcuts & Due Date Calculation E2E Suite', () => {
  test.beforeEach(async ({ page }) => {
    await clearAndResetStorage(page);
  });

  test('keyboard shortcuts respect open dialogs, text inputs, and contenteditable elements', async ({ page }) => {
    const diagnostics = setupErrorMonitoring(page);

    // Initial tab: Today
    await expect(page.getByText('Your day, made manageable')).toBeVisible();

    // 1. Open modal via clicking "Add task"
    await page.getByRole('button', { name: /Create new task/i }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    // Press 'f' while modal is open -> Must NOT navigate to Focus Mode
    await page.keyboard.press('KeyF');
    await expect(dialog).toBeVisible();
    await expect(page.getByRole('button', { name: /Exit Focus Mode/i })).not.toBeVisible();

    // Press '/' while modal is open -> Must NOT navigate to Tasks
    await page.keyboard.press('Slash');
    await expect(dialog).toBeVisible();

    // Close modal via Cancel button
    await dialog.getByRole('button', { name: /Cancel/i }).click();
    await expect(dialog).not.toBeVisible();

    // 2. Focus on Quick Add input and type 'n' and 'f' -> Must NOT trigger navigation
    const quickAdd = page.locator('#quick-add-task-input');
    await quickAdd.focus();
    await page.keyboard.type('Note down physics formulas');

    // Modal must NOT open and Focus tab must NOT activate
    await expect(page.getByRole('dialog')).not.toBeVisible();
    await expect(page.getByText('Your day, made manageable')).toBeVisible();

    // 3. Test global shortcuts when no input is focused
    await quickAdd.blur();

    // Press 'f' -> Navigate to Focus tab
    await page.keyboard.press('KeyF');
    await expect(page.getByRole('button', { name: /Exit Focus Mode/i })).toBeVisible();

    // Press 'Escape' -> Return to Today tab
    await page.keyboard.press('Escape');
    await expect(page.getByText('Your day, made manageable')).toBeVisible();

    // Press '/' -> Navigate to Tasks tab and focus search input
    await page.keyboard.press('Slash');
    await expect(page.getByText('All tasks & backlog', { exact: true })).toBeVisible();
    const searchInput = page.getByPlaceholder(/Search tasks/i);
    await expect(searchInput).toBeFocused();

    expect(diagnostics.pageErrors).toEqual([]);
  });

  test('accurately calculates and renders "Due today", "Tomorrow", and overdue labels', async ({ page }) => {
    const diagnostics = setupErrorMonitoring(page);

    // Compute relative dates using local date math
    const now = new Date();
    const todayStr = getLocalDateString(now);

    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = getLocalDateString(tomorrow);

    const overdueDate = new Date(now);
    overdueDate.setDate(overdueDate.getDate() - 3);
    const overdueStr = getLocalDateString(overdueDate);

    const testStore = {
      schemaVersion: 1,
      tasks: [
        {
          id: 'task-overdue',
          title: 'Calculus Assignment 3',
          description: '',
          priority: 'urgent',
          dueDate: overdueStr,
          tags: ['MATH 101'],
          subtasks: [],
          completed: false,
          completedAt: null,
          createdAt: now.toISOString(),
          updatedAt: now.toISOString(),
          isFocusPinned: false,
        },
        {
          id: 'task-today',
          title: 'Chemistry Quiz Prep',
          description: '',
          priority: 'high',
          dueDate: todayStr,
          tags: ['CHEM 101'],
          subtasks: [],
          completed: false,
          completedAt: null,
          createdAt: now.toISOString(),
          updatedAt: now.toISOString(),
          isFocusPinned: true, // Recommended task
        },
        {
          id: 'task-tomorrow',
          title: 'History Essay Outline',
          description: '',
          priority: 'medium',
          dueDate: tomorrowStr,
          tags: ['HIST 202'],
          subtasks: [],
          completed: false,
          completedAt: null,
          createdAt: now.toISOString(),
          updatedAt: now.toISOString(),
          isFocusPinned: false,
        },
      ],
      sessions: [],
      preferences: {
        focusDuration: 25,
        shortBreakDuration: 5,
        longBreakDuration: 15,
        sessionsBeforeLongBreak: 4,
        dailyGoalSessions: 4,
        soundEnabled: false,
        theme: 'light',
        reduceMotion: false,
        highContrast: false,
      },
      lastUpdated: now.toISOString(),
    };

    await setLocalStorageStore(page, testStore);

    // 1. Next Action Hero should feature 'Chemistry Quiz Prep' with 'Due today'
    const hero = page.locator('section[aria-labelledby="hero-action-heading"]');
    await expect(hero).toContainText('Chemistry Quiz Prep');
    await expect(hero).toContainText('Due today');

    // 2. Today list should show overdue task with "Overdue • 3 days"
    const overdueRow = page.locator('#task-rows-container').filter({ hasText: 'Calculus Assignment 3' });
    await expect(overdueRow).toBeVisible();
    await expect(overdueRow).toContainText(/Overdue • 3 days/i);

    // 3. Side Panel ("Coming up") should display "Tomorrow" for the task due tomorrow
    const comingUpPanel = page.locator('aside[aria-labelledby="coming-up-title"]');
    await expect(comingUpPanel).toBeVisible();
    await expect(comingUpPanel).toContainText(/Tomorrow/i);
    await expect(comingUpPanel).toContainText('History Essay Outline');

    expect(diagnostics.pageErrors).toEqual([]);
  });
});
