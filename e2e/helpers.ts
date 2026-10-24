import { Page, expect } from '@playwright/test';

export interface CapturedDiagnostics {
  consoleErrors: string[];
  consoleWarnings: string[];
  pageErrors: Error[];
}

export function setupErrorMonitoring(page: Page): CapturedDiagnostics {
  const diagnostics: CapturedDiagnostics = {
    consoleErrors: [],
    consoleWarnings: [],
    pageErrors: [],
  };

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      diagnostics.consoleErrors.push(msg.text());
    } else if (msg.type() === 'warning') {
      diagnostics.consoleWarnings.push(msg.text());
    }
  });

  page.on('pageerror', (err) => {
    diagnostics.pageErrors.push(err);
  });

  return diagnostics;
}

export async function clearAndResetStorage(page: Page): Promise<void> {
  await page.goto('/');
  await page.evaluate(() => {
    localStorage.clear();
  });
  await page.reload();
  await page.waitForLoadState('networkidle');
}

export async function setLocalStorageStore(page: Page, storeData: unknown): Promise<void> {
  await page.goto('/');
  await page.evaluate((data) => {
    localStorage.setItem('clearstep_v1_store', JSON.stringify(data));
  }, storeData);
  await page.reload();
  await page.waitForLoadState('networkidle');
}

export async function navigateToTab(
  page: Page,
  tabName: 'Today' | 'Tasks' | 'Focus Mode' | 'Progress' | 'Settings'
): Promise<void> {
  const menuBtn = page.getByRole('button', { name: /Open navigation menu/i });
  if (await menuBtn.isVisible()) {
    await menuBtn.click();
    const nav = page.getByRole('navigation', { name: /Main Navigation/i });
    const tabBtn = nav.getByRole('button', { name: new RegExp(`^${tabName}$`, 'i') });
    await expect(tabBtn).toBeVisible();
    await tabBtn.click();
  } else {
    const nav = page.getByRole('navigation', { name: /Main Navigation/i });
    const tabBtn = nav.getByRole('button', { name: new RegExp(`^${tabName}$`, 'i') });
    await expect(tabBtn).toBeVisible();
    await tabBtn.click();
  }
}

export async function measureNavigationPerformance(page: Page): Promise<{
  domContentLoaded: number;
  loadTime: number;
  jsHeapSizeUsedMB?: number;
}> {
  return await page.evaluate(() => {
    const navEntries = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[];
    const nav = navEntries[0];
    const memory = (performance as unknown as { memory?: { usedJSHeapSize: number } }).memory;

    return {
      domContentLoaded: nav ? Math.round(nav.domContentLoadedEventEnd - nav.startTime) : 0,
      loadTime: nav ? Math.round(nav.loadEventEnd - nav.startTime) : 0,
      jsHeapSizeUsedMB: memory ? Math.round((memory.usedJSHeapSize / (1024 * 1024)) * 10) / 10 : undefined,
    };
  });
}
