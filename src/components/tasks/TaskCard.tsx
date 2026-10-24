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
import { ConfirmModal } from '../common/ConfirmModal';
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
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

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
      className={`group bg-bg-surface border rounded-xl p-4 sm:p-5 transition-all shadow-sm hover:shadow-md ${
        task.completed
          ? 'border-border-subtle/40 opacity-75'
          : task.isFocusPinned
          ? 'border-accent shadow-sm'
          : 'border-border-subtle/40 hover:border-border-strong/40'
      }`}
    >
      <div className="flex items-start gap-3.5">
        {/* Completion checkbox */}
        <button
          type="button"
          onClick={() => toggleTaskCompletion(task.id)}
          className={`mt-0.5 rounded-lg p-0.5 text-text-tertiary hover:text-brand transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand cursor-pointer ${
            task.completed ? 'text-success' : ''
          }`}
          aria-label={task.completed ? `Reopen task "${task.title}"` : `Complete task "${task.title}"`}
        >
          {task.completed ? (
            <CheckCircle2 className="w-5 h-5 fill-success/20 stroke-[2.2]" />
          ) : (
            <Circle className="w-5 h-5 stroke-[2]" />
          )}
        </button>

        {/* Content body */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
            <h4
              className={`font-title-md text-title-md font-semibold text-text-primary break-words ${
                task.completed ? 'line-through text-text-tertiary' : ''
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
                className={`p-1.5 rounded-lg text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand cursor-pointer ${
                  task.isFocusPinned
                    ? 'text-accent bg-accent/15'
                    : 'text-text-tertiary hover:text-text-primary hover:bg-bg-sunken'
                }`}
              >
                <Pin className={`w-3.5 h-3.5 ${task.isFocusPinned ? 'fill-current' : ''}`} />
              </button>

              <PriorityBadge priority={task.priority} size="sm" />
            </div>
          </div>

          {task.description && (
            <p className="font-body-sm text-body-sm text-text-secondary mb-2 leading-relaxed break-words line-clamp-2">
              {task.description}
            </p>
          )}

          {/* Metadata badges */}
          <div className="flex flex-wrap items-center gap-3 font-label-sm text-label-sm text-text-secondary mt-2">
            {task.dueDate && (
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-label-sm text-label-sm font-medium ${
                  dueStatus === 'overdue'
                    ? 'bg-danger-bg text-danger font-semibold'
                    : dueStatus === 'today'
                    ? 'bg-warning-bg text-warning font-semibold'
                    : 'bg-bg-sunken text-text-secondary'
                }`}
              >
                <Calendar className="w-3 h-3" />
                {dueText}
              </span>
            )}

            {task.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded font-label-sm text-label-sm bg-bg-sunken text-text-secondary"
              >
                <Tag className="w-2.5 h-2.5" />
                {tag}
              </span>
            ))}
          </div>

          {/* Subtask summary bar */}
          {totalSubtasks > 0 && (
            <div className="mt-3">
              <div className="flex items-center justify-between font-label-md text-label-md text-text-secondary mb-1">
                <button
                  type="button"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="inline-flex items-center gap-1 font-medium hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded px-1 -ml-1 cursor-pointer"
                >
                  {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  <span>
                    Subtasks: {completedSubtasks}/{totalSubtasks}
                  </span>
                </button>
                <span className="font-mono font-label-sm text-label-sm">{Math.round(progressPercent)}%</span>
              </div>
              <ProgressBar value={progressPercent} size="sm" />
            </div>
          )}

          {/* Expanded Subtasks checklist */}
          {isExpanded && (
            <div className="mt-3.5 pl-2 border-l-2 border-border-subtle space-y-2">
              {task.subtasks.map((subtask) => (
                <div key={subtask.id} className="flex items-center justify-between gap-2 group/sub">
                  <div className="flex items-center gap-2 min-w-0">
                    <button
                      type="button"
                      onClick={() => toggleSubtask(task.id, subtask.id)}
                      className="text-text-tertiary hover:text-brand rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand cursor-pointer"
                      aria-label={`Toggle subtask "${subtask.title}"`}
                    >
                      {subtask.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-success" />
                      ) : (
                        <Circle className="w-4 h-4" />
                      )}
                    </button>
                    <span
                      className={`font-body-sm text-body-sm text-text-primary break-words ${
                        subtask.completed ? 'line-through text-text-tertiary' : ''
                      }`}
                    >
                      {subtask.title}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => deleteSubtask(task.id, subtask.id)}
                    aria-label={`Delete subtask "${subtask.title}"`}
                    className="opacity-0 group-hover/sub:opacity-100 p-1 text-text-tertiary hover:text-danger rounded focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand cursor-pointer"
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
                  className="flex-1 font-body-sm text-body-sm px-2.5 py-1.5 rounded-lg border border-border-subtle/40 bg-bg-sunken text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                />
                <button
                  type="submit"
                  disabled={!newSubtaskTitle.trim()}
                  className="px-2.5 py-1.5 rounded-lg font-label-md text-label-md font-medium bg-bg-sunken text-text-primary hover:bg-border-subtle/40 disabled:opacity-40 cursor-pointer"
                  aria-label="Add micro-step"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
          )}

          {/* Action Row */}
          <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-border-subtle/20">
            <div className="flex items-center gap-1">
              {!isExpanded && totalSubtasks === 0 && (
                <button
                  type="button"
                  onClick={() => setIsExpanded(true)}
                  className="font-label-md text-label-md text-brand hover:underline inline-flex items-center gap-1 font-medium cursor-pointer"
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
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg font-label-md text-label-md font-semibold bg-brand-tint text-brand-strong hover:bg-brand/20 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand cursor-pointer"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Focus</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => onEdit(task.id)}
                aria-label={`Edit task "${task.title}"`}
                className="p-1.5 rounded-lg text-text-tertiary hover:text-text-primary hover:bg-bg-sunken transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand cursor-pointer"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setIsDeleteModalOpen(true)}
                aria-label={`Delete task "${task.title}"`}
                className="p-1.5 rounded-lg text-text-tertiary hover:text-danger hover:bg-danger-bg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => deleteTask(task.id)}
        title="Delete Task"
        message={`Are you sure you want to delete "${task.title}"? This action cannot be undone.`}
        confirmLabel="Delete Task"
        cancelLabel="Cancel"
        variant="danger"
      />
    </article>
  );
};
