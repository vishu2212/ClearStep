import React, { useEffect } from 'react';
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Circle,
  Coffee,
  Sparkles,
  ArrowLeft,
  Check,
} from 'lucide-react';
import { useTimer } from '../../context/TimerContext';
import { useTasks } from '../../context/TaskContext';
import { FocusMode } from '../../domain/types';
import { formatTimerDisplay } from '../../domain/timerCalculations';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';

interface FocusModeViewProps {
  onExit: () => void;
}

export const FocusModeView: React.FC<FocusModeViewProps> = ({ onExit }) => {
  const {
    mode,
    targetSeconds,
    remainingSeconds,
    progressPercent,
    isRunning,
    activeTaskId,
    activeTaskTitle,
    isSessionComplete,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    switchMode,
    dismissCompleteModal,
  } = useTimer();

  const { tasks, toggleSubtask, toggleTaskCompletion } = useTasks();

  // Find active task details
  const activeTask = activeTaskId ? tasks.find((t) => t.id === activeTaskId) : null;
  const nextPendingSubtask = activeTask?.subtasks.find((s) => !s.completed) || null;

  // Spacebar keyboard listener to toggle start/pause
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        const target = e.target as HTMLElement;
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA' && target.tagName !== 'BUTTON') {
          e.preventDefault();
          if (isRunning) {
            pauseTimer();
          } else {
            if (remainingSeconds < targetSeconds && remainingSeconds > 0) {
              resumeTimer();
            } else {
              startTimer(activeTaskId, activeTaskTitle);
            }
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRunning, remainingSeconds, targetSeconds, activeTaskId, activeTaskTitle, pauseTimer, resumeTimer, startTimer]);

  const modeButtons: { id: FocusMode; label: string; icon: React.ReactNode }[] = [
    { id: 'focus', label: 'Deep Focus', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'shortBreak', label: 'Short Break', icon: <Coffee className="w-4 h-4" /> },
    { id: 'longBreak', label: 'Long Break', icon: <Coffee className="w-4 h-4" /> },
  ];

  return (
    <div className="max-w-3xl mx-auto py-6 sm:py-10 px-4">
      {/* Top back button */}
      <div className="flex items-center justify-between mb-8">
        <button
          type="button"
          onClick={onExit}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          aria-label="Exit Focus Mode (Esc)"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Overview</span>
          <kbd className="hidden sm:inline-block px-1.5 py-0.2 text-[10px] font-mono rounded bg-slate-200 dark:bg-slate-800 text-slate-500">
            Esc
          </kbd>
        </button>

        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
          Inactivity-Resilient Timer • Press <kbd className="px-1.5 py-0.5 font-mono text-[10px] bg-slate-200 dark:bg-slate-800 rounded">Space</kbd> to toggle
        </span>
      </div>

      {/* Main Focus Container */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-10 shadow-xl text-center">
        {/* Mode Selector Tabs */}
        <div
          className="inline-flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl mb-8"
          role="tablist"
          aria-label="Timer Mode"
        >
          {modeButtons.map((btn) => {
            const isCurrent = mode === btn.id;
            return (
              <button
                key={btn.id}
                role="tab"
                aria-selected={isCurrent}
                onClick={() => switchMode(btn.id)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                  isCurrent
                    ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {btn.icon}
                <span>{btn.label}</span>
              </button>
            );
          })}
        </div>

        {/* Active Task Callout (if in focus mode) */}
        {mode === 'focus' && (
          <div className="mb-6 max-w-lg mx-auto">
            {activeTaskTitle ? (
              <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-900/60">
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300 block mb-1">
                  Current Focus Target
                </span>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2 truncate">
                  {activeTaskTitle}
                </h2>

                {/* Subtask Micro-step */}
                {nextPendingSubtask && activeTask && (
                  <div className="flex items-center justify-center gap-2 pt-2 border-t border-blue-200/50 dark:border-blue-900/50 text-xs text-slate-700 dark:text-slate-300">
                    <button
                      type="button"
                      onClick={() => toggleSubtask(activeTask.id, nextPendingSubtask.id)}
                      className="text-blue-600 hover:text-blue-700 dark:text-blue-400 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                      aria-label={`Mark subtask "${nextPendingSubtask.title}" complete`}
                    >
                      <Circle className="w-4 h-4" />
                    </button>
                    <span className="font-medium truncate">
                      Next Step: {nextPendingSubtask.title}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-xs text-slate-500 dark:text-slate-400 py-2">
                Unassigned focus session. Choose a task from the Tasks tab or focus independently.
              </div>
            )}
          </div>
        )}

        {/* Large Timer Display */}
        <div className="my-8">
          <div
            aria-live="polite"
            aria-atomic="true"
            className="text-6xl sm:text-7xl font-mono font-bold tracking-tight text-slate-900 dark:text-white select-none tabular-nums"
          >
            {formatTimerDisplay(remainingSeconds)}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">
            {isRunning ? 'Session in progress...' : remainingSeconds === targetSeconds ? 'Ready to begin' : 'Paused'}
          </p>
        </div>

        {/* Progress Bar */}
        <div className="max-w-md mx-auto mb-8">
          <div
            role="progressbar"
            aria-valuenow={progressPercent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Focus timer progress"
            className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-3 overflow-hidden"
          >
            <div
              className="bg-blue-600 dark:bg-blue-500 h-full rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Timer Control Buttons */}
        <div className="flex items-center justify-center gap-3">
          {isRunning ? (
            <button
              type="button"
              onClick={pauseTimer}
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-bold text-base shadow-lg shadow-amber-500/20 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2"
              aria-label="Pause timer"
            >
              <Pause className="w-5 h-5 fill-current" />
              <span>Pause</span>
            </button>
          ) : remainingSeconds < targetSeconds && remainingSeconds > 0 ? (
            <button
              type="button"
              onClick={resumeTimer}
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-base shadow-lg shadow-blue-500/20 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
              aria-label="Resume timer"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>Resume</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => startTimer(activeTaskId, activeTaskTitle)}
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-base shadow-lg shadow-blue-500/20 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
              aria-label="Start timer"
            >
              <Play className="w-5 h-5 fill-current" />
              <span>Start</span>
            </button>
          )}

          <button
            type="button"
            onClick={resetTimer}
            aria-label="Reset timer to beginning"
            className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>

        {/* Complete Task early button */}
        {activeTask && !activeTask.completed && (
          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-center">
            <button
              type="button"
              onClick={() => toggleTaskCompletion(activeTask.id)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline"
            >
              <Check className="w-4 h-4" />
              <span>Finished early? Mark parent task complete</span>
            </button>
          </div>
        )}
      </div>

      {/* Session Complete Celebration Modal */}
      <Modal
        isOpen={isSessionComplete}
        onClose={dismissCompleteModal}
        title={mode === 'focus' ? 'Focus Session Complete!' : 'Break Finished!'}
        description="Take a moment to recognize your effort and breathe."
      >
        <div className="text-center py-4">
          <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-7 h-7 stroke-[2.5]" />
          </div>

          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
            {mode === 'focus' ? '25 Minutes of Real Focus' : 'Break Time Concluded'}
          </h3>

          <p className="text-sm text-slate-600 dark:text-slate-300 max-w-sm mx-auto mb-6">
            {mode === 'focus'
              ? `You dedicated quality time to "${activeTaskTitle || 'your focus task'}". Your effort was logged to your progress record.`
              : 'Feeling refreshed? Ready to tackle the next clear step!'}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Button
              variant="primary"
              onClick={dismissCompleteModal}
              className="w-full sm:w-auto"
            >
              {mode === 'focus' ? 'Start Short Break (5m)' : 'Start Next Focus (25m)'}
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                dismissCompleteModal();
                onExit();
              }}
              className="w-full sm:w-auto"
            >
              Back to Task List
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
