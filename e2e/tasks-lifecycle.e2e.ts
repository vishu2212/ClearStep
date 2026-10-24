import { test, expect } from '@playwright/test';
import { clearAndResetStorage, setupErrorMonitoring, navigateToTab } from './helpers';

test.describe('Task Lifecycle & Micro-Steps E2E Suite', () => {
  test.beforeEach(async ({ page }) => {
    await clearAndResetStorage(page);
  });

  test('creates, edits, completes, and deletes a task', async ({ page }) => {
    const diagnostics = setupErrorMonitoring(page);

    // 1. Create a task via Quick Add
    const quickAdd = page.locator('#quick-add-task-input');
    await expect(quickAdd).toBeVisible();
    await quickAdd.fill('CS 101 Assignment 1 - Recursion');
    await quickAdd.press('Enter');

    // Verify task row appears in Today list
    const taskRow = page.locator('#task-rows-container').filter({ hasText: 'CS 101 Assignment 1 - Recursion' });
    await expect(taskRow).toBeVisible();

    // 2. Open task modal to edit it
    const optionsBtn = page.getByRole('button', { name: /Task options for CS 101 Assignment 1 - Recursion/i });
    await optionsBtn.click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText('Edit Task & Steps');

    // Update title and description
    const titleInput = dialog.locator('#task-title');
    await titleInput.fill('CS 101 Assignment 1 - Recursion & Trees');

    const descInput = dialog.locator('#task-desc');
    await descInput.fill('Solve problem 1 to 5 from chapter 4');

    // Set priority to Urgent
    await dialog.locator('#task-priority').selectOption('urgent');

    // Save changes
    const saveBtn = dialog.getByRole('button', { name: /Save Changes/i });
    await saveBtn.click();

    await expect(dialog).not.toBeVisible();

    // Verify updated title in Today list
    const updatedRow = page.locator('#task-rows-container').filter({ hasText: 'CS 101 Assignment 1 - Recursion & Trees' });
    await expect(updatedRow).toBeVisible();
    await expect(updatedRow).toContainText('urgent Priority');

    // 3. Mark task completed
    const completeCheckbox = updatedRow.getByRole('checkbox', {
      name: /Mark "CS 101 Assignment 1 - Recursion & Trees" as complete/i,
    });
    await completeCheckbox.click({ force: true });

    // Verify task row shows completed styling / status
    await expect(updatedRow).toContainText('Completed');

    // 4. Navigate to Tasks tab and delete the task
    await navigateToTab(page, 'Tasks');

    const taskArticle = page.getByRole('article', { name: /Task: CS 101 Assignment 1 - Recursion & Trees/i });
    await expect(taskArticle).toBeVisible();

    // Click delete task button -> in-app accessible ConfirmModal appears
    const deleteBtn = taskArticle.getByRole('button', { name: /Delete task/i });
    await deleteBtn.click();

    const confirmModal = page.getByRole('dialog');
    await expect(confirmModal).toBeVisible();
    await expect(confirmModal).toContainText('Are you sure you want to delete');

    // Confirm deletion inside modal
    const confirmDeleteBtn = confirmModal.getByRole('button', { name: /^Delete Task$/i });
    await confirmDeleteBtn.click();
    await expect(confirmModal).not.toBeVisible();

    // Verify task is removed
    await expect(page.getByRole('article', { name: /Task: CS 101 Assignment 1 - Recursion & Trees/i })).not.toBeVisible();

    // Assert zero uncaught page errors
    expect(diagnostics.pageErrors).toEqual([]);
  });

  test('creates subtasks, renames completed subtasks, supports duplicate titles, and preserves completion state across page reload', async ({
    page,
  }) => {
    const diagnostics = setupErrorMonitoring(page);

    // Open "Create New Task" modal
    const addTaskBtn = page.getByRole('button', { name: /Create new task/i });
    await addTaskBtn.click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    // Fill unique title (to avoid matching seed tasks)
    await dialog.locator('#task-title').fill('Advanced Biochemistry Thesis');

    // Add 3 subtasks, including duplicate titles
    const subtaskInput = dialog.getByPlaceholder(/e\.g\. Find 2 primary research sources/i);
    const addSubtaskBtn = dialog.getByRole('button', { name: /Add Step/i });

    await subtaskInput.fill('Literature Review');
    await addSubtaskBtn.click();

    await subtaskInput.fill('Literature Review'); // Duplicate title
    await addSubtaskBtn.click();

    await subtaskInput.fill('Statistical Analysis');
    await addSubtaskBtn.click();

    // Verify 3 subtasks listed
    const stepInputs = dialog.locator('input[aria-label*="Edit step"]');
    await expect(stepInputs).toHaveCount(3);

    // Submit modal
    await dialog.getByRole('button', { name: /Create Task/i }).click();
    await expect(dialog).not.toBeVisible();

    // Navigate to Tasks tab to view the subtasks and toggle them
    await navigateToTab(page, 'Tasks');

    const taskCard = page.getByRole('article', { name: 'Task: Advanced Biochemistry Thesis', exact: true });
    await expect(taskCard).toBeVisible();

    // Expand subtasks list
    const expandBtn = taskCard.getByRole('button', { name: /Subtasks:/i });
    await expandBtn.click();

    // Complete the first "Literature Review" subtask
    const subtaskCheckboxes = taskCard.locator('button[aria-label*="Toggle subtask"]');
    await expect(subtaskCheckboxes).toHaveCount(3);
    await subtaskCheckboxes.first().click();

    // Verify progress is 1 of 3 (33%)
    await expect(taskCard).toContainText('Subtasks: 1/3');

    // Now edit the task via TaskModal to rename the completed subtask
    const editBtn = taskCard.getByRole('button', { name: /Edit task "Advanced Biochemistry Thesis"/i });
    await editBtn.click();

    const editDialog = page.getByRole('dialog');
    await expect(editDialog).toBeVisible();

    // The first subtask input should be line-through / completed
    const step1Input = editDialog.getByLabel(/Edit step 1: Literature Review/i);
    await expect(step1Input).toHaveClass(/line-through/);

    // Rename the completed subtask
    await step1Input.fill('Literature Review (Finalized Sources)');

    // Save changes
    await editDialog.getByRole('button', { name: /Save Changes/i }).click();
    await expect(editDialog).not.toBeVisible();

    // RELOAD THE PAGE TO TEST FULL DISK PERSISTENCE
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Go back to Tasks tab
    await navigateToTab(page, 'Tasks');

    const reloadedCard = page.getByRole('article', { name: 'Task: Advanced Biochemistry Thesis', exact: true });
    await expect(reloadedCard).toBeVisible();

    // Expand subtasks
    await reloadedCard.getByRole('button', { name: /Subtasks:/i }).click();

    // Verify completion status persisted: 1/3 completed
    await expect(reloadedCard).toContainText('Subtasks: 1/3');
    await expect(reloadedCard).toContainText('Literature Review (Finalized Sources)');

    // The renamed step must still be marked completed (has line-through)
    const renamedStepText = reloadedCard.locator('span', { hasText: 'Literature Review (Finalized Sources)' });
    await expect(renamedStepText).toHaveClass(/line-through/);

    // Complete remaining 2 subtasks -> parent task must auto-complete
    const remainingCheckboxes = reloadedCard.locator('button[aria-label*="Toggle subtask"]');
    await remainingCheckboxes.nth(1).click(); // second subtask
    await remainingCheckboxes.nth(2).click(); // third subtask

    // Verify parent task shows completed
    await expect(reloadedCard).toContainText('Subtasks: 3/3');
    await expect(reloadedCard.getByRole('button', { name: /Reopen task "Advanced Biochemistry Thesis"/i })).toBeVisible();

    expect(diagnostics.pageErrors).toEqual([]);
  });
});
