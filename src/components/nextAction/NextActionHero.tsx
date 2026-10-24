import React from 'react';
import { useTasks } from '../../context/TaskContext';
import { usePreferences } from '../../context/PreferencesContext';
import { getLocalDateString, getDaysDifference } from '../../domain/recommendationEngine';
import {
  Play,
  Maximize2,
  Split,
  Clock,
  AlertCircle,
  CheckSquare,
  Brain,
  Check,
  CheckCircle2,
  Plus,
  Focus,
} from 'lucide-react';

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
  const { recommendation } = useTasks();
  const { recommendedTask, rationale } = recommendation;
  const { preferences } = usePreferences();

  if (!recommendedTask) {
    return (
      <section className="relative rounded-xl bg-accent-on text-brand-on p-space-xl overflow-hidden shadow-md">
        <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-accent">
          <div className="absolute bottom-4 left-0 w-[8px] h-[8px] bg-accent rounded-r-[2px]"></div>
        </div>
        <div className="flex flex-col items-center justify-center py-6 text-center">
          <div className="w-12 h-12 rounded-2xl bg-brand/40 flex items-center justify-center text-accent mb-3">
            <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
          </div>
          <span className="sr-only">Next Best Action</span>
          <h2 className="font-headline-md text-headline-md text-brand-on mb-1 font-semibold">
            Your Mind is Clear
          </h2>
          <p className="font-body-md text-body-md text-outline-variant max-w-md mb-6">
            No pending tasks on your plate right now. Enjoy the peaceful moment or create your next coursework milestone.
          </p>
          <button
            onClick={onCreateTask}
            className="h-[44px] px-space-lg rounded-xl bg-accent text-accent-on font-label-md font-semibold inline-flex items-center gap-2 hover:brightness-105 transition-all shadow-sm cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create a task</span>
          </button>
        </div>
      </section>
    );
  }

  const completedSubtasks = recommendedTask.subtasks.filter((s) => s.completed).length;
  const remainingSubtasks = recommendedTask.subtasks.length - completedSubtasks;

  // Split rationale items for clean bulleted presentation matching Stitch design
  const rawBullets = rationale
    .split('•')
    .map((r) => r.trim())
    .filter(Boolean);

  const rationaleBullets =
    rawBullets.length > 0
      ? rawBullets
      : [
          `Priority level: ${recommendedTask.priority}`,
          recommendedTask.dueDate ? `Deadline scheduled for ${recommendedTask.dueDate}` : 'Open backlog item with highest readiness',
          `${recommendedTask.subtasks.length} step(s) recorded`,
        ];

  // Course / Tag label from tags or fallback
  const courseTag =
    recommendedTask.tags && recommendedTask.tags.length > 0
      ? recommendedTask.tags.join(' • ')
      : recommendedTask.isFocusPinned
      ? 'Focus Pin • Priority Commitment'
      : `${recommendedTask.priority.toUpperCase()} Priority Task`;

  // Calculate deadline text
  let deadlineText = 'No set deadline';
  if (recommendedTask.dueDate) {
    const todayStr = getLocalDateString();
    const diff = getDaysDifference(recommendedTask.dueDate, todayStr);
    if (diff === 0) {
      deadlineText = 'Due today';
    } else if (diff === 1) {
      deadlineText = 'Due tomorrow';
    } else if (diff < 0) {
      const daysOver = Math.abs(diff);
      deadlineText = `Overdue by ${daysOver} day${daysOver === 1 ? '' : 's'}`;
    } else {
      deadlineText = `Due ${recommendedTask.dueDate}`;
    }
  }

  return (
    <section
      aria-labelledby="hero-action-heading"
      className="relative rounded-xl bg-accent-on text-brand-on p-space-md sm:p-space-xl overflow-hidden shadow-md"
    >
      {/* Signature Step Rail Motif (Left Edge: 4px amber vertical rail with stepped 8x8 notch) */}
      <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-accent">
        <div className="absolute bottom-4 left-0 w-[8px] h-[8px] bg-accent rounded-r-[2px]"></div>
      </div>

      <div className="flex flex-col 2xl:flex-row justify-between items-start gap-space-lg pl-space-xs min-w-0 w-full">
        {/* Dominant Left Content Area */}
        <div className="flex flex-col w-full min-w-0 max-w-full 2xl:max-w-[640px]">
          {/* Level 1: Small Overline & Proximity Badge */}
          <div className="flex items-center gap-space-sm mb-2.5">
            <span
              className="font-label-sm text-label-sm tracking-wider uppercase text-outline-variant font-semibold flex items-center gap-1"
              id="hero-action-heading"
            >
              <span>YOUR NEXT STEP</span>
              <span className="sr-only">Next Best Action</span>
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-strong/80 text-brand-tint font-label-sm font-medium tracking-wide">
              Highest Proximity
            </span>
          </div>

          {/* Level 2: Course / Category Tag */}
          <span className="font-label-md text-label-md text-primary-fixed-dim font-medium tracking-wide mb-1.5 block">
            {courseTag}
          </span>

          {/* Level 3: Prominent Task Title Headline */}
          <h2 className="font-headline-lg text-headline-lg text-brand-on leading-tight break-words font-semibold mb-3">
            {recommendedTask.title}
          </h2>

          {/* Level 4: Compact Metadata Row */}
          <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-outline-variant font-body-sm text-body-sm mb-4">
            <div className="flex items-center gap-1.5 text-accent font-medium">
              <Clock className="w-4 h-4 text-accent shrink-0" />
              <span>{deadlineText}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-tertiary-fixed-dim shrink-0" />
              <span className="capitalize">{recommendedTask.priority} Priority</span>
            </div>
            {recommendedTask.subtasks.length > 0 && (
              <div className="flex items-center gap-1.5">
                <CheckSquare className="w-4 h-4 shrink-0" />
                <span>{remainingSubtasks} subtasks left</span>
              </div>
            )}
          </div>

          {/* Level 5: Deterministic "Why this task" Rationale Panel */}
          <div className="bg-brand-strong/60 rounded-xl p-4 sm:p-5 mb-5 border border-brand/20">
            <div className="flex items-center gap-1.5 text-primary-fixed-dim font-label-sm text-label-sm uppercase tracking-wide mb-3 font-semibold">
              <Brain className="w-4 h-4 text-primary-fixed-dim shrink-0" />
              <span>Deterministic System Rationale</span>
            </div>
            <ul className="space-y-2 font-body-sm text-body-sm text-surface-dim">
              {rationaleBullets.map((bullet, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <Check className="w-4 h-4 text-accent mt-0.5 shrink-0" />
                  <span className="leading-relaxed">{bullet}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Level 6: Action Deck */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <button
              className="h-[48px] sm:h-[52px] px-5 sm:px-6 rounded-xl bg-accent text-accent-on font-title-sm sm:font-title-md font-semibold inline-flex items-center justify-center gap-2 hover:brightness-105 active:translate-y-[1px] transition-all cursor-pointer shadow-md select-none"
              onClick={() => onStartFocus(recommendedTask.id, recommendedTask.title)}
              type="button"
            >
              <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current" />
              <span>Start focus ({preferences.focusDuration} min)</span>
              <span className="text-xs px-1.5 py-0.5 rounded bg-accent-on/15 font-mono ml-0.5 font-normal tracking-normal">
                [Space]
              </span>
            </button>

            <button
              onClick={() => onEditTask(recommendedTask.id)}
              className="h-[44px] px-4 rounded-xl text-brand-tint hover:text-surface-bright hover:bg-brand/40 transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer font-label-md text-label-md font-medium"
              type="button"
            >
              <Maximize2 className="w-4 h-4" />
              <span>Open task details</span>
            </button>

            <button
              onClick={() => onEditTask(recommendedTask.id)}
              className="h-[44px] px-4 rounded-xl text-outline-variant hover:text-surface-bright hover:bg-brand/30 transition-colors inline-flex items-center justify-center gap-1.5 cursor-pointer font-label-md text-label-md font-medium"
              type="button"
            >
              <Split className="w-4 h-4" />
              <span>Break into smaller steps</span>
            </button>
          </div>
        </div>

        {/* Level 7: Calm Right Negative / Visual Balance Zone (Engine status placed safely away) */}
        <div className="hidden 2xl:flex flex-col items-end justify-between self-stretch py-1 text-right shrink-0">
          <div className="w-16 h-16 rounded-2xl bg-brand/30 flex items-center justify-center text-primary-fixed-dim/40">
            <Focus className="w-9 h-9" />
          </div>
          <div className="flex flex-col items-end gap-1 text-right">
            <span className="font-label-sm text-label-sm text-outline-variant uppercase tracking-wider">Engine status</span>
            <span className="font-body-sm text-body-sm text-brand-tint flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-primary-fixed-dim animate-pulse"></span>
              Calculated on-device
            </span>
          </div>
        </div>
      </div>
    </section>
  );
};
