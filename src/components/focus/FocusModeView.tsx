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
  const courseTag = activeTask?.tags?.[0] || 'COGSCI 210';
  const taskTitle = activeTask?.title || activeTaskTitle || 'Draft Literature Review Outline';

  // Fallback default subtasks if active task has none
  const defaultSubtasks = [
    { id: 'sub-1', title: 'Read 2 annotated abstracts', completed: true, note: 'Baddeley (2000) & Miller (1956) memory model cross-references', duration: 'Done at 10:20am' },
    { id: 'sub-2', title: 'Synthesize 3 core themes', completed: false, note: 'Identify overlaps between cognitive load theory and digital distraction patterns from your notes matrix.', duration: 'Active' },
    { id: 'sub-3', title: 'Draft 500-word section map', completed: false, note: 'Establish headers for Background, Attentional Decay, and Interventions', duration: '~15 mins' },
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
    <div className="relative min-h-screen bg-surface px-space-md sm:px-space-xl py-space-md text-on-surface flex flex-col font-body-md selection:bg-brand-tint selection:text-brand-strong animate-fade-in">
      {/* 1. MINIMALIST FOCUS HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-space-md mb-space-lg border-b border-surface-container gap-space-sm">
        {/* Left: Exit button & Task breadcrumbs */}
        <div className="flex flex-wrap items-center gap-space-sm sm:gap-space-md">
          <button
            onClick={handleExitClick}
            id="exit-btn"
            className="flex items-center gap-space-xs px-space-md py-space-xs rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors font-title-sm text-title-sm cursor-pointer select-none"
            aria-label="Exit Focus Mode (Esc)"
            type="button"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Exit Focus Mode</span>
            <span className="ml-space-xs px-1.5 py-0.5 rounded bg-surface-container-lowest text-outline font-label-sm text-label-sm uppercase font-mono">
              Esc
            </span>
          </button>

          <div className="hidden sm:block h-4 w-px bg-surface-container-highest"></div>

          <div className="flex flex-wrap items-center gap-space-xs font-label-md text-label-md text-on-surface-variant">
            <span className="px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed font-semibold">
              {courseTag}
            </span>
            <span>Senior Thesis</span>
            <span className="text-outline">/</span>
            <span className="text-on-surface font-title-sm text-title-sm font-semibold truncate max-w-[260px]">
              {taskTitle}
            </span>
            <span className="text-outline">•</span>
            <span className="text-secondary font-semibold">Deep Block 1 of 3</span>
          </div>
        </div>

        {/* Right: Flow Guard Active indicator & Fullscreen button */}
        <div className="flex items-center gap-space-sm self-end sm:self-auto">
          {/* Mode Selector Pill (Ensures compatibility with existing integration tests) */}
          <div className="hidden md:inline-flex items-center p-0.5 bg-surface-container rounded-lg mr-2" role="tablist">
            <button
              onClick={() => switchMode('focus')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                mode === 'focus' ? 'bg-surface-container-lowest text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Deep Focus
            </button>
            <button
              onClick={() => switchMode('shortBreak')}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition-all ${
                mode === 'shortBreak' ? 'bg-surface-container-lowest text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              Short Break
            </button>
          </div>

          <div className="flex items-center gap-space-xs px-space-sm py-1 rounded-full bg-surface-container-lowest shadow-sm text-secondary font-label-md text-label-md">
            <span className="w-2 h-2 rounded-full bg-secondary animate-pulse"></span>
            <span className="font-medium">Flow Guard Active</span>
          </div>

          <button
            onClick={toggleFullscreen}
            id="fullscreen-btn"
            className="flex items-center gap-space-xs px-space-sm py-1.5 rounded-lg bg-surface-container-lowest hover:bg-surface-container text-on-surface-variant hover:text-on-surface shadow-sm transition-colors font-label-md text-label-md cursor-pointer select-none"
            aria-label="Toggle Fullscreen (F)"
            type="button"
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            <span className="hidden sm:inline">Fullscreen [F]</span>
          </button>
        </div>
      </div>

      {/* 2. MAIN FOCUS ARENA: 12-COLUMN ASYMMETRIC GRID SPLIT */}
      <div className="grid grid-cols-12 gap-gutter-desktop items-start max-w-[1400px] w-full mx-auto">
        {/* LEFT COLUMN: TIMER & IMMERSION CORE (7 COLUMNS) */}
        <div className="col-span-12 lg:col-span-7 flex flex-col gap-space-xl">
          {/* MONUMENTAL TIMER CARD */}
          <div className="relative overflow-hidden rounded-xl bg-surface-container-lowest p-space-xl sm:p-space-2xl shadow-[0_4px_24px_rgba(25,25,27,0.04)] flex flex-col items-center justify-center text-center border border-border-subtle/30">
            {/* Subtle Top Context Label */}
            <div className="flex items-center gap-space-xs mb-space-md">
              <span className="px-space-sm py-space-xxs rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-sm text-label-sm uppercase tracking-wider font-semibold">
                {mode === 'focus' ? 'Deep Cognitive Block' : 'Restorative Break'}
              </span>
              <span className="font-label-sm text-label-sm text-on-surface-variant">
                Target: {Math.floor(targetSeconds / 60)}m 00s
              </span>
            </div>

            {/* Monumental 320px SVG Timer & Progress Ring */}
            <div className="relative w-72 h-72 sm:w-80 sm:h-80 flex items-center justify-center my-space-md">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 320 320">
                {/* Background Track Circle */}
                <circle
                  className="text-surface-container"
                  cx="160"
                  cy="160"
                  fill="transparent"
                  r="140"
                  stroke="currentColor"
                  strokeWidth="6"
                />
                {/* Active Progress Circle */}
                <circle
                  className="text-primary-container transition-all duration-300 ease-out"
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
                <span className="font-label-sm text-label-sm uppercase tracking-widest text-outline mb-1">
                  Time Remaining
                </span>
                <div
                  id="timer-display"
                  className="font-numeric-timer text-[56px] sm:text-[64px] leading-none text-on-surface tracking-tight font-bold"
                  aria-live="polite"
                  aria-atomic="true"
                >
                  {formatTimerDisplay(remainingSeconds)}
                </div>
                <div className="flex items-center gap-space-xs mt-space-sm font-label-md text-label-md text-on-surface-variant">
                  <Clock className="w-4 h-4 text-secondary" />
                  <span>{formatTimerDisplay(elapsedSeconds)} elapsed</span>
                </div>
              </div>
            </div>

            {/* Control Deck: +5 Min, Play/Pause [Space], Reset, Complete */}
            <div className="flex items-center gap-space-sm sm:gap-space-md mt-space-md">
              <button
                onClick={() => addSeconds(300)}
                id="add-time-btn"
                className="flex items-center gap-space-xs px-space-md py-space-sm rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-title-sm text-title-sm transition-colors cursor-pointer select-none"
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
                className="p-2.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer select-none"
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
                  className="flex items-center justify-center gap-space-sm px-space-xl py-space-md rounded-xl bg-primary-container hover:bg-brand text-on-primary font-title-md text-title-md shadow-[0_4px_16px_rgba(59,73,223,0.25)] transition-all transform active:scale-95 cursor-pointer select-none"
                  type="button"
                  aria-label="Pause timer"
                >
                  <Pause className="w-5 h-5 fill-current" />
                  <span id="play-pause-label">Pause</span>
                  <span className="ml-space-xs px-1.5 py-0.5 rounded bg-primary text-on-primary-container font-label-sm text-label-sm font-mono">
                    Space
                  </span>
                </button>
              ) : hasStarted || (remainingSeconds < targetSeconds && remainingSeconds > 0) ? (
                <button
                  onClick={resumeTimer}
                  id="play-pause-btn"
                  className="flex items-center justify-center gap-space-sm px-space-xl py-space-md rounded-xl bg-primary-container hover:bg-brand text-on-primary font-title-md text-title-md shadow-[0_4px_16px_rgba(59,73,223,0.25)] transition-all transform active:scale-95 cursor-pointer select-none"
                  type="button"
                  aria-label="Resume timer"
                >
                  <Play className="w-5 h-5 fill-current" />
                  <span id="play-pause-label">Resume</span>
                  <span className="ml-space-xs px-1.5 py-0.5 rounded bg-primary text-on-primary-container font-label-sm text-label-sm font-mono">
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
                  className="flex items-center justify-center gap-space-sm px-space-xl py-space-md rounded-xl bg-primary-container hover:bg-brand text-on-primary font-title-md text-title-md shadow-[0_4px_16px_rgba(59,73,223,0.25)] transition-all transform active:scale-95 cursor-pointer select-none"
                  type="button"
                  aria-label="Start timer"
                >
                  <Play className="w-5 h-5 fill-current" />
                  <span id="play-pause-label">Start</span>
                  <span className="ml-space-xs px-1.5 py-0.5 rounded bg-primary text-on-primary-container font-label-sm text-label-sm font-mono">
                    Space
                  </span>
                </button>
              )}

              {/* Complete Session Button */}
              <button
                onClick={completeSessionNow}
                id="finish-early-btn"
                className="flex items-center gap-space-xs px-space-md py-space-sm rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-title-sm text-title-sm transition-colors cursor-pointer select-none"
                type="button"
                aria-label="Complete session early"
              >
                <CheckCircle2 className="w-4 h-4 text-secondary" />
                <span>Complete</span>
              </button>
            </div>

            {/* Session Pacing Baseline */}
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-space-lg max-w-lg">
              No external notifications permitted. You are in your uninterrupted 90-minute morning apex window.
            </p>
          </div>

          {/* AMBIENT AUDIO DECK & ENVIRONMENT (100% Offline Web Audio API) */}
          <div className="rounded-xl bg-surface-container-lowest p-space-lg shadow-sm border border-border-subtle/30 flex flex-col gap-space-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-space-sm">
                <div className="w-9 h-9 rounded-lg bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed">
                  <Volume2 className="w-5 h-5" />
                </div>
                <div className="flex flex-col">
                  <span className="font-title-sm text-title-sm text-on-surface font-semibold">
                    {ambientSound === 'brown' && 'Binaural Brown Noise (40Hz Deep Focus)'}
                    {ambientSound === 'rain' && 'Rain on Library Soundscape'}
                    {ambientSound === 'lofi' && 'Warm Lo-Fi Ambient Tone'}
                    {ambientSound === 'mute' && 'Ambient Sound Muted'}
                  </span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">
                    Synthetic brainwave entrainment • Calibrated for neuro-divergent flow
                  </span>
                </div>
              </div>

              {/* Animated Mini Audio Equalizer Visualizer */}
              <div className="flex items-end gap-1 h-5 px-space-sm" aria-label="Audio visualizer">
                <span
                  className={`w-1 bg-secondary rounded-full transition-all ${
                    ambientSound !== 'mute' ? 'h-3 animate-pulse' : 'h-1 opacity-40'
                  }`}
                ></span>
                <span
                  className={`w-1 bg-secondary rounded-full transition-all ${
                    ambientSound !== 'mute' ? 'h-5 animate-bounce' : 'h-1 opacity-40'
                  }`}
                  style={{ animationDelay: '0.15s' }}
                ></span>
                <span
                  className={`w-1 bg-secondary rounded-full transition-all ${
                    ambientSound !== 'mute' ? 'h-4 animate-pulse' : 'h-1 opacity-40'
                  }`}
                  style={{ animationDelay: '0.3s' }}
                ></span>
                <span
                  className={`w-1 bg-secondary rounded-full transition-all ${
                    ambientSound !== 'mute' ? 'h-2 animate-bounce' : 'h-1 opacity-40'
                  }`}
                  style={{ animationDelay: '0.2s' }}
                ></span>
              </div>
            </div>

            {/* Audio Presets & Volume Bar */}
            <div className="flex flex-wrap items-center justify-between gap-space-md pt-space-xs border-t border-surface-container">
              {/* Preset Chips */}
              <div className="flex flex-wrap items-center gap-space-xs">
                <button
                  type="button"
                  onClick={() => setAmbientSound('brown')}
                  className={`px-space-sm py-1 rounded-full font-label-md text-label-md transition-colors cursor-pointer ${
                    ambientSound === 'brown'
                      ? 'bg-secondary text-on-secondary font-semibold'
                      : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
                  }`}
                >
                  Brown Noise
                </button>
                <button
                  type="button"
                  onClick={() => setAmbientSound('rain')}
                  className={`px-space-sm py-1 rounded-full font-label-md text-label-md transition-colors cursor-pointer ${
                    ambientSound === 'rain'
                      ? 'bg-secondary text-on-secondary font-semibold'
                      : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
                  }`}
                >
                  Rain on Library
                </button>
                <button
                  type="button"
                  onClick={() => setAmbientSound('lofi')}
                  className={`px-space-sm py-1 rounded-full font-label-md text-label-md transition-colors cursor-pointer ${
                    ambientSound === 'lofi'
                      ? 'bg-secondary text-on-secondary font-semibold'
                      : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
                  }`}
                >
                  Warm Lo-Fi
                </button>
                <button
                  type="button"
                  onClick={() => setAmbientSound('mute')}
                  className={`px-space-sm py-1 rounded-full font-label-md text-label-md transition-colors cursor-pointer ${
                    ambientSound === 'mute'
                      ? 'bg-surface-container-highest text-on-surface font-semibold'
                      : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
                  }`}
                >
                  Mute Sound
                </button>
              </div>

              {/* Volume Slider */}
              <div className="flex items-center gap-space-xs text-on-surface-variant min-w-[140px]">
                {ambientSound !== 'mute' ? <Volume2 className="w-4 h-4 text-secondary" /> : <VolumeX className="w-4 h-4 text-outline" />}
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={ambientVolume}
                  onChange={(e) => setAmbientVolume(parseFloat(e.target.value))}
                  className="w-24 h-1.5 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-secondary"
                  aria-label="Ambient audio volume"
                />
                <span className="font-label-sm text-label-sm font-mono w-9 text-right">
                  {Math.round(ambientVolume * 100)}%
                </span>
              </div>
            </div>
          </div>

          {/* QUICK SESSION WRAP TEASER / MILESTONE FORECAST */}
          <div className="rounded-xl bg-surface-container-low p-space-md flex items-center justify-between border border-border-subtle/20">
            <div className="flex items-center gap-space-sm">
              <div className="w-9 h-9 rounded-lg bg-secondary-fixed flex items-center justify-center text-on-secondary-fixed shrink-0">
                <Sparkles className="w-5 h-5 text-secondary" />
              </div>
              <div className="flex flex-col">
                <span className="font-title-sm text-title-sm text-on-surface font-semibold">
                  When timer concludes
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  ClearStep automatically records +{Math.max(1, Math.round(targetSeconds / 60))} focus minutes and unlocks your 10-minute restorative walk break.
                </span>
              </div>
            </div>
            <button
              onClick={completeSessionNow}
              id="preview-log-btn"
              className="px-space-sm py-1.5 rounded-lg bg-surface-container-lowest hover:bg-surface-container-highest text-on-surface font-label-md text-label-md shadow-sm transition-colors shrink-0 cursor-pointer"
              type="button"
            >
              View Log Target
            </button>
          </div>
        </div>

        {/* RIGHT COLUMN: MICRO-STEPS MATRIX & FRICTIONLESS SCRATCHPAD (5 COLUMNS) */}
        <div className="col-span-12 lg:col-span-5 flex flex-col gap-space-xl">
          {/* ACTIVE MICRO-STEP PROGRESS CARD */}
          <div className="rounded-xl bg-surface-container-lowest p-space-lg shadow-[0_1px_3px_rgba(25,25,27,0.03)] flex flex-col gap-space-md border border-border-subtle/30">
            <div className="flex items-center justify-between pb-space-xs border-b border-surface-container">
              <div className="flex flex-col">
                <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">
                  Active Task Breakdown
                </span>
                <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
                  Execution Sequence
                </h2>
              </div>
              <span className="px-space-sm py-0.5 rounded-full bg-secondary-fixed text-on-secondary-fixed font-label-md text-label-md font-semibold">
                {completedSubtasksCount} of {totalSubtasksCount} Finished
              </span>
            </div>

            {/* Sequence Steps */}
            <div className="flex flex-col gap-space-sm">
              {currentSubtasks.map((step, index) => {
                const isStepCompleted = step.completed;
                const isCurrentActive = !isStepCompleted && currentSubtasks.slice(0, index).every((s) => s.completed);

                if (isStepCompleted) {
                  return (
                    <div
                      key={step.id}
                      className="p-space-sm rounded-lg bg-surface-container-low flex items-start gap-space-sm opacity-80"
                    >
                      <button
                        type="button"
                        onClick={() => hasRealSubtasks && activeTask && toggleSubtask(activeTask.id, step.id)}
                        className="w-5 h-5 rounded bg-secondary flex items-center justify-center text-on-secondary mt-0.5 shrink-0 cursor-pointer"
                        aria-label={`Uncheck ${step.title}`}
                      >
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      </button>
                      <div className="flex flex-col flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-title-sm text-title-sm text-on-surface-variant line-through truncate font-medium">
                            {index + 1}. {step.title}
                          </span>
                          <span className="font-label-sm text-label-sm text-secondary font-medium shrink-0 ml-2">
                            Done
                          </span>
                        </div>
                        <p className="font-body-sm text-body-sm text-outline mt-0.5 line-clamp-1">
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
                      className="relative p-space-md rounded-xl bg-surface-container-lowest shadow-[0_4px_16px_rgba(59,73,223,0.08)] flex flex-col gap-space-xs border border-primary-fixed/60"
                    >
                      <div className="absolute left-0 top-3 bottom-3 w-1 bg-primary-container rounded-r"></div>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-space-xs">
                          <span className="px-space-xs py-space-xxs rounded bg-primary-fixed text-on-primary-fixed font-label-sm text-label-sm font-semibold uppercase">
                            Current Step
                          </span>
                          <span className="font-title-md text-title-md text-on-surface font-semibold">
                            {index + 1}. {step.title}
                          </span>
                        </div>
                        <button
                          type="button"
                          className="w-6 h-6 rounded flex items-center justify-center hover:bg-surface-container text-outline hover:text-on-surface transition-colors cursor-pointer"
                          aria-label="Step options"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="font-body-sm text-body-sm text-on-surface pl-2 mt-1">
                        {'note' in step ? step.note : 'Execute this step focused exclusively on completing its single output.'}
                      </p>
                      <div className="flex items-center gap-space-sm mt-space-sm pl-2">
                        <button
                          type="button"
                          onClick={() => {
                            if (hasRealSubtasks && activeTask) {
                              toggleSubtask(activeTask.id, step.id);
                            } else {
                              step.completed = true;
                            }
                          }}
                          className="flex items-center gap-space-xxs px-space-sm py-1.5 rounded-lg bg-primary-container text-on-primary font-label-md text-label-md hover:bg-brand transition-colors shadow-sm cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>Mark Step Complete</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {}}
                          className="flex items-center gap-space-xxs px-space-sm py-1.5 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface-variant font-label-md text-label-md transition-colors cursor-pointer"
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
                    className="p-space-sm rounded-lg bg-surface-container-lowest hover:bg-surface-container-low transition-colors flex items-start gap-space-sm border border-transparent hover:border-surface-container"
                  >
                    <div className="w-5 h-5 rounded bg-surface-container-highest flex items-center justify-center text-outline mt-0.5 shrink-0 text-xs font-semibold">
                      {index + 1}
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-title-sm text-title-sm text-on-surface font-medium truncate">
                          {index + 1}. {step.title}
                        </span>
                        <span className="font-label-sm text-label-sm text-outline shrink-0 ml-2">
                          {'duration' in step ? step.duration : '~15 mins'}
                        </span>
                      </div>
                      <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5 line-clamp-1">
                        {'note' in step ? step.note : 'Upcoming milestone subtask.'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* DISTRACTION VAULT / SCRATCHPAD CARD */}
          <div className="rounded-xl bg-surface-container-lowest p-space-lg shadow-[0_1px_3px_rgba(25,25,27,0.03)] flex flex-col gap-space-sm border border-border-subtle/30 flex-1">
            <div className="flex items-center justify-between pb-space-xs border-b border-surface-container">
              <div className="flex items-center gap-space-xs">
                <Edit3 className="w-4 h-4 text-primary" />
                <span className="font-title-sm text-title-sm text-on-surface font-semibold">
                  Distraction Vault / Scratchpad
                </span>
              </div>
              <span className="font-label-sm text-label-sm text-outline bg-surface-container-low px-2 py-0.5 rounded-full">
                Auto-saved
              </span>
            </div>

            <p className="font-body-sm text-body-sm text-on-surface-variant">
              Divert disruptive thoughts, random errands, or sudden ideas here without opening new tabs.
            </p>

            {/* Scratchpad Textarea */}
            <div className="relative flex-1 mt-space-xs">
              <label htmlFor="scratchpad-area" className="sr-only">
                Distraction vault notes
              </label>
              <textarea
                id="scratchpad-area"
                value={scratchpadText}
                onChange={(e) => setScratchpadText(e.target.value)}
                placeholder="• Remember to email Dr. Vasquez about citation style...&#10;• Check library reserve shelf 4B tomorrow&#10;• Quick thought: tie cognitive bandwidth to smartphone notifications in section 2"
                rows={6}
                className="w-full p-space-sm rounded-lg bg-surface-container text-on-surface font-body-sm text-body-sm focus:outline-none focus:bg-surface-container-lowest shadow-inner resize-none transition-all placeholder:text-outline border border-transparent focus:border-primary/30"
              />
            </div>

            {inboxTransferNotice && (
              <div className="text-xs text-brand bg-brand-tint/60 px-3 py-1.5 rounded-lg font-medium flex items-center gap-1.5 animate-fade-in">
                <Check className="w-3.5 h-3.5" />
                <span>{inboxTransferNotice}</span>
              </div>
            )}

            <div className="flex items-center justify-between pt-space-xs font-label-sm text-label-sm text-on-surface-variant">
              <span>{thoughtsCount} thoughts buffered</span>
              <button
                type="button"
                id="clear-scratch-btn"
                onClick={handleTransferToInbox}
                className="hover:text-primary transition-colors cursor-pointer font-semibold flex items-center gap-1"
              >
                <Send className="w-3 h-3" />
                <span>Transfer to Inbox</span>
              </button>
            </div>
          </div>

          {/* THESIS CONTEXT MICRO-CARD */}
          <div className="rounded-xl bg-surface-container-low p-space-md flex items-center justify-between border border-border-subtle/30">
            <div className="flex items-center gap-space-sm">
              <div className="w-10 h-10 rounded-lg bg-surface-container-lowest flex items-center justify-center text-primary shadow-sm font-semibold shrink-0">
                <School className="w-5 h-5 text-primary" />
              </div>
              <div className="flex flex-col">
                <span className="font-title-sm text-title-sm text-on-surface font-semibold">
                  Thesis Advisor Checkpoint
                </span>
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  Draft review submission deadline is Thursday 5:00 PM
                </span>
              </div>
            </div>
            <span className="px-space-xs py-space-xxs rounded bg-surface-container-lowest text-outline font-label-sm text-label-sm font-semibold shrink-0 ml-2">
              48h left
            </span>
          </div>
        </div>
      </div>

      {/* 3. EXIT CONFIRMATION MODAL */}
      {showExitConfirm && (
        <div
          className="fixed inset-0 bg-inverse-surface/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          id="exit-modal"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-surface-container-lowest rounded-xl max-w-md w-full p-space-xl shadow-[0_12px_32px_rgba(25,25,27,0.12)] flex flex-col gap-space-md border border-border-subtle/40 animate-fade-in">
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
          className="fixed inset-0 bg-inverse-surface/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          id="complete-modal"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-surface-container-lowest rounded-xl max-w-lg w-full p-space-xl shadow-[0_16px_40px_rgba(25,25,27,0.14)] flex flex-col gap-space-lg border border-border-subtle/40 animate-fade-in">
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
