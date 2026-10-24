import React from 'react';
import { Sparkles, Play, CheckCircle2, Circle, ArrowRight, Calendar, Pin, ListOrdered } from 'lucide-react';
import { useTasks } from '../../context/TaskContext';
import { PriorityBadge } from '../common/Badge';
import { ProgressBar } from '../common/ProgressBar';

interface NextActionHeroProps {
  onStartFocus: (taskId: string, taskTitle: string) => void;
  onEditTask: (taskId: string) => void;
  onCreateTask: () => void;
}

export const NextActionHero: React.FC<NextActionHeroProps> = ({
  onStartFocus,
  onEditTask,
  onCreateTask,
}) => {
  const { recommendation, toggleSubtask, toggleTaskCompletion } = useTasks();
  const { recommendedTask, recommendedSubtask, rationale } = recommendation;

  if (!recommendedTask) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50/40 dark:from-slate-900 dark:to-blue-950/20 border border-blue-100 dark:border-slate-800 rounded-2xl p-8 text-center shadow-sm">
        <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <CheckCircle2 className="w-6 h-6 stroke-[2.5]" />
        </div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
          Your Mind is Clear
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto mb-6">
          No pending tasks on your plate right now. Enjoy the peaceful moment, take a walk, or create your next project milestone when you're ready.
        </p>
        <button
          onClick={onCreateTask}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
        >
          <span>Create a New Task</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  const completedSubtasks = recommendedTask.subtasks.filter((s) => s.completed).length;
  const totalSubtasks = recommendedTask.subtasks.length;
  const progressPercent = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

  return (
    <section
      aria-labelledby="next-action-heading"
      className="relative overflow-hidden bg-white dark:bg-slate-900 border-2 border-blue-500/80 dark:border-blue-500/60 rounded-2xl p-6 sm:p-7 shadow-lg shadow-blue-500/5 transition-all"
    >
      {/* Decorative top ribbon */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
          <Sparkles className="w-3.5 h-3.5" />
          <span id="next-action-heading">Next Best Action</span>
        </div>

        <div className="flex items-center gap-2">
          {recommendedTask.isFocusPinned && (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-0.5 rounded-md border border-amber-200 dark:border-amber-900">
              <Pin className="w-3 h-3 fill-current" />
              Pinned Focus
            </span>
          )}
          <PriorityBadge priority={recommendedTask.priority} />
        </div>
      </div>

      {/* Rationale explanation banner */}
      <div className="bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/60 rounded-xl px-3.5 py-2 mb-5 flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
        <span className="font-semibold text-blue-600 dark:text-blue-400">Why now:</span>
        <span className="truncate">{rationale}</span>
      </div>

      {/* Task Title & Details */}
      <div className="mb-6">
        <h3 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-snug mb-2">
          {recommendedTask.title}
        </h3>
        {recommendedTask.description && (
          <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2">
            {recommendedTask.description}
          </p>
        )}
      </div>

      {/* Next immediate subtask highlight */}
      {recommendedSubtask ? (
        <div className="bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/60 dark:border-blue-900/60 rounded-xl p-4 mb-6">
          <div className="text-[11px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-300 mb-2 flex items-center gap-1.5">
            <ListOrdered className="w-3.5 h-3.5" />
            <span>Immediate Next Step</span>
          </div>
          <div className="flex items-start gap-3">
            <button
              type="button"
              onClick={() => toggleSubtask(recommendedTask.id, recommendedSubtask.id)}
              className="mt-0.5 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 shrink-0"
              aria-label={`Mark subtask "${recommendedSubtask.title}" as complete`}
            >
              <Circle className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                {recommendedSubtask.title}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Take 10-15 minutes to complete this specific micro-step.
              </p>
            </div>
          </div>
        </div>
      ) : totalSubtasks > 0 ? (
        <div className="mb-6 p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 rounded-xl text-xs text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
          <span>All {totalSubtasks} subtasks are complete! Ready to finish parent task.</span>
          <button
            onClick={() => toggleTaskCompletion(recommendedTask.id)}
            className="font-bold underline hover:no-underline"
          >
            Mark Task Complete
          </button>
        </div>
      ) : null}

      {/* Subtask Progress bar if task has subtasks */}
      {totalSubtasks > 0 && (
        <div className="mb-6">
          <ProgressBar
            value={progressPercent}
            label={`Task Progress: ${completedSubtasks} of ${totalSubtasks} steps`}
            size="sm"
          />
        </div>
      )}

      {/* Action Footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-4 text-xs text-slate-500 dark:text-slate-400">
          {recommendedTask.dueDate && (
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              Due: {recommendedTask.dueDate}
            </span>
          )}
          {recommendedTask.tags.length > 0 && (
            <span className="hidden sm:inline-block">
              Tags: {recommendedTask.tags.join(', ')}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => onEditTask(recommendedTask.id)}
            className="flex-1 sm:flex-none px-3.5 py-2 text-xs font-semibold rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            Break Down / Edit
          </button>

          <button
            type="button"
            onClick={() => onStartFocus(recommendedTask.id, recommendedTask.title)}
            className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white shadow-md shadow-blue-500/20 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Start Focus Session</span>
          </button>
        </div>
      </div>
    </section>
  );
};
