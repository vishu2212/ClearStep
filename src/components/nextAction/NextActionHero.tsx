import React from 'react';
import {
  Sparkles,
  Play,
  CheckCircle2,
  Circle,
  ArrowRight,
  Calendar,
  Pin,
  ListOrdered,
  Check,
  Split,
  ExternalLink,
} from 'lucide-react';
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

  // Split rationale items for clean bulleted presentation (Stitch design specification)
  const rationaleBullets = rationale
    .split('•')
    .map((r) => r.trim())
    .filter(Boolean);

  return (
    <section
      aria-labelledby="next-action-heading"
      className="relative overflow-hidden bg-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl transition-all"
    >
      {/* Stitch Signature Step Rail Motif (4px warm amber vertical rail with notch) */}
      <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-amber-400">
        <div className="absolute bottom-5 left-0 w-[8px] h-[8px] bg-amber-400 rounded-r-[2px]"></div>
      </div>

      <div className="pl-2">
        {/* Top Header Tag Row */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <span
              id="next-action-heading"
              className="font-mono text-[11px] font-bold tracking-wider uppercase text-amber-400 bg-amber-400/10 border border-amber-400/20 px-2.5 py-0.5 rounded-md flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Next Best Action</span>
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-medium">
              Highest Priority
            </span>
          </div>

          <div className="flex items-center gap-2">
            {recommendedTask.isFocusPinned && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-amber-300 bg-amber-950/70 px-2.5 py-0.5 rounded-md border border-amber-800">
                <Pin className="w-3 h-3 fill-current" />
                Pinned Focus
              </span>
            )}
            <PriorityBadge priority={recommendedTask.priority} />
          </div>
        </div>

        {/* Course / Tag Pre-title */}
        {recommendedTask.tags.length > 0 && (
          <div className="text-xs font-medium text-blue-300 mb-1">
            {recommendedTask.tags.join(' • ')}
          </div>
        )}

        {/* Task Title */}
        <h3 className="text-xl sm:text-2xl font-bold text-white leading-snug mb-2">
          {recommendedTask.title}
        </h3>

        {recommendedTask.description && (
          <p className="text-xs sm:text-sm text-slate-300 mb-4 line-clamp-2">
            {recommendedTask.description}
          </p>
        )}

        {/* Metadata badges row */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-300 mb-5">
          {recommendedTask.dueDate && (
            <div className="flex items-center gap-1.5 text-amber-300 font-medium">
              <Calendar className="w-3.5 h-3.5" />
              <span>Due: {recommendedTask.dueDate}</span>
            </div>
          )}
          {totalSubtasks > 0 && (
            <div className="flex items-center gap-1.5 text-slate-300">
              <ListOrdered className="w-3.5 h-3.5" />
              <span>
                {totalSubtasks - completedSubtasks} subtasks remaining
              </span>
            </div>
          )}
        </div>

        {/* Deterministic System Rationale Box (Stitch Design Pattern) */}
        <div className="bg-slate-800/80 border border-slate-700/80 rounded-xl p-3.5 mb-6">
          <div className="flex items-center gap-1.5 text-blue-300 text-[11px] font-bold uppercase tracking-wide mb-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Deterministic Engine Rationale</span>
          </div>
          <ul className="space-y-1 text-xs text-slate-300">
            {rationaleBullets.map((bullet, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-amber-400 mt-0.5 shrink-0" />
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Next Immediate Subtask Step (if any) */}
        {recommendedSubtask ? (
          <div className="bg-blue-950/50 border border-blue-900/60 rounded-xl p-3.5 mb-6">
            <div className="text-[11px] font-bold uppercase tracking-wider text-blue-300 mb-1.5 flex items-center gap-1.5">
              <ListOrdered className="w-3.5 h-3.5 text-blue-400" />
              <span>Immediate Next Step</span>
            </div>
            <div className="flex items-start gap-3">
              <button
                type="button"
                onClick={() => toggleSubtask(recommendedTask.id, recommendedSubtask.id)}
                className="mt-0.5 text-blue-400 hover:text-blue-300 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 shrink-0"
                aria-label={`Mark subtask "${recommendedSubtask.title}" as complete`}
              >
                <Circle className="w-4 h-4" />
              </button>
              <div className="flex-1">
                <p className="text-xs sm:text-sm font-semibold text-white">
                  {recommendedSubtask.title}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Small, achievable 10-15 minute block to build forward momentum.
                </p>
              </div>
            </div>
          </div>
        ) : totalSubtasks > 0 ? (
          <div className="mb-6 p-3 bg-emerald-950/60 border border-emerald-800 rounded-xl text-xs text-emerald-300 flex items-center justify-between">
            <span>All {totalSubtasks} subtasks are complete! Ready to finish parent task.</span>
            <button
              onClick={() => toggleTaskCompletion(recommendedTask.id)}
              className="font-bold underline hover:no-underline text-white"
            >
              Mark Task Complete
            </button>
          </div>
        ) : null}

        {/* Progress Bar */}
        {totalSubtasks > 0 && (
          <div className="mb-6">
            <ProgressBar
              value={progressPercent}
              label={`Task Completion: ${completedSubtasks} of ${totalSubtasks} micro-steps`}
              size="sm"
            />
          </div>
        )}

        {/* Stitch-Styled Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={() => onStartFocus(recommendedTask.id, recommendedTask.title)}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-slate-950 font-bold text-sm shadow-md transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 focus-visible:ring-offset-2 select-none"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Start Focus Session</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-950/15 font-mono font-normal">
              [Space]
            </span>
          </button>

          <button
            type="button"
            onClick={() => onEditTask(recommendedTask.id)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Open Details</span>
          </button>

          <button
            type="button"
            onClick={() => onEditTask(recommendedTask.id)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 text-xs font-semibold rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
          >
            <Split className="w-3.5 h-3.5" />
            <span>Deconstruct Steps</span>
          </button>
        </div>
      </div>
    </section>
  );
};
