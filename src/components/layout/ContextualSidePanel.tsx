import React from 'react';
import { useTasks } from '../../context/TaskContext';
import { getLocalDateString, getDaysDifference } from '../../domain/recommendationEngine';
import { ShieldCheck, Zap } from 'lucide-react';

export const ContextualSidePanel: React.FC = () => {
  const { tasks } = useTasks();

  // Compute upcoming tasks for the next 7 calendar days
  const todayStr = getLocalDateString();

  const upcomingTasks = tasks
    .filter((t) => {
      if (t.completed || !t.dueDate) return false;
      const diff = getDaysDifference(t.dueDate, todayStr);
      return !isNaN(diff) && diff > 0 && diff <= 7;
    })
    .sort((a, b) => (a.dueDate || '').localeCompare(b.dueDate || ''))
    .slice(0, 5);

  // Group upcoming tasks by date label
  const groupedTasks: { dateLabel: string; items: typeof upcomingTasks }[] = [];
  upcomingTasks.forEach((task) => {
    if (!task.dueDate) return;
    const dayDiff = getDaysDifference(task.dueDate, todayStr);
    const taskDate = new Date(task.dueDate + 'T00:00:00');

    let label = task.dueDate;
    if (dayDiff === 1) {
      label = `Tomorrow, ${taskDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
    } else {
      label = taskDate.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
    }

    const existing = groupedTasks.find((g) => g.dateLabel === label);
    if (existing) {
      existing.items.push(task);
    } else {
      groupedTasks.push({ dateLabel: label, items: [task] });
    }
  });

  return (
    <aside aria-labelledby="coming-up-title" className="flex flex-col gap-space-md w-full xl:w-[320px] xl:shrink-0 min-w-0">
      {/* 1. Coming Up (Next 7 Days) */}
      <div className="rounded-xl bg-bg-surface p-space-md shadow-sm border border-border-subtle/40">
        <div className="flex items-center justify-between pb-space-sm mb-space-sm border-b border-border-subtle/30">
          <h2 className="font-headline-sm text-headline-sm text-text-primary font-semibold" id="coming-up-title">
            Coming up
          </h2>
          <span className="font-label-sm text-label-sm text-text-tertiary">Next 7 days</span>
        </div>

        {groupedTasks.length === 0 ? (
          <div className="py-4 text-center">
            <p className="font-body-sm text-body-sm text-text-secondary">No other deadlines in the next 7 days.</p>
            <span className="font-label-sm text-xs text-text-tertiary mt-1 block">Your horizon is clear!</span>
          </div>
        ) : (
          <div className="flex flex-col gap-space-md">
            {groupedTasks.map((group, gIdx) => (
              <div key={gIdx} className="flex flex-col gap-2">
                {/* Group Heading: Date label & task count clearly separated */}
                <div className="flex items-center justify-between pb-1 border-b border-border-subtle/20 font-label-md text-label-md">
                  <span className="font-semibold text-text-primary text-xs uppercase tracking-wider">{group.dateLabel}</span>
                  <span className="text-xs text-text-tertiary font-mono">
                    {group.items.length} {group.items.length === 1 ? 'task' : 'tasks'}
                  </span>
                </div>
                {/* Item Containers with Distinct Title & Metadata Rows */}
                <div className="flex flex-col gap-2">
                  {group.items.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-lg bg-bg-sunken/60 flex flex-col gap-1.5 hover:bg-bg-sunken transition-colors border border-border-subtle/30"
                    >
                      {/* Line 1: Distinct task title */}
                      <span className="font-title-sm text-title-sm font-medium text-text-primary break-words line-clamp-2 leading-snug">
                        {item.title}
                      </span>
                      {/* Line 2: Separated Category & Due Time Metadata */}
                      <div className="flex items-center justify-between font-label-sm text-label-sm pt-1 border-t border-border-subtle/20 text-text-tertiary">
                        <span className="font-medium text-text-secondary truncate max-w-[160px]">
                          {item.tags?.[0] || 'Task'}
                        </span>
                        <span className={`shrink-0 ml-2 capitalize font-medium ${item.priority === 'urgent' ? 'text-danger' : 'text-text-tertiary'}`}>
                          {item.priority} priority
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 2. Honest Architecture & Focus Rhythm Cue Card */}
      <div className="rounded-xl bg-bg-surface p-space-md shadow-sm border border-border-subtle/40 flex flex-col gap-space-sm">
        <div className="flex items-center gap-space-xs text-brand font-label-md text-label-md font-semibold">
          <ShieldCheck className="w-4 h-4 text-brand shrink-0" />
          <span>Deterministic Schedule</span>
        </div>
        <p className="font-body-sm text-body-sm text-text-secondary leading-relaxed">
          ClearStep prioritizes single tasks strictly using manual focus pins, deadline proximity, task urgency, subtask momentum, and task age. No hidden algorithms.
        </p>
        <div className="pt-2 flex items-center justify-between text-text-tertiary font-label-sm text-[11px]">
          <span className="flex items-center gap-1 font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-brand"></span>
            Stored locally
          </span>
          <span>Offline ready</span>
        </div>
      </div>

      {/* 3. Quick Session Rhythm Status */}
      <div className="rounded-xl bg-bg-surface p-space-md shadow-sm border border-border-subtle/40 flex items-center justify-between">
        <div className="flex items-center gap-space-sm">
          <div className="w-8 h-8 rounded-lg bg-brand-tint flex items-center justify-center text-brand-strong">
            <Zap className="w-4 h-4 text-brand-strong" />
          </div>
          <div className="flex flex-col">
            <span className="font-label-sm text-label-sm font-semibold text-text-primary">
              Recommended Block
            </span>
            <span className="font-body-sm text-[12px] text-text-secondary">
              35 min focus + 5 min rest
            </span>
          </div>
        </div>
        <span className="font-mono text-xs text-text-tertiary bg-bg-sunken px-2 py-1 rounded">
          Preset
        </span>
      </div>
    </aside>
  );
};
