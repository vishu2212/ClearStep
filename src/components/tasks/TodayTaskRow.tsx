import React from 'react';
import { Task } from '../../domain/types';
import {
  Check,
  AlertTriangle,
  Clock,
  Flag,
  Play,
  MoreVertical,
} from 'lucide-react';

interface TodayTaskRowProps {
  task: Task;
  onToggleComplete: (taskId: string) => void;
  onStartFocus: (taskId: string, taskTitle: string) => void;
  onEditTask: (taskId: string) => void;
}

export const TodayTaskRow: React.FC<TodayTaskRowProps> = ({
  task,
  onToggleComplete,
  onStartFocus,
  onEditTask,
}) => {
  const completedSubtasks = task.subtasks.filter((s) => s.completed).length;
  const courseTag = task.tags && task.tags.length > 0 ? task.tags[0] : 'COGSCI 210';
  const isUrgent = task.priority === 'urgent';

  // Format deadline badge
  const todayStr = new Date().toISOString().split('T')[0];
  const isOverdue = task.dueDate && task.dueDate < todayStr && !task.completed;
  const isDueToday = task.dueDate === todayStr;

  return (
    <div className={`group relative flex items-center justify-between min-h-[64px] px-space-md py-space-sm bg-bg-surface hover:bg-bg-sunken/60 transition-colors ${task.completed ? 'bg-bg-surface/70' : ''}`}>
      {/* Signature active rail for high urgency items */}
      {!task.completed && isUrgent && (
        <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-danger"></div>
      )}

      <div className="flex items-center gap-space-md min-w-0 flex-1 pr-space-md">
        {/* Custom Checkbox (22px box inside 44px accessible hit area) */}
        <label
          className="relative flex items-center justify-center w-[44px] h-[44px] cursor-pointer shrink-0"
          aria-label={`Mark "${task.title}" as ${task.completed ? 'incomplete' : 'complete'}`}
        >
          <input
            type="checkbox"
            checked={task.completed}
            onChange={() => onToggleComplete(task.id)}
            className="sr-only peer"
          />
          <span className="w-[22px] h-[22px] rounded-lg bg-bg-surface border border-border-subtle flex items-center justify-center transition-colors peer-focus-visible:ring-2 peer-focus-visible:ring-brand peer-checked:bg-brand peer-checked:border-brand">
            <Check className="w-4 h-4 text-brand-on opacity-0 peer-checked:opacity-100 transition-opacity stroke-[2.5]" />
          </span>
        </label>

        {/* Content and metadata */}
        <div className={`flex flex-col min-w-0 flex-1 ${task.completed ? 'opacity-75' : ''}`}>
          <span className={`font-body-md text-body-md font-semibold break-words ${task.completed ? 'text-text-secondary line-through' : 'text-text-primary'}`}>
            {task.title}
          </span>

          <div className="flex flex-wrap items-center gap-y-1 gap-x-2 text-text-secondary font-label-sm text-label-sm mt-1">
            <span className="font-medium text-text-primary">{courseTag}</span>

            {isOverdue && (
              <>
                <span className="text-text-tertiary/60 select-none">•</span>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-danger-bg text-danger font-label-sm text-label-sm font-medium">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  Overdue • 1 day
                </span>
              </>
            )}

            {isDueToday && (
              <>
                <span className="text-text-tertiary/60 select-none">•</span>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-warning-bg text-warning font-label-sm text-label-sm font-medium">
                  <Clock className="w-3.5 h-3.5" />
                  Due today • 5:00 PM
                </span>
              </>
            )}

            {!isOverdue && !isDueToday && task.dueDate && (
              <>
                <span className="text-text-tertiary/60 select-none">•</span>
                <span className="text-text-tertiary font-label-sm text-label-sm">
                  Due {task.dueDate}
                </span>
              </>
            )}

            <span className="text-text-tertiary/60 select-none">•</span>
            <span className="inline-flex items-center gap-1 text-text-tertiary font-label-sm text-label-sm capitalize">
              <Flag className="w-3.5 h-3.5" />
              {task.priority} Priority
            </span>

            {task.subtasks.length > 0 && (
              <>
                <span className="text-text-tertiary/60 select-none">•</span>
                <span className="text-text-tertiary font-label-sm text-label-sm">
                  {completedSubtasks} of {task.subtasks.length} subtasks
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Trailing Action Controls */}
      <div className="flex items-center gap-space-xs shrink-0 ml-2">
        {!task.completed ? (
          <button
            onClick={() => onStartFocus(task.id, task.title)}
            className="hidden sm:inline-flex items-center justify-center gap-1 h-[36px] px-space-sm rounded-lg bg-bg-sunken text-brand-strong hover:bg-brand-tint transition-colors font-label-md text-label-md font-medium cursor-pointer"
            type="button"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Focus</span>
          </button>
        ) : (
          <span className="text-xs text-text-tertiary px-2 py-1 rounded bg-bg-sunken font-mono">
            Completed
          </span>
        )}

        <button
          onClick={() => onEditTask(task.id)}
          aria-label={`Task options for ${task.title}`}
          className="w-[44px] h-[44px] flex items-center justify-center rounded-lg text-text-tertiary hover:text-text-primary hover:bg-bg-sunken transition-colors cursor-pointer"
          type="button"
        >
          <MoreVertical className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
