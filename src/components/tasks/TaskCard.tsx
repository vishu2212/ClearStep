import React, { useState } from 'react';
import {
  CheckCircle2,
  Circle,
  Calendar,
  Pin,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  Edit2,
  Play,
  Tag,
} from 'lucide-react';
import { Task } from '../../domain/types';
import { useTasks } from '../../context/TaskContext';
import { PriorityBadge } from '../common/Badge';
import { ProgressBar } from '../common/ProgressBar';
import { getLocalDateString, getDaysDifference } from '../../domain/recommendationEngine';

interface TaskCardProps {
  task: Task;
  onEdit: (taskId: string) => void;
  onStartFocus: (taskId: string, taskTitle: string) => void;
}

export const TaskCard: React.FC<TaskCardProps> = ({ task, onEdit, onStartFocus }) => {
  const {
    toggleTaskCompletion,
    deleteTask,
    toggleSubtask,
    addSubtask,
    deleteSubtask,
    setFocusPin,
  } = useTasks();

  const [isExpanded, setIsExpanded] = useState(false);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');

  const completedSubtasks = task.subtasks.filter((s) => s.completed).length;
  const totalSubtasks = task.subtasks.length;
  const progressPercent = totalSubtasks > 0 ? (completedSubtasks / totalSubtasks) * 100 : 0;

  // Due date styling calculations
  const todayStr = getLocalDateString();
  let dueStatus: 'overdue' | 'today' | 'upcoming' | 'none' = 'none';
  let dueText = '';

  if (task.dueDate) {
    const diff = getDaysDifference(task.dueDate, todayStr);
    if (diff < 0) {
      dueStatus = 'overdue';
      dueText = `Overdue by ${Math.abs(diff)}d (${task.dueDate})`;
    } else if (diff === 0) {
      dueStatus = 'today';
      dueText = 'Due Today';
    } else {
      dueStatus = 'upcoming';
      dueText = `Due in ${diff}d (${task.dueDate})`;
    }
  }

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSubtaskTitle.trim()) {
      addSubtask(task.id, newSubtaskTitle.trim());
      setNewSubtaskTitle('');
    }
  };

  return (
    <article
      aria-label={`Task: ${task.title}`}
      className={`group bg-white dark:bg-slate-900 border rounded-xl p-4 sm:p-5 transition-all shadow-sm hover:shadow-md ${
        task.completed
          ? 'border-slate-200 dark:border-slate-800 opacity-75'
          : task.isFocusPinned
          ? 'border-amber-400 dark:border-amber-600/70 shadow-amber-500/5'
          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
      }`}
    >
      <div className="flex items-start gap-3.5">
        {/* Completion checkbox */}
        <button
          type="button"
          onClick={() => toggleTaskCompletion(task.id)}
          className={`mt-0.5 rounded-lg p-0.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
            task.completed ? 'text-emerald-600 dark:text-emerald-400' : ''
          }`}
          aria-label={task.completed ? `Reopen task "${task.title}"` : `Complete task "${task.title}"`}
        >
          {task.completed ? (
            <CheckCircle2 className="w-5 h-5 fill-emerald-100 dark:fill-emerald-950 stroke-[2.2]" />
          ) : (
            <Circle className="w-5 h-5 stroke-[2]" />
          )}
        </button>

        {/* Content body */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
            <h4
              className={`text-base font-semibold text-slate-900 dark:text-white truncate ${
                task.completed ? 'line-through text-slate-400 dark:text-slate-500' : ''
              }`}
            >
              {task.title}
            </h4>

            <div className="flex items-center gap-1.5 shrink-0">
              {/* Focus Pin Button */}
              <button
                type="button"
                onClick={() => setFocusPin(task.id, !task.isFocusPinned)}
                aria-label={task.isFocusPinned ? 'Remove focus pin' : 'Pin as focus task'}
                className={`p-1.5 rounded-lg text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                  task.isFocusPinned
                    ? 'text-amber-600 bg-amber-50 dark:bg-amber-950/70 dark:text-amber-400'
                    : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Pin className={`w-3.5 h-3.5 ${task.isFocusPinned ? 'fill-current' : ''}`} />
              </button>

              <PriorityBadge priority={task.priority} size="sm" />
            </div>
          </div>

          {task.description && (
            <p className="text-xs text-slate-600 dark:text-slate-400 mb-2 line-clamp-2">
              {task.description}
            </p>
          )}

          {/* Metadata badges */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mt-2">
            {task.dueDate && (
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium ${
                  dueStatus === 'overdue'
                    ? 'bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300 font-semibold'
                    : dueStatus === 'today'
                    ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 font-semibold'
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                }`}
              >
                <Calendar className="w-3 h-3" />
                {dueText}
              </span>
            )}

            {task.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded text-[11px] bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
              >
                <Tag className="w-2.5 h-2.5" />
                {tag}
              </span>
            ))}
          </div>

          {/* Subtask summary bar */}
          {totalSubtasks > 0 && (
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                <button
                  type="button"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="inline-flex items-center gap-1 font-medium hover:text-slate-800 dark:hover:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded px-1 -ml-1"
                >
                  {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  <span>
                    Subtasks: {completedSubtasks}/{totalSubtasks}
                  </span>
                </button>
                <span className="font-mono text-[11px]">{Math.round(progressPercent)}%</span>
              </div>
              <ProgressBar value={progressPercent} size="sm" />
            </div>
          )}

          {/* Expanded Subtasks checklist */}
          {isExpanded && (
            <div className="mt-3.5 pl-2 border-l-2 border-slate-200 dark:border-slate-800 space-y-2">
              {task.subtasks.map((subtask) => (
                <div key={subtask.id} className="flex items-center justify-between gap-2 group/sub">
                  <div className="flex items-center gap-2 min-w-0">
                    <button
                      type="button"
                      onClick={() => toggleSubtask(task.id, subtask.id)}
                      className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                      aria-label={`Toggle subtask "${subtask.title}"`}
                    >
                      {subtask.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <Circle className="w-4 h-4" />
                      )}
                    </button>
                    <span
                      className={`text-xs text-slate-700 dark:text-slate-300 truncate ${
                        subtask.completed ? 'line-through text-slate-400 dark:text-slate-500' : ''
                      }`}
                    >
                      {subtask.title}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => deleteSubtask(task.id, subtask.id)}
                    aria-label={`Delete subtask "${subtask.title}"`}
                    className="opacity-0 group-hover/sub:opacity-100 p-1 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}

              {/* Add subtask mini input */}
              <form onSubmit={handleAddSubtask} className="flex items-center gap-2 pt-1">
                <input
                  type="text"
                  placeholder="Add a micro-step..."
                  value={newSubtaskTitle}
                  onChange={(e) => setNewSubtaskTitle(e.target.value)}
                  className="flex-1 text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                />
                <button
                  type="submit"
                  disabled={!newSubtaskTitle.trim()}
                  className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-40"
                  aria-label="Add micro-step"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          )}

          {/* Action Row */}
          <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
            <div className="flex items-center gap-1">
              {!isExpanded && totalSubtasks === 0 && (
                <button
                  type="button"
                  onClick={() => setIsExpanded(true)}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1 font-medium"
                >
                  <Plus className="w-3 h-3" />
                  <span>Break into steps</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5">
              {!task.completed && (
                <button
                  type="button"
                  onClick={() => onStartFocus(task.id, task.title)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-950/60 dark:text-blue-300 dark:hover:bg-blue-900/60 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Focus</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => onEdit(task.id)}
                aria-label={`Edit task "${task.title}"`}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => {
                  if (confirm(`Are you sure you want to delete "${task.title}"?`)) {
                    deleteTask(task.id);
                  }
                }}
                aria-label={`Delete task "${task.title}"`}
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
};
