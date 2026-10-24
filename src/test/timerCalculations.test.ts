import { describe, it, expect } from 'vitest';
import {
  formatTimerDisplay,
  calculateRemainingSeconds,
  calculateTimerProgress,
} from '../domain/timerCalculations';

describe('timerCalculations', () => {
  it('formats seconds to MM:SS correctly', () => {
    expect(formatTimerDisplay(0)).toBe('00:00');
    expect(formatTimerDisplay(5)).toBe('00:05');
    expect(formatTimerDisplay(60)).toBe('01:00');
    expect(formatTimerDisplay(1500)).toBe('25:00');
    expect(formatTimerDisplay(3599)).toBe('59:59');
  });

  it('handles negative or invalid seconds safely', () => {
    expect(formatTimerDisplay(-10)).toBe('00:00');
  });

  it('calculates remaining seconds using absolute timestamps (immune to background throttling)', () => {
    const start = 1000000;
    const targetSeconds = 1500; // 25 min

    // Tab was in background for 300 seconds (5 minutes)
    const nowAfter5Min = start + 300 * 1000;
    const remaining = calculateRemainingSeconds(start, targetSeconds, nowAfter5Min);

    expect(remaining).toBe(1200); // 20 min left
  });

  it('clamps remaining seconds to 0 when elapsed exceeds target', () => {
    const start = 1000000;
    const targetSeconds = 60;
    const nowAfterOvertime = start + 120 * 1000;

    const remaining = calculateRemainingSeconds(start, targetSeconds, nowAfterOvertime);
    expect(remaining).toBe(0);
  });

  it('calculates timer progress percentage accurately', () => {
    expect(calculateTimerProgress(1500, 1500)).toBe(0);
    expect(calculateTimerProgress(750, 1500)).toBe(50);
    expect(calculateTimerProgress(0, 1500)).toBe(100);
    expect(calculateTimerProgress(0, 0)).toBe(0);
  });
});
