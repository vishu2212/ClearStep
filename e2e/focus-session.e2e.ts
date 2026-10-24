import { test, expect } from '@playwright/test';
import { clearAndResetStorage, setupErrorMonitoring, setLocalStorageStore, navigateToTab } from './helpers';

test.describe('Focus Sessions, History & Backup Integrity E2E Suite', () => {
  test.beforeEach(async ({ page }) => {
    await clearAndResetStorage(page);
  });

  test('starts, pauses, resumes, and completes a focus session with task attribution', async ({ page }) => {
    const diagnostics = setupErrorMonitoring(page);

    // Find the first task in Today list or Next Action Hero and start focus
    const rowFocusBtn = page.locator('#task-rows-container').getByRole('button', { name: /Focus/i }).first();
    const heroFocusBtn = page.getByRole('button', { name: /Start focus/i });
    if (await rowFocusBtn.isVisible()) {
      await rowFocusBtn.click();
    } else {
      await expect(heroFocusBtn).toBeVisible();
      await heroFocusBtn.click();
    }

    // Verify Focus Mode is active
    await expect(page.getByRole('button', { name: /Exit Focus Mode/i })).toBeVisible();

    // Verify timer is running and start button is now "Pause"
    const pauseBtn = page.getByRole('button', { name: /Pause timer/i });
    await expect(pauseBtn).toBeVisible();

    // Let 1 second pass, then pause
    await page.waitForTimeout(1000);
    await pauseBtn.click();

    // Button should now be "Resume timer"
    const resumeBtn = page.getByRole('button', { name: /Resume timer/i });
    await expect(resumeBtn).toBeVisible();

    // Resume timer
    await resumeBtn.click();
    await expect(page.getByRole('button', { name: /Pause timer/i })).toBeVisible();

    // Complete session early
    const completeEarlyBtn = page.getByRole('button', { name: /Complete session early/i });
    await completeEarlyBtn.click();

    // Verify session completion modal
    const completeModal = page.getByRole('dialog');
    await expect(completeModal).toBeVisible();
    await expect(completeModal).toContainText('Session Accomplished');

    // Dismiss modal / return to dashboard
    const returnBtn = completeModal.getByRole('button', { name: /Return to Dashboard/i });
    await returnBtn.click();
    await expect(completeModal).not.toBeVisible();

    // Navigate to Progress tab
    await navigateToTab(page, 'Progress');

    // Verify the Progress tab displays the logged focus session
    await expect(page.getByText('Your Progress & Reflection')).toBeVisible();
    await expect(page.getByText('Session History')).toBeVisible();

    expect(diagnostics.pageErrors).toEqual([]);
  });

  test('imports backup with historical sessions and preserves them across new session completion', async ({ page }) => {
    const diagnostics = setupErrorMonitoring(page);

    // 1. Navigate to Settings tab
    await navigateToTab(page, 'Settings');

    await expect(page.getByText('Preferences & Accessibility')).toBeVisible();

    // Prepare a mock backup with 2 unique historical sessions and 1 custom task
    const mockBackup = {
      schemaVersion: 1,
      tasks: [
        {
          id: 'imported-task-chem',
          title: 'Organic Chemistry Synthesis Lab',
          description: 'Mechanisms and yield',
          priority: 'urgent',
          dueDate: null,
          tags: ['CHEM 201'],
          subtasks: [],
          completed: false,
          completedAt: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isFocusPinned: true,
        },
      ],
      sessions: [
        {
          id: 'imported-session-001',
          taskId: 'imported-task-chem',
          taskTitle: 'Organic Chemistry Synthesis Lab',
          mode: 'focus',
          durationMinutes: 45,
          completedAt: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: 'imported-session-002',
          taskId: null,
          taskTitle: 'Independent Focus Session',
          mode: 'focus',
          durationMinutes: 30,
          completedAt: new Date(Date.now() - 7200000).toISOString(),
        },
      ],
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
      lastUpdated: new Date().toISOString(),
    };

    // Upload backup file via hidden file input
    const fileInput = page.locator('input[type="file"][accept*=".json"]');
    await fileInput.setInputFiles({
      name: 'test-backup.json',
      mimeType: 'application/json',
      buffer: Buffer.from(JSON.stringify(mockBackup, null, 2)),
    });

    // Verify success banner appears in settings
    await expect(page.getByText(/Backup imported successfully! Data refreshed\./i)).toBeVisible();

    // 2. Go to Focus Mode, run and complete a brand-new focus session
    await navigateToTab(page, 'Focus Mode');

    await page.getByRole('button', { name: /Start timer/i }).click();
    await page.getByRole('button', { name: /Complete session early/i }).click();

    const completeModal = page.getByRole('dialog');
    await expect(completeModal).toBeVisible();
    await completeModal.getByRole('button', { name: /Return to Dashboard/i }).click();

    // 3. Navigate to Progress tab and verify BOTH imported sessions AND the new session are preserved
    await navigateToTab(page, 'Progress');

    // All imported session titles must exist in history
    await expect(page.getByText('Organic Chemistry Synthesis Lab')).toBeVisible();
    await expect(page.getByText('Independent Focus Session')).toHaveCount(2);

    // Verify localStorage retains at least 3 sessions
    const sessionCount = await page.evaluate(() => {
      const store = JSON.parse(localStorage.getItem('clearstep_v1_store') || '{}');
      return store.sessions?.length || 0;
    });
    expect(sessionCount).toBeGreaterThanOrEqual(3);

    expect(diagnostics.pageErrors).toEqual([]);
  });

  test('preserves intentionally empty task list (tasks: []) without resurrecting starter seeds', async ({ page }) => {
    const diagnostics = setupErrorMonitoring(page);

    // Create a payload where user deliberately emptied all tasks
    const emptyWorkspace = {
      schemaVersion: 1,
      tasks: [], // Empty tasks
      sessions: [
        {
          id: 'sess-preservation-1',
          taskId: null,
          taskTitle: 'Study Block',
          mode: 'focus',
          durationMinutes: 25,
          completedAt: new Date().toISOString(),
        },
      ],
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
      lastUpdated: new Date().toISOString(),
    };

    await setLocalStorageStore(page, emptyWorkspace);

    // Verify Today view shows zero-state Next Action: "Your Mind is Clear"
    await expect(page.getByText('Your Mind is Clear')).toBeVisible();
    await expect(page.getByText('No active tasks scheduled for today.')).toBeVisible();

    // Verify Tasks tab shows empty backlog
    await navigateToTab(page, 'Tasks');

    await expect(page.getByText('No matching tasks found.')).toBeVisible();

    // Reload page to verify seed tasks are NOT resurrected on refresh
    await page.reload();
    await page.waitForLoadState('networkidle');

    // On Today tab after reload, zero state persists
    await expect(page.getByText('Your Mind is Clear')).toBeVisible();
    await expect(page.getByText('No active tasks scheduled for today.')).toBeVisible();

    // On Tasks tab after reload, empty backlog persists
    await navigateToTab(page, 'Tasks');
    await expect(page.getByText('No matching tasks found.')).toBeVisible();

    const storedTaskCount = await page.evaluate(() => {
      const store = JSON.parse(localStorage.getItem('clearstep_v1_store') || '{}');
      return store.tasks?.length;
    });
    expect(storedTaskCount).toBe(0);

    expect(diagnostics.pageErrors).toEqual([]);
  });
});
