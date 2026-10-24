/**
 * Formats a duration in seconds to MM:SS string
 */
export function formatTimerDisplay(totalSeconds: number): string {
  const safeSeconds = Math.max(0, Math.floor(totalSeconds));
  const minutes = Math.floor(safeSeconds / 60);
  const seconds = safeSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

/**
 * Calculates remaining seconds using wall-clock timestamp delta
 * to prevent background tab sleep/throttling drift.
 */
export function calculateRemainingSeconds(
  startTimestamp: number,
  targetDurationSeconds: number,
  currentTimestamp: number = Date.now()
): number {
  const elapsedMs = currentTimestamp - startTimestamp;
  const elapsedSeconds = Math.max(0, Math.floor(elapsedMs / 1000));
  return Math.max(0, targetDurationSeconds - elapsedSeconds);
}

/**
 * Calculates percentage of timer completed (0 to 100)
 */
export function calculateTimerProgress(remainingSeconds: number, targetDurationSeconds: number): number {
  if (targetDurationSeconds <= 0) return 0;
  const elapsed = targetDurationSeconds - remainingSeconds;
  const percent = (elapsed / targetDurationSeconds) * 100;
  return Math.min(100, Math.max(0, Math.round(percent)));
}
