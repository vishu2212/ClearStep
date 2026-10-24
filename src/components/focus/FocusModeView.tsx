import React, { useEffect, useState, useRef } from 'react';
import {
  ArrowLeft,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Check,
  Volume2,
  VolumeX,
  Maximize2,
  Minimize2,
  Sparkles,
  Coffee,
  School,
  Edit3,
  Clock,
  MoreHorizontal,
  ExternalLink,
  Plus,
  Send,
} from 'lucide-react';
import { useTimer } from '../../context/TimerContext';
import { useTasks } from '../../context/TaskContext';
import { formatTimerDisplay } from '../../domain/timerCalculations';

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
    addSeconds,
    completeSessionNow,
    dismissCompleteModal,
  } = useTimer();

  const { tasks, toggleSubtask, toggleTaskCompletion, createTask } = useTasks();

  // Fullscreen State
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
      setIsFullscreen(false);
    }
  };

  // Exit Confirmation Modal State
  const [showExitConfirm, setShowExitConfirm] = useState(false);

  const handleExitClick = () => {
    if (isRunning) {
      setShowExitConfirm(true);
    } else {
      onExit();
    }
  };

  const handleConfirmExit = () => {
    pauseTimer();
    setShowExitConfirm(false);
    onExit();
  };

  // Active Task details
  const activeTask = activeTaskId ? tasks.find((t) => t.id === activeTaskId) : null;
  const courseTag = activeTask?.tags?.[0] || (activeTask ? 'Task Focus' : activeTaskTitle ? 'Focus Session' : 'Deep Work');
  const taskTitle = activeTask?.title || activeTaskTitle || 'Independent Focus Session';

  // Fallback default subtasks if active task has none
  const defaultSubtasks = [
    { id: 'sub-1', title: 'Clarify current focus goal & eliminate distractions', completed: false, note: 'Close unrelated browser tabs and define target deliverable', duration: 'Step 1' },
    { id: 'sub-2', title: 'Engage in uninterrupted deep work', completed: false, note: 'Sustain single-task focus without context switching', duration: 'Step 2' },
    { id: 'sub-3', title: 'Review progress & record notes', completed: false, note: 'Capture accomplishments and log remaining questions before break', duration: 'Step 3' },
  ];

  const hasRealSubtasks = activeTask && activeTask.subtasks && activeTask.subtasks.length > 0;
  const currentSubtasks = hasRealSubtasks ? activeTask.subtasks : defaultSubtasks;
  const completedSubtasksCount = currentSubtasks.filter((s) => s.completed).length;
  const totalSubtasksCount = currentSubtasks.length;

  // Distraction Vault / Scratchpad State (Buffered Thoughts)
  const [scratchpadText, setScratchpadText] = useState<string>(() => {
    return localStorage.getItem('clearstep_distraction_scratchpad') ||
      '• Remember to email Dr. Vasquez about citation style...\n• Check library reserve shelf 4B tomorrow\n• Quick thought: tie cognitive bandwidth to smartphone notifications in section 2';
  });
  const [inboxTransferNotice, setInboxTransferNotice] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('clearstep_distraction_scratchpad', scratchpadText);
  }, [scratchpadText]);

  const thoughtsCount = scratchpadText
    .split('\n')
    .map((l) => l.replace(/^[•\-\*\s]+/, '').trim())
    .filter(Boolean).length;

  const handleTransferToInbox = () => {
    const lines = scratchpadText
      .split('\n')
      .map((l) => l.replace(/^[•\-\*\s]+/, '').trim())
      .filter(Boolean);

    if (lines.length === 0) return;

    lines.forEach((line) => {
      createTask({
        title: line,
        priority: 'medium',
        dueDate: new Date().toISOString().split('T')[0],
        tags: ['Distraction Vault'],
        subtasks: [],
        isFocusPinned: false,
      });
    });

    setScratchpadText('');
    setInboxTransferNotice(`Transferred ${lines.length} thoughts directly to your Tasks Inbox.`);
    setTimeout(() => setInboxTransferNotice(null), 4000);
  };

  // Ambient sound generator state (Web Audio API - 100% offline)
  type AmbientSound = 'mute' | 'brown' | 'rain' | 'lofi';
  const [ambientSound, setAmbientSound] = useState<AmbientSound>('brown');
  const [ambientVolume, setAmbientVolume] = useState<number>(0.65);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const noiseSourceRef = useRef<AudioBufferSourceNode | null>(null);

  const stopAmbient = () => {
    if (noiseSourceRef.current) {
      try {
        noiseSourceRef.current.stop();
        noiseSourceRef.current.disconnect();
      } catch {}
      noiseSourceRef.current = null;
    }
  };

  useEffect(() => {
    if (ambientSound === 'mute') {
      stopAmbient();
      return;
    }

    try {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtxClass) {
        return;
      }
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtxClass();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      stopAmbient();

      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);

      let lastOut = 0.0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        if (ambientSound === 'brown') {
          data[i] = (lastOut + 0.02 * white) / 1.02;
          lastOut = data[i];
          data[i] *= 3.5;
        } else if (ambientSound === 'rain') {
          data[i] = (lastOut + 0.05 * white) / 1.05;
          lastOut = data[i];
          data[i] *= 2.0;
        } else {
          // Warm Lo-Fi gentle filtered frequency
          data[i] = (lastOut + 0.015 * white) / 1.015;
          lastOut = data[i];
          data[i] *= 2.8;
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

  useEffect(() => {
    if (gainNodeRef.current && audioCtxRef.current) {
      gainNodeRef.current.gain.setValueAtTime(ambientVolume, audioCtxRef.current.currentTime);
    }
  }, [ambientVolume]);

  // Spacebar and Esc Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = (document.activeElement?.tagName || '').toLowerCase();
      const isInput = activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select';

      if (e.code === 'Space' && !isInput) {
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
      } else if (e.key === 'Escape') {
        if (showExitConfirm) {
          setShowExitConfirm(false);
        } else if (isSessionComplete) {
          dismissCompleteModal();
        } else {
          handleExitClick();
        }
      } else if ((e.key === 'f' || e.key === 'F') && !isInput) {
        e.preventDefault();
        toggleFullscreen();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isRunning, remainingSeconds, targetSeconds, activeTaskId, activeTaskTitle, showExitConfirm, isSessionComplete]);

  // SVG Circular Timer Geometry (Exact 320x320 dimensions matching Stitch)
  const radius = 140;
  const circumference = 2 * Math.PI * radius; // 879.64
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;
  const elapsedSeconds = Math.max(0, targetSeconds - remainingSeconds);

  return (
    <div className="relative min-h-screen bg-bg-page px-space-md sm:px-space-xl py-space-md text-text-primary flex flex-col font-body-md selection:bg-brand-tint selection:text-brand-strong animate-fade-in">
      {/* Page Heading & Caption */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-space-md mb-space-md">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-text-primary tracking-tight font-semibold">
            Protect your focus
          </h1>
          <p className="font-body-md text-body-md text-text-secondary mt-1">
            Work on one task at a time, with fewer distractions.
          </p>
        </div>
      </div>

      {/* 1. MINIMALIST FOCUS HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-space-md mb-space-lg border-b border-border-subtle/30 gap-space-sm">
        {/* Left: Exit button & Task breadcrumbs cleanly grouped */}
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          <button
            onClick={handleExitClick}
            id="exit-btn"
            className="h-[40px] px-3.5 py-1.5 rounded-lg bg-bg-surface hover:bg-bg-sunken text-text-secondary hover:text-text-primary border border-border-subtle/40 transition-colors font-title-sm text-title-sm cursor-pointer select-none shadow-xs inline-flex items-center gap-2"
            aria-label="Exit Focus Mode (Esc)"
            type="button"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Exit Focus Mode</span>
            <span className="ml-1 px-1.5 py-0.5 rounded bg-bg-sunken text-text-tertiary font-label-sm text-xs uppercase font-mono">
              Esc
            </span>
          </button>

          <div className="hidden sm:block h-4 w-px bg-border-subtle/60"></div>

          <div className="flex flex-wrap items-center gap-2 font-label-md text-label-md text-text-secondary">
            <span className="px-2.5 py-0.5 rounded-full bg-brand-tint text-brand-strong font-semibold text-xs">
              {courseTag}
            </span>
            <span className="text-text-tertiary">Senior Thesis</span>
            <span className="text-border-strong select-none">/</span>
            <span className="text-text-primary font-title-sm text-title-sm font-semibold truncate max-w-[260px]">
              {taskTitle}
            </span>
            <span className="text-border-strong select-none">•</span>
            <span className="text-text-tertiary font-medium text-xs">Deep Block 1 of 3</span>
          </div>
        </div>

        {/* Right: Mode pills, Flow Guard Active, and Fullscreen button separated */}
        <div className="flex items-center gap-3 self-end sm:self-auto">
          {/* Mode Selector Pill */}
          <div className="hidden md:inline-flex items-center p-0.5 bg-bg-sunken border border-border-subtle/40 rounded-lg" role="tablist">
            <button
              onClick={() => switchMode('focus')}
              className={`px-3 py-1 rounded-md font-label-md text-xs sm:text-sm font-semibold transition-all ${
                mode === 'focus' ? 'bg-bg-surface text-brand shadow-xs' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Deep Focus
            </button>
            <button
              onClick={() => switchMode('shortBreak')}
              className={`px-3 py-1 rounded-md font-label-md text-xs sm:text-sm font-semibold transition-all ${
                mode === 'shortBreak' ? 'bg-bg-surface text-brand shadow-xs' : 'text-text-secondary hover:text-text-primary'
              }`}
            >
              Short Break
            </button>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-bg-surface border border-border-subtle/30 shadow-xs text-brand font-label-md text-xs sm:text-sm">
            <span className="w-2 h-2 rounded-full bg-brand animate-pulse"></span>
            <span className="font-medium">Flow Guard Active</span>
          </div>

          <button
            onClick={toggleFullscreen}
            id="fullscreen-btn"
            className="h-[36px] flex items-center gap-1.5 px-3 rounded-lg bg-bg-surface hover:bg-bg-sunken text-text-secondary hover:text-text-primary border border-border-subtle/40 shadow-xs transition-colors font-label-md text-xs sm:text-sm cursor-pointer select-none"
            aria-label="Toggle Fullscreen (F)"
            type="button"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            <span className="hidden sm:inline">Fullscreen [F]</span>
          </button>
        </div>
      </div>

      {/* 2. MAIN FOCUS ARENA: ASYMMETRIC GRID SPLIT */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-gutter-desktop items-start max-w-[1240px] w-full mx-auto min-w-0">
        {/* LEFT COLUMN: TIMER & IMMERSION CORE (7 COLUMNS ON XL) */}
        <div className="col-span-1 xl:col-span-7 flex flex-col gap-space-xl min-w-0 w-full">
          {/* MONUMENTAL TIMER CARD */}
          <div className="relative overflow-hidden rounded-xl bg-bg-surface p-space-xl sm:p-space-2xl shadow-sm flex flex-col items-center justify-center text-center border border-border-subtle/40">
            {/* Subtle Top Context Label */}
            <div className="flex items-center gap-space-xs mb-space-md">
              <span className="px-space-sm py-space-xxs rounded-full bg-brand-tint text-brand-strong font-label-sm text-label-sm uppercase tracking-wider font-semibold">
                {mode === 'focus' ? 'Deep Cognitive Block' : 'Restorative Break'}
              </span>
              <span className="font-label-sm text-label-sm text-text-secondary">
                Target: {Math.floor(targetSeconds / 60)}m 00s
              </span>
            </div>

            {/* Monumental 320px SVG Timer & Progress Ring */}
            <div className="relative w-72 h-72 sm:w-80 sm:h-80 flex items-center justify-center my-space-md">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 320 320">
                {/* Background Track Circle */}
                <circle
                  className="text-bg-sunken"
                  cx="160"
                  cy="160"
                  fill="transparent"
                  r="140"
                  stroke="currentColor"
                  strokeWidth="6"
                />
                {/* Active Progress Circle */}
                <circle
                  className="text-brand transition-all duration-300 ease-out"
                  cx="160"
                  cy="160"
                  fill="transparent"
                  id="timer-progress"
                  r="140"
                  stroke="currentColor"
                  strokeDasharray="879.6"
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  strokeWidth="6"
                />
              </svg>

              {/* Core Numeric Center Display */}
              <div className="absolute inset-0 flex flex-col items-center justify-center select-none pointer-events-none">
                <span className="font-label-sm text-label-sm uppercase tracking-widest text-text-tertiary mb-1">
                  Time Remaining
                </span>
                <div
                  id="timer-display"
                  className="font-numeric-timer text-[56px] sm:text-[64px] leading-none text-text-primary tracking-tight font-bold"
                  aria-live="polite"
                  aria-atomic="true"
                >
                  {formatTimerDisplay(remainingSeconds)}
                </div>
                <div className="flex items-center gap-space-xs mt-space-sm font-label-md text-label-md text-text-secondary">
                  <Clock className="w-4 h-4 text-brand" />
                  <span>{formatTimerDisplay(elapsedSeconds)} elapsed</span>
                </div>
              </div>
            </div>

            {/* Control Deck: +5 Min, Reset, Play/Pause [Space], Complete (Unified 48px height) */}
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mt-space-md">
              <button
                onClick={() => addSeconds(300)}
                id="add-time-btn"
                className="h-[48px] px-4 rounded-xl bg-bg-sunken hover:bg-border-subtle/40 text-text-primary border border-border-subtle/40 font-label-md text-label-md font-semibold inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer select-none"
                type="button"
                aria-label="Add 5 minutes to timer"
              >
                <Plus className="w-4 h-4" />
                <span>+5 Min</span>
              </button>

              <button
                onClick={() => {
                  setHasStarted(false);
                  resetTimer();
                }}
                id="reset-timer-btn"
                className="h-[48px] w-[48px] rounded-xl bg-bg-sunken hover:bg-border-subtle/40 text-text-secondary hover:text-text-primary border border-border-subtle/40 transition-colors inline-flex items-center justify-center cursor-pointer select-none"
                type="button"
                aria-label="Reset timer"
                title="Reset timer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>

              {/* Primary Play / Pause CTA */}
              {isRunning ? (
                <button
                  onClick={pauseTimer}
                  id="play-pause-btn"
                  className="h-[48px] px-6 sm:px-7 rounded-xl bg-brand hover:bg-brand-strong text-brand-on font-title-sm text-title-sm sm:font-title-md sm:text-title-md font-semibold shadow-sm transition-all transform active:scale-95 inline-flex items-center justify-center gap-2 cursor-pointer select-none"
                  type="button"
                  aria-label="Pause timer"
                >
                  <Pause className="w-5 h-5 fill-current" />
                  <span id="play-pause-label">Pause</span>
                  <span className="ml-1 px-1.5 py-0.5 rounded bg-brand-strong/40 text-brand-tint font-label-sm text-xs font-mono">
                    Space
                  </span>
                </button>
              ) : hasStarted || (remainingSeconds < targetSeconds && remainingSeconds > 0) ? (
                <button
                  onClick={resumeTimer}
                  id="play-pause-btn"
                  className="h-[48px] px-6 sm:px-7 rounded-xl bg-brand hover:bg-brand-strong text-brand-on font-title-sm text-title-sm sm:font-title-md sm:text-title-md font-semibold shadow-sm transition-all transform active:scale-95 inline-flex items-center justify-center gap-2 cursor-pointer select-none"
                  type="button"
                  aria-label="Resume timer"
                >
                  <Play className="w-5 h-5 fill-current" />
                  <span id="play-pause-label">Resume</span>
                  <span className="ml-1 px-1.5 py-0.5 rounded bg-brand-strong/40 text-brand-tint font-label-sm text-xs font-mono">
                    Space
                  </span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    setHasStarted(true);
                    startTimer(activeTaskId, activeTaskTitle);
                  }}
                  id="play-pause-btn"
                  className="h-[48px] px-6 sm:px-7 rounded-xl bg-brand hover:bg-brand-strong text-brand-on font-title-sm text-title-sm sm:font-title-md sm:text-title-md font-semibold shadow-sm transition-all transform active:scale-95 inline-flex items-center justify-center gap-2 cursor-pointer select-none"
                  type="button"
                  aria-label="Start timer"
                >
                  <Play className="w-5 h-5 fill-current" />
                  <span id="play-pause-label">Start</span>
                  <span className="ml-1 px-1.5 py-0.5 rounded bg-brand-strong/40 text-brand-tint font-label-sm text-xs font-mono">
                    Space
                  </span>
                </button>
              )}

              {/* Complete Session Button */}
              <button
                onClick={completeSessionNow}
                id="finish-early-btn"
                className="h-[48px] px-4 rounded-xl bg-bg-sunken hover:bg-success-bg text-text-primary hover:text-success border border-border-subtle/40 font-label-md text-label-md font-semibold transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer select-none"
                type="button"
                aria-label="Complete session early"
              >
                <CheckCircle2 className="w-4 h-4 text-success" />
                <span>Complete</span>
              </button>
            </div>

            {/* Session Pacing Baseline (Moved below in its own quiet row) */}
            <div className="mt-8 pt-4 border-t border-border-subtle/20 w-full text-center">
              <p className="font-body-sm text-body-sm text-text-tertiary max-w-lg mx-auto leading-relaxed">
                No external notifications permitted. You are in your uninterrupted 90-minute morning apex window.
              </p>
            </div>
          </div>

          {/* AMBIENT AUDIO DECK & ENVIRONMENT (100% Offline Web Audio API) */}
          <div className="rounded-xl bg-bg-surface p-space-lg shadow-sm border border-border-subtle/40 flex flex-col gap-space-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-sm">
                <div className="w-10 h-10 rounded-lg bg-brand-tint flex items-center justify-center text-brand-strong shrink-0">
                  <Volume2 className="w-5 h-5 text-brand" />
                </div>
                <div className="flex flex-col">
                  {/* Line 1: Title */}
                  <span className="font-title-sm text-title-sm text-text-primary font-semibold">
                    {ambientSound === 'brown' && 'Binaural Brown Noise (40Hz Deep Focus)'}
                    {ambientSound === 'rain' && 'Rain on Library Soundscape'}
                    {ambientSound === 'lofi' && 'Warm Lo-Fi Ambient Tone'}
                    {ambientSound === 'mute' && 'Ambient Sound Muted'}
                  </span>
                  {/* Line 2: Subtitle */}
                  <span className="font-label-sm text-label-sm text-text-secondary mt-0.5">
                    Synthetic brainwave entrainment • Calibrated for neuro-divergent flow
                  </span>
                </div>
              </div>

              {/* Animated Mini Audio Equalizer Visualizer */}
              <div className="flex items-end gap-1 h-5 px-space-sm" aria-label="Audio visualizer">
                <span
                  className={`w-1 bg-brand rounded-full transition-all ${
                    ambientSound !== 'mute' ? 'h-3 animate-pulse' : 'h-1 opacity-40'
                  }`}
                ></span>
                <span
                  className={`w-1 bg-brand rounded-full transition-all ${
                    ambientSound !== 'mute' ? 'h-5 animate-bounce' : 'h-1 opacity-40'
                  }`}
                  style={{ animationDelay: '0.15s' }}
                ></span>
                <span
                  className={`w-1 bg-brand rounded-full transition-all ${
                    ambientSound !== 'mute' ? 'h-4 animate-pulse' : 'h-1 opacity-40'
                  }`}
                  style={{ animationDelay: '0.3s' }}
                ></span>
                <span
                  className={`w-1 bg-brand rounded-full transition-all ${
                    ambientSound !== 'mute' ? 'h-2 animate-bounce' : 'h-1 opacity-40'
                  }`}
                  style={{ animationDelay: '0.2s' }}
                ></span>
              </div>
            </div>

            {/* Audio Presets & Volume Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pt-2.5 border-t border-border-subtle/20">
              {/* Distinct Presets Group (Allows wrapping with uniform gap) */}
              <div className="flex flex-wrap items-center gap-2 min-w-0">
                <button
                  type="button"
                  onClick={() => setAmbientSound('brown')}
                  className={`px-3 py-1.5 rounded-full font-label-md text-xs sm:text-sm font-medium transition-colors cursor-pointer select-none ${
                    ambientSound === 'brown'
                      ? 'bg-brand text-brand-on font-semibold shadow-xs'
                      : 'bg-bg-sunken hover:bg-border-subtle/40 text-text-secondary'
                  }`}
                >
                  Brown Noise
                </button>
                <button
                  type="button"
                  onClick={() => setAmbientSound('rain')}
                  className={`px-3 py-1.5 rounded-full font-label-md text-xs sm:text-sm font-medium transition-colors cursor-pointer select-none ${
                    ambientSound === 'rain'
                      ? 'bg-brand text-brand-on font-semibold shadow-xs'
                      : 'bg-bg-sunken hover:bg-border-subtle/40 text-text-secondary'
                  }`}
                >
                  Rain on Library
                </button>
                <button
                  type="button"
                  onClick={() => setAmbientSound('lofi')}
                  className={`px-3 py-1.5 rounded-full font-label-md text-xs sm:text-sm font-medium transition-colors cursor-pointer select-none ${
                    ambientSound === 'lofi'
                      ? 'bg-brand text-brand-on font-semibold shadow-xs'
                      : 'bg-bg-sunken hover:bg-border-subtle/40 text-text-secondary'
                  }`}
                >
                  Warm Lo-Fi
                </button>
                <button
                  type="button"
                  onClick={() => setAmbientSound('mute')}
                  className={`px-3 py-1.5 rounded-full font-label-md text-xs sm:text-sm font-medium transition-colors cursor-pointer select-none ${
                    ambientSound === 'mute'
                      ? 'bg-text-primary text-brand-on font-semibold shadow-xs'
                      : 'bg-bg-sunken hover:bg-border-subtle/40 text-text-secondary'
                  }`}
                >
                  Mute Sound
                </button>
              </div>

              {/* Distinct Aligned Volume Group (Stacks below on narrow screens) */}
              <div className="flex items-center gap-2.5 text-text-secondary self-start sm:self-center shrink-0 min-w-[160px] sm:justify-end">
                {ambientSound !== 'mute' ? (
                  <Volume2 className="w-4 h-4 text-brand shrink-0" />
                ) : (
                  <VolumeX className="w-4 h-4 text-text-tertiary shrink-0" />
                )}
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={ambientVolume}
                  onChange={(e) => setAmbientVolume(parseFloat(e.target.value))}
                  className="w-24 sm:w-28 h-1.5 bg-bg-sunken rounded-lg appearance-none cursor-pointer accent-brand"
                  aria-label="Ambient audio volume"
                />
                <span className="font-label-sm text-label-sm font-mono w-9 text-right text-text-secondary select-none">
                  {Math.round(ambientVolume * 100)}%
                </span>
              </div>
            </div>
          </div>

          {/* QUICK SESSION WRAP TEASER / MILESTONE FORECAST */}
          <div className="rounded-xl bg-bg-surface p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-border-subtle/40 shadow-xs min-w-0">
            {/* Flexible, min-width-zero content region */}
            <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
              <div className="w-9 h-9 rounded-lg bg-brand-tint flex items-center justify-center text-brand-strong shrink-0 mt-0.5 sm:mt-0">
                <Sparkles className="w-5 h-5 text-brand" />
              </div>
              <div className="flex flex-col min-w-0 flex-1">
                <span className="font-title-sm text-title-sm text-text-primary font-semibold">
                  When timer concludes
                </span>
                <p className="font-body-sm text-body-sm text-text-secondary mt-0.5 leading-relaxed break-words">
                  ClearStep automatically records +{Math.max(1, Math.round(targetSeconds / 60))} focus minutes and unlocks your 10-minute restorative walk break.
                </p>
              </div>
            </div>
            {/* Separate action region with appropriate gap; stacks below at narrow widths */}
            <div className="flex items-center sm:self-center self-start shrink-0">
              <button
                onClick={completeSessionNow}
                id="preview-log-btn"
                className="h-[38px] px-4 rounded-lg bg-bg-sunken hover:bg-border-subtle/40 text-text-primary border border-border-subtle/40 font-label-md text-label-md shadow-xs transition-colors cursor-pointer select-none shrink-0"
                type="button"
              >
                View Log Target
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: MICRO-STEPS MATRIX & FRICTIONLESS SCRATCHPAD (5 COLUMNS ON XL) */}
        <div className="col-span-1 xl:col-span-5 flex flex-col gap-space-xl min-w-0 w-full">
          {/* ACTIVE MICRO-STEP PROGRESS CARD */}
          <div className="rounded-xl bg-bg-surface p-space-lg shadow-sm flex flex-col gap-space-md border border-border-subtle/40">
            <div className="flex items-center justify-between pb-space-xs border-b border-border-subtle/20">
              <div className="flex flex-col">
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-text-tertiary font-semibold">
                  Active Task Breakdown
                </span>
                <h2 className="font-headline-sm text-headline-sm text-text-primary font-semibold">
                  Execution Sequence
                </h2>
              </div>
              <span className="px-space-sm py-0.5 rounded-full bg-brand-tint text-brand-strong font-label-md text-label-md font-semibold">
                {completedSubtasksCount} of {totalSubtasksCount} Finished
              </span>
            </div>

            {/* Sequence Steps */}
            <div className="flex flex-col gap-2.5">
              {currentSubtasks.map((step, index) => {
                const isStepCompleted = step.completed;
                const isCurrentActive = !isStepCompleted && currentSubtasks.slice(0, index).every((s) => s.completed);

                if (isStepCompleted) {
                  return (
                    <div
                      key={step.id}
                      className="p-3 rounded-lg bg-bg-sunken/40 border border-border-subtle/20 flex items-start gap-3 opacity-70 hover:opacity-90 transition-opacity"
                    >
                      <button
                        type="button"
                        onClick={() => hasRealSubtasks && activeTask && toggleSubtask(activeTask.id, step.id)}
                        className="w-5 h-5 rounded bg-success flex items-center justify-center text-white mt-0.5 shrink-0 cursor-pointer"
                        aria-label={`Uncheck ${step.title}`}
                      >
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      </button>
                      <div className="flex flex-col flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-title-sm text-title-sm text-text-secondary line-through break-words font-medium">
                            {index + 1}. {step.title}
                          </span>
                          <span className="font-label-sm text-xs text-success font-medium shrink-0 ml-2">
                            Done
                          </span>
                        </div>
                        <p className="font-body-sm text-xs text-text-tertiary mt-0.5 line-clamp-1">
                          {'note' in step ? step.note : 'Subtask completed successfully.'}
                        </p>
                      </div>
                    </div>
                  );
                }

                if (isCurrentActive) {
                  return (
                    <div
                      key={step.id}
                      className="relative p-4 rounded-xl bg-brand-tint/10 shadow-xs flex flex-col gap-1.5 border border-brand/40"
                    >
                      <div className="absolute left-0 top-3 bottom-3 w-1 bg-brand rounded-r"></div>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-brand-tint text-brand-strong font-label-sm text-xs font-semibold uppercase tracking-wider">
                            Current Step
                          </span>
                          <span className="font-title-md text-title-md text-text-primary font-semibold">
                            {index + 1}. {step.title}
                          </span>
                        </div>
                        <button
                          type="button"
                          className="w-7 h-7 rounded flex items-center justify-center hover:bg-bg-sunken text-text-tertiary hover:text-text-primary transition-colors cursor-pointer"
                          aria-label="Step options"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="font-body-sm text-body-sm text-text-secondary pl-1 mt-1 leading-relaxed">
                        {'note' in step ? step.note : 'Execute this step focused exclusively on completing its single output.'}
                      </p>
                      {/* Action buttons on their own separated line */}
                      <div className="flex flex-wrap items-center gap-2.5 mt-3 pt-2.5 border-t border-brand/15 pl-1">
                        <button
                          type="button"
                          onClick={() => {
                            if (hasRealSubtasks && activeTask) {
                              toggleSubtask(activeTask.id, step.id);
                            } else {
                              step.completed = true;
                            }
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-brand text-brand-on font-label-md text-xs sm:text-sm font-semibold hover:bg-brand-strong transition-colors shadow-xs cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>Mark Step Complete</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {}}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-bg-surface hover:bg-bg-sunken text-text-secondary hover:text-text-primary font-label-md text-xs sm:text-sm font-medium border border-border-subtle/40 transition-colors cursor-pointer"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                          <span>Open Notes</span>
                        </button>
                      </div>
                    </div>
                  );
                }

                // Upcoming steps
                return (
                  <div
                    key={step.id}
                    className="p-3 rounded-lg bg-bg-surface hover:bg-bg-sunken transition-colors flex items-start gap-3 border border-border-subtle/20"
                  >
                    <div className="w-5 h-5 rounded bg-bg-sunken flex items-center justify-center text-text-tertiary mt-0.5 shrink-0 text-xs font-semibold">
                      {index + 1}
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-title-sm text-title-sm text-text-primary font-medium break-words">
                          {index + 1}. {step.title}
                        </span>
                        <span className="font-label-sm text-xs text-text-tertiary shrink-0 ml-2">
                          {'duration' in step ? step.duration : '~15 mins'}
                        </span>
                      </div>
                      <p className="font-body-sm text-xs text-text-secondary mt-0.5 line-clamp-1">
                        {'note' in step ? step.note : 'Upcoming milestone subtask.'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* DISTRACTION VAULT / SCRATCHPAD CARD */}
          <div className="rounded-xl bg-bg-surface p-space-lg shadow-sm flex flex-col gap-space-sm border border-border-subtle/40 flex-1">
            <div className="flex items-center justify-between pb-space-xs border-b border-border-subtle/20">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-brand" />
                <span className="font-title-sm text-title-sm text-text-primary font-semibold">
                  Distraction Vault / Scratchpad
                </span>
              </div>
              <span className="font-label-sm text-xs text-text-tertiary bg-bg-sunken px-2.5 py-0.5 rounded-full border border-border-subtle/30">
                Auto-saved
              </span>
            </div>

            <p className="font-body-sm text-body-sm text-text-secondary leading-relaxed">
              Divert disruptive thoughts, random errands, or sudden ideas here without opening new tabs.
            </p>

            {/* Scratchpad Textarea with comfortable padding */}
            <div className="relative flex-1 mt-1">
              <label htmlFor="scratchpad-area" className="sr-only">
                Distraction vault notes
              </label>
              <textarea
                id="scratchpad-area"
                value={scratchpadText}
                onChange={(e) => setScratchpadText(e.target.value)}
                placeholder="• Remember to email Dr. Vasquez about citation style...&#10;• Check library reserve shelf 4B tomorrow&#10;• Quick thought: tie cognitive bandwidth to smartphone notifications in section 2"
                rows={6}
                className="w-full p-3.5 rounded-xl bg-bg-sunken text-text-primary font-body-sm text-body-sm focus:outline-none focus:bg-bg-surface focus:ring-2 focus:ring-brand shadow-inner resize-none transition-all placeholder:text-text-tertiary border border-border-subtle/30 leading-relaxed"
              />
            </div>

            {inboxTransferNotice && (
              <div className="text-xs text-brand bg-brand-tint/60 px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 animate-fade-in">
                <Check className="w-3.5 h-3.5" />
                <span>{inboxTransferNotice}</span>
              </div>
            )}

            <div className="flex items-center justify-between pt-2 font-label-sm text-label-sm text-text-secondary border-t border-border-subtle/15">
              <span>{thoughtsCount} thoughts buffered</span>
              <button
                type="button"
                id="clear-scratch-btn"
                onClick={handleTransferToInbox}
                className="text-brand hover:text-brand-strong transition-colors cursor-pointer font-semibold flex items-center gap-1.5 py-1 px-2 rounded-md hover:bg-brand-tint/40"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Transfer to Inbox</span>
              </button>
            </div>
          </div>

          {/* THESIS CONTEXT MICRO-CARD (Separated icon, title, description, badge) */}
          <div className="rounded-xl bg-bg-surface p-4 flex items-center justify-between border border-border-subtle/40 shadow-xs">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-11 h-11 rounded-xl bg-brand-tint flex items-center justify-center text-brand shadow-xs font-semibold shrink-0">
                <School className="w-5 h-5 text-brand" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-title-sm text-title-sm text-text-primary font-semibold truncate">
                  Thesis Advisor Checkpoint
                </span>
                <span className="font-body-sm text-xs sm:text-sm text-text-secondary leading-snug line-clamp-1">
                  Draft review submission deadline is Thursday 5:00 PM
                </span>
              </div>
            </div>
            <span className="px-3 py-1 rounded-lg bg-bg-sunken text-text-tertiary border border-border-subtle/30 font-label-sm text-xs font-semibold shrink-0 ml-3">
              48h left
            </span>
          </div>
        </div>
      </div>

      {/* 3. EXIT CONFIRMATION MODAL */}
      {showExitConfirm && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[100] flex items-center justify-center p-4 animate-fade-in"
          id="exit-modal"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="bg-white bg-bg-surface modal-surface rounded-2xl max-w-md w-full p-6 shadow-[0_20px_50px_rgba(0,0,0,0.25)] flex flex-col gap-4 border border-border-subtle animate-fade-in text-text-primary"
            style={{ backgroundColor: '#FFFFFF' }}
          >
            <div className="flex items-center gap-space-sm text-secondary">
              <div className="w-10 h-10 rounded-full bg-tertiary-fixed flex items-center justify-center text-tertiary shrink-0">
                <Coffee className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                  Pause or End Focus Session?
                </h3>
                <span className="font-label-sm text-label-sm text-on-surface-variant">
                  You have {formatTimerDisplay(remainingSeconds)} left in this scheduled block
                </span>
              </div>
            </div>

            <p className="font-body-md text-body-md text-on-surface-variant">
              Leaving focus mode will safely save your scratchpad notes and record your active minutes of momentum. You can resume anytime without penalty.
            </p>

            <div className="flex items-center justify-end gap-space-sm pt-space-sm">
              <button
                onClick={() => setShowExitConfirm(false)}
                id="cancel-exit-btn"
                className="px-space-md py-space-sm rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-title-sm text-title-sm transition-colors cursor-pointer"
                type="button"
              >
                Stay in Focus
              </button>
              <button
                onClick={handleConfirmExit}
                id="confirm-exit-btn"
                className="px-space-md py-space-sm rounded-lg bg-primary-container hover:bg-brand text-on-primary font-title-sm text-title-sm transition-colors shadow-sm cursor-pointer"
                type="button"
              >
                Save &amp; Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. SESSION ACCOMPLISHED MODAL */}
      {isSessionComplete && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-[100] flex items-center justify-center p-4 animate-fade-in"
          id="complete-modal"
          role="dialog"
          aria-modal="true"
        >
          <div
            className="bg-white bg-bg-surface modal-surface rounded-2xl max-w-lg w-full p-6 shadow-[0_20px_50px_rgba(0,0,0,0.25)] flex flex-col gap-5 border border-border-subtle animate-fade-in text-text-primary"
            style={{ backgroundColor: '#FFFFFF' }}
          >
            <div className="flex items-center justify-between pb-space-xs border-b border-surface-container">
              <div className="flex items-center gap-space-sm">
                <div className="w-12 h-12 rounded-full bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed shrink-0">
                  <CheckCircle2 className="w-7 h-7 stroke-[2.5] text-secondary" />
                </div>
                <div className="flex flex-col">
                  <span className="font-label-sm text-label-sm text-secondary uppercase font-semibold">
                    Session Accomplished
                  </span>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                    Brilliant Flow
                  </h3>
                </div>
              </div>
              <button
                onClick={dismissCompleteModal}
                id="close-complete-btn"
                className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors cursor-pointer"
                type="button"
                aria-label="Close modal"
              >
                ✕
              </button>
            </div>

            {/* Stats Summary Grid */}
            <div className="grid grid-cols-3 gap-space-sm">
              <div className="p-space-sm rounded-lg bg-surface-container-low flex flex-col items-center justify-center text-center">
                <span className="font-numeric-timer text-[24px] text-primary-container font-bold">
                  {Math.max(1, Math.round(targetSeconds / 60))}m
                </span>
                <span className="font-label-sm text-label-sm text-on-surface-variant">
                  Cognitive Focus
                </span>
              </div>
              <div className="p-space-sm rounded-lg bg-surface-container-low flex flex-col items-center justify-center text-center">
                <span className="font-numeric-timer text-[24px] text-secondary font-bold">
                  {completedSubtasksCount} of {totalSubtasksCount}
                </span>
                <span className="font-label-sm text-label-sm text-on-surface-variant">
                  Micro-Steps Done
                </span>
              </div>
              <div className="p-space-sm rounded-lg bg-surface-container-low flex flex-col items-center justify-center text-center">
                <span className="font-numeric-timer text-[24px] text-brand-strong font-bold">
                  {thoughtsCount}
                </span>
                <span className="font-label-sm text-label-sm text-on-surface-variant">
                  Ideas Saved
                </span>
              </div>
            </div>

            <div className="p-space-md rounded-lg bg-surface-container-low flex items-center gap-space-md">
              <Coffee className="w-6 h-6 text-secondary shrink-0" />
              <div className="flex flex-col flex-1">
                <span className="font-title-sm text-title-sm text-on-surface font-semibold">
                  Restorative Walk Break
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  Give your cognitive working memory 5-10 minutes to reset before the next deep work block.
                </span>
              </div>
            </div>

            {activeTask && !activeTask.completed && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-surface-container border border-border-subtle/30">
                <span className="text-xs text-on-surface-variant font-medium">
                  Finished with &ldquo;{activeTask.title}&rdquo;?
                </span>
                <button
                  type="button"
                  onClick={() => toggleTaskCompletion(activeTask.id)}
                  className="px-2.5 py-1 rounded-lg bg-secondary-fixed text-on-secondary-fixed text-xs font-semibold hover:brightness-105 transition-all cursor-pointer"
                >
                  Mark Task Complete
                </button>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center justify-end gap-space-sm pt-space-xs">
              <button
                type="button"
                onClick={() => {
                  dismissCompleteModal();
                  switchMode('shortBreak');
                  startTimer(null, 'Short Break');
                }}
                className="w-full sm:w-auto px-space-lg py-space-sm rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-title-sm text-title-sm transition-colors cursor-pointer"
              >
                Start Short Break (5m)
              </button>
              <button
                type="button"
                onClick={() => {
                  dismissCompleteModal();
                  onExit();
                }}
                className="w-full sm:w-auto px-space-lg py-space-sm rounded-xl bg-primary-container hover:bg-brand text-on-primary font-title-sm text-title-sm transition-colors shadow-sm cursor-pointer"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
