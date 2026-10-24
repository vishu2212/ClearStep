import React, { useEffect, useState, useRef } from 'react';
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
  Volume2,
  VolumeX,
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

  // Ambient sound generator state (Web Audio API - 100% offline)
  const [ambientSound, setAmbientSound] = useState<'mute' | 'brown' | 'rain'>('mute');
  const [ambientVolume, setAmbientVolume] = useState<number>(0.3);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const noiseSourceRef = useRef<AudioBufferSourceNode | null>(null);

  // Stop ambient sound
  const stopAmbient = () => {
    if (noiseSourceRef.current) {
      try {
        noiseSourceRef.current.stop();
        noiseSourceRef.current.disconnect();
      } catch {}
      noiseSourceRef.current = null;
    }
  };

  // Start or change ambient sound using Web Audio API
  useEffect(() => {
    if (ambientSound === 'mute') {
      stopAmbient();
      return;
    }

    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      stopAmbient();

      // Create brown noise buffer
      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        if (ambientSound === 'brown') {
          // Brown noise algorithm
          data[i] = (lastOut + 0.02 * white) / 1.02;
          lastOut = data[i];
          data[i] *= 3.5;
        } else {
          // Rain algorithm (pink / soft white filtered)
          data[i] = (lastOut + 0.05 * white) / 1.05;
          lastOut = data[i];
          data[i] *= 2.0;
        }
      }

      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = buffer;
      noiseSource.loop = true;

      const gain = ctx.createGain();
      gain.gain.value = ambientVolume;
      gainNodeRef.current = gain;

      noiseSource.connect(gain);
      gain.connect(ctx.destination);
      noiseSource.start();
      noiseSourceRef.current = noiseSource;
    } catch (err) {
      console.warn('Web Audio error:', err);
    }

    return () => {
      stopAmbient();
    };
  }, [ambientSound]);

  // Update volume
  useEffect(() => {
    if (gainNodeRef.current && audioCtxRef.current) {
      gainNodeRef.current.gain.setValueAtTime(ambientVolume, audioCtxRef.current.currentTime);
    }
  }, [ambientVolume]);

  // Active task details
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

  // SVG circular timer calculations (radius 130, circumference ~816)
  const radius = 130;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  return (
    <div className="max-w-3xl mx-auto py-6 sm:py-8 px-4">
      {/* Top back navigation */}
      <div className="flex items-center justify-between mb-6">
        <button
          type="button"
          onClick={onExit}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          aria-label="Exit Focus Mode (Esc)"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit Focus Mode</span>
          <kbd className="hidden sm:inline-block px-1.5 py-0.2 text-[10px] font-mono rounded bg-slate-200 dark:bg-slate-800 text-slate-500">
            Esc
          </kbd>
        </button>

        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
            Flow Guard Active • <kbd className="px-1.5 py-0.5 font-mono text-[10px] bg-slate-200 dark:bg-slate-800 rounded">Space</kbd> to toggle
          </span>
        </div>
      </div>

      {/* Main Focus Container */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl text-center">
        {/* Mode Selector Tabs */}
        <div
          className="inline-flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl mb-6"
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

        {/* Active Task Target Card */}
        {mode === 'focus' && (
          <div className="mb-6 max-w-lg mx-auto">
            {activeTaskTitle ? (
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 block mb-1">
                  Current Focus Target
                </span>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2 truncate">
                  {activeTaskTitle}
                </h2>

                {/* Subtask Micro-step */}
                {nextPendingSubtask && activeTask && (
                  <div className="flex items-center justify-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300">
                    <button
                      type="button"
                      onClick={() => toggleSubtask(activeTask.id, nextPendingSubtask.id)}
                      className="text-blue-600 hover:text-blue-700 dark:text-blue-400 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                      aria-label={`Mark subtask "${nextPendingSubtask.title}" complete`}
                    >
                      <Circle className="w-4 h-4" />
                    </button>
                    <span className="font-medium truncate">
                      Next Micro-Step: {nextPendingSubtask.title}
                    </span>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-xs text-slate-500 dark:text-slate-400 py-1">
                Independent session. (Choose a task from Today or Tasks tab to link directly).
              </div>
            )}
          </div>
        )}

        {/* Monumental Circular Timer Ring (Stitch Design Specification) */}
        <div className="relative w-72 h-72 sm:w-80 sm:h-80 mx-auto my-2 flex items-center justify-center">
          <svg className="w-full h-full transform -rotate-90" viewBox="0 0 300 300">
            {/* Background circular track */}
            <circle
              className="text-slate-100 dark:text-slate-800"
              cx="150"
              cy="150"
              r={radius}
              fill="transparent"
              stroke="currentColor"
              strokeWidth="10"
            />
            {/* Animated progress ring */}
            <circle
              className="text-blue-600 dark:text-blue-500 transition-all duration-300 ease-out"
              cx="150"
              cy="150"
              r={radius}
              fill="transparent"
              stroke="currentColor"
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
            />
          </svg>

          {/* Core Numeric Center Display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center select-none">
            <span className="text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-1">
              Time Remaining
            </span>
            <div
              aria-live="polite"
              aria-atomic="true"
              className="text-5xl sm:text-6xl font-mono font-bold tracking-tight text-slate-900 dark:text-white tabular-nums"
            >
              {formatTimerDisplay(remainingSeconds)}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 font-medium">
              {isRunning ? 'Deep work block active' : remainingSeconds === targetSeconds ? 'Ready to start' : 'Paused'}
            </p>
          </div>
        </div>

        {/* Control Deck (Stitch Layout: +5m, Play/Pause [Space], Reset) */}
        <div className="flex items-center justify-center gap-3 mt-6">
          {/* Play / Pause Primary Action */}
          {isRunning ? (
            <button
              type="button"
              onClick={pauseTimer}
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-bold text-base shadow-lg shadow-amber-500/20 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2"
              aria-label="Pause timer"
            >
              <Pause className="w-5 h-5 fill-current" />
              <span>Pause</span>
              <span className="text-xs px-1.5 py-0.5 rounded bg-black/15 font-mono">Space</span>
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
              <span className="text-xs px-1.5 py-0.5 rounded bg-black/15 font-mono">Space</span>
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
              <span className="text-xs px-1.5 py-0.5 rounded bg-black/15 font-mono">Space</span>
            </button>
          )}

          {/* Reset Button */}
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
          <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-center">
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

        {/* Ambient Focus Sound Generator (Stitch Design Pattern - 100% Offline) */}
        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
            {ambientSound !== 'mute' ? (
              <Volume2 className="w-4 h-4 text-emerald-500 animate-pulse" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-400" />
            )}
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              Focus Noise:
            </span>
            <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-700 p-0.5 bg-slate-50 dark:bg-slate-800">
              <button
                type="button"
                onClick={() => setAmbientSound('mute')}
                className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors ${
                  ambientSound === 'mute'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm font-semibold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Mute
              </button>
              <button
                type="button"
                onClick={() => setAmbientSound('brown')}
                className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors ${
                  ambientSound === 'brown'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm font-semibold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Brown Noise
              </button>
              <button
                type="button"
                onClick={() => setAmbientSound('rain')}
                className={`px-2 py-1 rounded-md text-[11px] font-medium transition-colors ${
                  ambientSound === 'rain'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-sm font-semibold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Soft Rain
              </button>
            </div>
          </div>

          {ambientSound !== 'mute' && (
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-400">Volume</span>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={ambientVolume}
                onChange={(e) => setAmbientVolume(parseFloat(e.target.value))}
                className="w-20 accent-blue-600"
                aria-label="Ambient volume"
              />
            </div>
          )}
        </div>
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
            {mode === 'focus' ? 'Quality Focus Logged' : 'Break Time Concluded'}
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
