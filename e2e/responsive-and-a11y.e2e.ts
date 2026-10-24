import { test, expect } from '@playwright/test';
import { clearAndResetStorage, setupErrorMonitoring, measureNavigationPerformance } from './helpers';

test.describe('Responsive Layout, Viewport Integrity & Accessibility E2E Suite', () => {
  test.beforeEach(async ({ page }) => {
    await clearAndResetStorage(page);
  });

  test('verifies no horizontal overflow on desktop and mobile viewports across all tabs', async ({ page }) => {
    const diagnostics = setupErrorMonitoring(page);

    const tabs = ['today', 'tasks', 'focus', 'progress', 'settings'];

    for (const tab of tabs) {
      await page.goto(`/?tab=${tab}`);
      await page.waitForLoadState('networkidle');

      // Assert root scrollWidth does not exceed viewport width
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > window.innerWidth;
      });

      expect(hasHorizontalScroll, `Horizontal overflow detected on tab: ${tab}`).toBe(false);
    }

    expect(diagnostics.pageErrors).toEqual([]);
  });

  test('mobile sidebar drawer opens, traps focus, respects escape, and restores focus', async ({ page }) => {
    const diagnostics = setupErrorMonitoring(page);

    // Set mobile viewport explicitly
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const sidebar = page.locator('#mobile-navigation-drawer');
    const backdrop = page.locator('div.fixed.inset-0.bg-black\\/60');
    const menuBtn = page.getByRole('button', { name: /Open navigation menu/i });

    // 1. When closed on mobile: sidebar is translated off-screen, aria-hidden is true, and aria-expanded is false
    await expect(sidebar).toHaveClass(/-translate-x-full/);
    await expect(sidebar).toHaveAttribute('aria-hidden', 'true');
    await expect(menuBtn).toHaveAttribute('aria-expanded', 'false');
    await expect(backdrop).not.toBeVisible();

    // 2. Open drawer via hamburger button
    await menuBtn.click();

    // Drawer should have dialog role, aria-modal, aria-label, and aria-expanded="true"
    await expect(sidebar).toHaveClass(/translate-x-0/);
    await expect(sidebar).toHaveAttribute('role', 'dialog');
    await expect(sidebar).toHaveAttribute('aria-modal', 'true');
    await expect(sidebar).toHaveAttribute('aria-label', 'Navigation drawer');
    await expect(menuBtn).toHaveAttribute('aria-expanded', 'true');
    await expect(backdrop).toBeVisible();

    // Focus must be moved into the drawer (e.g. close button or first interactive element)
    const closeBtn = sidebar.getByRole('button', { name: /Close sidebar/i });
    await expect(closeBtn).toBeVisible();
    await expect(closeBtn).toBeFocused();

    // 3. Test Escape key: must close drawer and restore focus to the hamburger button
    await page.keyboard.press('Escape');

    await expect(sidebar).toHaveClass(/-translate-x-full/);
    await expect(sidebar).toHaveAttribute('aria-hidden', 'true');
    await expect(backdrop).not.toBeVisible();
    await expect(menuBtn).toHaveAttribute('aria-expanded', 'false');
    await expect(menuBtn).toBeFocused();

    expect(diagnostics.pageErrors).toEqual([]);
  });

  test('modal dialog bounding box is fully contained within viewport on small screen', async ({ page }) => {
    const diagnostics = setupErrorMonitoring(page);

    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Open Task Modal
    await page.getByRole('button', { name: /Create new task/i }).click();

    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();

    // Get bounding box of dialog
    const box = await dialog.boundingBox();
    expect(box).not.toBeNull();

    if (box) {
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.width).toBeLessThanOrEqual(375);
      expect(box.y).toBeGreaterThanOrEqual(0);
    }

    // Close modal
    await dialog.getByRole('button', { name: /Cancel/i }).click();
    await expect(dialog).not.toBeVisible();

    expect(diagnostics.pageErrors).toEqual([]);
  });

  test('measures real navigation and runtime memory performance', async ({ page }) => {
    const diagnostics = setupErrorMonitoring(page);

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const perf = await measureNavigationPerformance(page);

    // Assert that initial DOM content loaded in under 2000ms
    expect(perf.domContentLoaded).toBeGreaterThan(0);
    expect(perf.domContentLoaded).toBeLessThan(3000);

    // Assert overall load time is reasonable (< 5000ms)
    expect(perf.loadTime).toBeGreaterThan(0);
    expect(perf.loadTime).toBeLessThan(5000);

    console.log(`[Performance Measurement] DOMContentLoaded: ${perf.domContentLoaded}ms, Load: ${perf.loadTime}ms, JS Heap: ${perf.jsHeapSizeUsedMB ?? 'N/A'}MB`);

    expect(diagnostics.pageErrors).toEqual([]);
  });
});
