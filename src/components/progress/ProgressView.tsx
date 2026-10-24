import React from 'react';
import {
  CheckCircle2,
  Clock,
  ListTodo,
  Calendar,
  Sparkles,
  Heart,
  History,
} from 'lucide-react';
import { useTasks } from '../../context/TaskContext';
import { useTimer } from '../../context/TimerContext';
import { getLocalDateString } from '../../domain/recommendationEngine';

export const ProgressView: React.FC = () => {
  const { tasks } = useTasks();
  const { sessions, clearSessionHistory } = useTimer();

  // Real statistics calculations
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.completed).length;
  const totalSubtasks = tasks.reduce((acc, t) => acc + t.subtasks.length, 0);
  const completedSubtasks = tasks.reduce(
    (acc, t) => acc + t.subtasks.filter((s) => s.completed).length,
    0
  );

  const todayStr = getLocalDateString();
  const todaySessions = sessions.filter((s) => {
    const sessionDate = getLocalDateString(new Date(s.completedAt));
    return sessionDate === todayStr && s.mode === 'focus';
  });

  const todayFocusMinutes = todaySessions.reduce((acc, s) => acc + s.durationMinutes, 0);
  const totalFocusMinutes = sessions
    .filter((s) => s.mode === 'focus')
    .reduce((acc, s) => acc + s.durationMinutes, 0);

  // Compute 7-day activity map
  const last7Days: { dateStr: string; label: string; minutes: number }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = getLocalDateString(d);
    const dayLabel = d.toLocaleDateString(undefined, { weekday: 'short' });

    const dayMinutes = sessions
      .filter((s) => s.mode === 'focus' && getLocalDateString(new Date(s.completedAt)) === dateStr)
      .reduce((acc, s) => acc + s.durationMinutes, 0);

    last7Days.push({ dateStr, label: dayLabel, minutes: dayMinutes });
  }

  const maxDayMinutes = Math.max(30, ...last7Days.map((d) => d.minutes));

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Page Header */}
      <div>
        <h1 className="font-headline-lg text-headline-lg text-text-primary tracking-tight font-semibold">
          <span>Your progress, at a glance</span>
          <span className="sr-only">Your Progress & Reflection</span>
        </h1>
        <p className="font-body-md text-body-md text-text-secondary mt-1">
          See your completed work, focus time, and consistency over time.
        </p>
      </div>

      {/* 4 Core Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Completed Tasks */}
        <div className="bg-bg-surface border border-border-subtle/40 rounded-2xl p-4 shadow-sm">
          <div className="w-8 h-8 rounded-xl bg-success-bg text-success flex items-center justify-center mb-3">
            <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div className="font-headline-md text-headline-md font-bold text-text-primary font-mono">
            {completedTasks}
            <span className="font-label-sm text-label-sm font-normal text-text-tertiary ml-1">/ {totalTasks}</span>
          </div>
          <p className="font-body-sm text-body-sm text-text-secondary mt-1 font-medium">Tasks Finished</p>
        </div>

        {/* Completed Subtasks */}
        <div className="bg-bg-surface border border-border-subtle/40 rounded-2xl p-4 shadow-sm">
          <div className="w-8 h-8 rounded-xl bg-brand-tint text-brand flex items-center justify-center mb-3">
            <ListTodo className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div className="font-headline-md text-headline-md font-bold text-text-primary font-mono">
            {completedSubtasks}
            <span className="font-label-sm text-label-sm font-normal text-text-tertiary ml-1">/ {totalSubtasks}</span>
          </div>
          <p className="font-body-sm text-body-sm text-text-secondary mt-1 font-medium">Micro-Steps Done</p>
        </div>

        {/* Today Focus Time */}
        <div className="bg-bg-surface border border-border-subtle/40 rounded-2xl p-4 shadow-sm">
          <div className="w-8 h-8 rounded-xl bg-brand-tint text-brand-strong flex items-center justify-center mb-3">
            <Clock className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div className="font-headline-md text-headline-md font-bold text-text-primary font-mono">
            {todayFocusMinutes}
            <span className="font-label-sm text-label-sm font-normal text-text-tertiary ml-1">min</span>
          </div>
          <p className="font-body-sm text-body-sm text-text-secondary mt-1 font-medium">Focused Today</p>
        </div>

        {/* All-time Focus Time */}
        <div className="bg-bg-surface border border-border-subtle/40 rounded-2xl p-4 shadow-sm">
          <div className="w-8 h-8 rounded-xl bg-warning-bg text-warning flex items-center justify-center mb-3">
            <Sparkles className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div className="font-headline-md text-headline-md font-bold text-text-primary font-mono">
            {totalFocusMinutes}
            <span className="font-label-sm text-label-sm font-normal text-text-tertiary ml-1">min</span>
          </div>
          <p className="font-body-sm text-body-sm text-text-secondary mt-1 font-medium">Total Focus Logged</p>
        </div>
      </div>

      {/* 7-Day Activity Chart */}
      <div className="bg-bg-surface border border-border-subtle/40 rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-headline-sm text-headline-sm font-semibold text-text-primary flex items-center gap-2">
              <Calendar className="w-4 h-4 text-brand" />
              <span>7-Day Focused Time Distribution</span>
            </h2>
            <p className="font-body-sm text-body-sm text-text-secondary mt-0.5">
              Minutes of completed deep work sessions per day
            </p>
          </div>
        </div>

        {/* Accessible Bar Chart */}
        <div className="grid grid-cols-7 gap-2 sm:gap-4 items-end h-44 pt-6 pb-2 border-b border-border-subtle/20">
          {last7Days.map((day) => {
            const heightPercent = Math.max(8, Math.round((day.minutes / maxDayMinutes) * 100));
            const isToday = day.dateStr === todayStr;

            return (
              <div key={day.dateStr} className="flex flex-col items-center h-full justify-end group">
                <span className="font-mono font-label-sm text-label-sm text-text-tertiary mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {day.minutes}m
                </span>
                <div
                  className="w-full max-w-[42px] bg-bg-sunken rounded-t-lg overflow-hidden flex items-end justify-center"
                  style={{ height: '100%' }}
                >
                  <div
                    role="img"
                    aria-label={`${day.label} (${day.dateStr}): ${day.minutes} minutes focused`}
                    className={`w-full rounded-t-lg transition-all duration-300 ${
                      isToday
                        ? 'bg-brand'
                        : day.minutes > 0
                        ? 'bg-brand/60'
                        : 'bg-border-subtle/30'
                    }`}
                    style={{ height: `${heightPercent}%` }}
                  />
                </div>
                <span
                  className={`font-label-sm text-label-sm mt-2 font-medium ${
                    isToday ? 'text-brand font-bold' : 'text-text-secondary'
                  }`}
                >
                  {day.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Gentle productivity message */}
        <div className="mt-4 flex items-center gap-2 font-body-sm text-body-sm text-text-secondary bg-bg-sunken p-3 rounded-xl border border-border-subtle/20 leading-relaxed">
          <Heart className="w-4 h-4 text-danger shrink-0" />
          <span>
            Every minute of focused attention counts. Remember that taking breaks and having zero-minute rest days is vital for memory consolidation and mental well-being.
          </span>
        </div>
      </div>

      {/* Focus Session History Log */}
      <div className="bg-bg-surface border border-border-subtle/40 rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-headline-sm text-headline-sm font-semibold text-text-primary flex items-center gap-2">
            <History className="w-4 h-4 text-brand" />
            <span>Session History</span>
          </h2>

          {sessions.length > 0 && (
            <button
              type="button"
              onClick={() => {
                if (confirm('Clear focus session history? Your tasks will not be deleted.')) {
                  clearSessionHistory();
                }
              }}
              className="font-label-sm text-label-sm text-text-tertiary hover:text-danger transition-colors cursor-pointer"
            >
              Clear Log
            </button>
          )}
        </div>

        {sessions.length === 0 ? (
          <p className="font-body-md text-body-md text-text-secondary py-6 text-center">
            No focus sessions logged yet. Complete a session in Focus Mode to see it here!
          </p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {sessions.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between p-3 rounded-xl bg-bg-sunken border border-border-subtle/20 font-body-sm text-body-sm"
              >
                <div className="min-w-0 pr-3">
                  <p className="font-title-sm text-title-sm font-semibold text-text-primary break-words">
                    {s.taskTitle}
                  </p>
                  <p className="font-label-sm text-label-sm text-text-tertiary mt-0.5">
                    {new Date(s.completedAt).toLocaleString()}
                  </p>
                </div>
                <div className="shrink-0 font-mono font-bold text-brand-strong bg-brand-tint px-2.5 py-1 rounded-lg font-label-md text-label-md">
                  {s.durationMinutes} min
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
