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
    <div className="max-w-4xl mx-auto py-6 sm:py-8 px-4 space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
          Your Progress & Reflection
        </h1>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
          Honest metrics derived exclusively from your actual stored activity. No artificial streaks or guilt mechanisms.
        </p>
      </div>

      {/* 4 Core Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Completed Tasks */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
            <CheckCircle2 className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono">
            {completedTasks}
            <span className="text-xs font-normal text-slate-400 ml-1">/ {totalTasks}</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">Tasks Finished</p>
        </div>

        {/* Completed Subtasks */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3">
            <ListTodo className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono">
            {completedSubtasks}
            <span className="text-xs font-normal text-slate-400 ml-1">/ {totalSubtasks}</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">Micro-Steps Done</p>
        </div>

        {/* Today Focus Time */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3">
            <Clock className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono">
            {todayFocusMinutes}
            <span className="text-xs font-normal text-slate-400 ml-1">min</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">Focused Today</p>
        </div>

        {/* All-time Focus Time */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
          <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3">
            <Sparkles className="w-4 h-4 stroke-[2.5]" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white font-mono">
            {totalFocusMinutes}
            <span className="text-xs font-normal text-slate-400 ml-1">min</span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">Total Focus Logged</p>
        </div>
      </div>

      {/* 7-Day Activity Chart */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>7-Day Focused Time Distribution</span>
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Minutes of completed deep work sessions per day
            </p>
          </div>
        </div>

        {/* Accessible Bar Chart */}
        <div className="grid grid-cols-7 gap-2 sm:gap-4 items-end h-44 pt-6 pb-2 border-b border-slate-100 dark:border-slate-800">
          {last7Days.map((day) => {
            const heightPercent = Math.max(8, Math.round((day.minutes / maxDayMinutes) * 100));
            const isToday = day.dateStr === todayStr;

            return (
              <div key={day.dateStr} className="flex flex-col items-center h-full justify-end group">
                <span className="text-[10px] font-mono text-slate-400 mb-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {day.minutes}m
                </span>
                <div
                  className="w-full max-w-[42px] bg-slate-100 dark:bg-slate-800 rounded-t-lg overflow-hidden flex items-end justify-center"
                  style={{ height: '100%' }}
                >
                  <div
                    role="img"
                    aria-label={`${day.label} (${day.dateStr}): ${day.minutes} minutes focused`}
                    className={`w-full rounded-t-lg transition-all duration-300 ${
                      isToday
                        ? 'bg-blue-600 dark:bg-blue-500'
                        : day.minutes > 0
                        ? 'bg-blue-400 dark:bg-blue-700'
                        : 'bg-slate-200 dark:bg-slate-700/50'
                    }`}
                    style={{ height: `${heightPercent}%` }}
                  />
                </div>
                <span
                  className={`text-xs mt-2 font-medium ${
                    isToday ? 'text-blue-600 dark:text-blue-400 font-bold' : 'text-slate-500 dark:text-slate-400'
                  }`}
                >
                  {day.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Gentle productivity message */}
        <div className="mt-4 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl">
          <Heart className="w-4 h-4 text-rose-500 shrink-0" />
          <span>
            Every minute of focused attention counts. Remember that taking breaks and having zero-minute rest days is vital for memory consolidation and mental well-being.
          </span>
        </div>
      </div>

      {/* Focus Session History Log */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <History className="w-4 h-4 text-blue-600 dark:text-blue-400" />
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
              className="text-xs text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
            >
              Clear Log
            </button>
          )}
        </div>

        {sessions.length === 0 ? (
          <p className="text-xs text-slate-500 dark:text-slate-400 py-6 text-center">
            No focus sessions logged yet. Complete a session in Focus Mode to see it here!
          </p>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
            {sessions.map((s) => (
              <div
                key={s.id}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs"
              >
                <div className="min-w-0 pr-3">
                  <p className="font-semibold text-slate-900 dark:text-white truncate">
                    {s.taskTitle}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {new Date(s.completedAt).toLocaleString()}
                  </p>
                </div>
                <div className="shrink-0 font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/70 px-2.5 py-1 rounded-lg">
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
