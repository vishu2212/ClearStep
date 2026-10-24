import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Sparkles, Pin } from 'lucide-react';
import { TaskPriority } from '../../domain/types';
import { useTasks } from '../../context/TaskContext';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { TASK_TEMPLATES } from '../../domain/templates';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskIdToEdit?: string | null;
}

export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  onClose,
  taskIdToEdit,
}) => {
  const { tasks, createTask, updateTask } = useTasks();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [dueDate, setDueDate] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [subtasks, setSubtasks] = useState<string[]>([]);
  const [newSubtaskInput, setNewSubtaskInput] = useState('');
  const [isFocusPinned, setIsFocusPinned] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If editing an existing task, prefill form
  useEffect(() => {
    if (taskIdToEdit) {
      const existing = tasks.find((t) => t.id === taskIdToEdit);
      if (existing) {
        setTitle(existing.title);
        setDescription(existing.description || '');
        setPriority(existing.priority);
        setDueDate(existing.dueDate || '');
        setTags(existing.tags);
        setSubtasks(existing.subtasks.map((s) => s.title));
        setIsFocusPinned(existing.isFocusPinned);
      }
    } else {
      // Reset form for fresh task
      setTitle('');
      setDescription('');
      setPriority('medium');
      setDueDate('');
      setTags([]);
      setSubtasks([]);
      setIsFocusPinned(false);
      setError(null);
    }
  }, [taskIdToEdit, isOpen, tasks]);

  const handleAddTag = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault();
      const clean = tagInput.trim().replace(/^#/, '');
      if (clean && !tags.includes(clean)) {
        setTags([...tags, clean]);
        setTagInput('');
      }
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newSubtaskInput.trim()) {
      setSubtasks([...subtasks, newSubtaskInput.trim()]);
      setNewSubtaskInput('');
    }
  };

  const handleRemoveSubtask = (index: number) => {
    setSubtasks(subtasks.filter((_, idx) => idx !== index));
  };

  const handleApplyTemplate = (templateId: string) => {
    const tpl = TASK_TEMPLATES.find((t) => t.id === templateId);
    if (tpl) {
      // Append unique template subtasks
      const combined = [...subtasks];
      tpl.subtasks.forEach((st) => {
        if (!combined.includes(st)) {
          combined.push(st);
        }
      });
      setSubtasks(combined);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Task title is required.');
      return;
    }

    if (taskIdToEdit) {
      // Update existing
      updateTask(taskIdToEdit, {
        title: title.trim(),
        description: description.trim(),
        priority,
        dueDate: dueDate || null,
        tags,
        isFocusPinned,
      });
    } else {
      // Create new
      createTask({
        title: title.trim(),
        description: description.trim(),
        priority,
        dueDate: dueDate || null,
        tags,
        subtasks,
        isFocusPinned,
      });
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={taskIdToEdit ? 'Edit Task & Steps' : 'Create New Task'}
      description="Break your work into concrete, manageable micro-steps to beat overwhelm."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 text-xs bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-300 rounded-lg">
            {error}
          </div>
        )}

        {/* Task Title */}
        <div>
          <label htmlFor="task-title" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Task Title <span className="text-red-500">*</span>
          </label>
          <input
            id="task-title"
            type="text"
            required
            maxLength={120}
            placeholder="e.g. Biology Lab Report: Cellular Respiration"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (error) setError(null);
            }}
            className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="task-desc" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Description / Context (Optional)
          </label>
          <textarea
            id="task-desc"
            rows={2}
            maxLength={1000}
            placeholder="Add any helpful instructions, rubric requirements, or links..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full text-xs sm:text-sm px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 resize-none"
          />
        </div>

        {/* Priority & Due Date Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="task-priority" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Priority Tier
            </label>
            <select
              id="task-priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as TaskPriority)}
              className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              <option value="urgent">Urgent (Immediate deadline)</option>
              <option value="high">High priority</option>
              <option value="medium">Medium priority</option>
              <option value="low">Low priority</option>
            </select>
          </div>

          <div>
            <label htmlFor="task-due-date" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Due Date (Optional)
            </label>
            <input
              id="task-due-date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full text-xs sm:text-sm px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            />
          </div>
        </div>

        {/* Focus Pin Checkbox */}
        <div className="flex items-center gap-2 pt-1">
          <input
            id="focus-pinned-check"
            type="checkbox"
            checked={isFocusPinned}
            onChange={(e) => setIsFocusPinned(e.target.checked)}
            className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 dark:border-slate-700"
          />
          <label htmlFor="focus-pinned-check" className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-1 cursor-pointer">
            <Pin className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <span>Pin as my primary focus task (gives highest priority in Next Best Action)</span>
          </label>
        </div>

        {/* Subtask Deconstruction Section */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <span>Subtasks & Micro-Steps</span>
              <span className="text-[11px] font-normal text-slate-500">({subtasks.length} steps)</span>
            </label>

            {/* Quick Template Selector */}
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    handleApplyTemplate(e.target.value);
                    e.target.value = '';
                  }
                }}
                defaultValue=""
                className="text-[11px] px-2 py-1 rounded-lg border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950 text-blue-800 dark:text-blue-300 font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 cursor-pointer"
              >
                <option value="" disabled>
                  Apply Breakdown Template...
                </option>
                {TASK_TEMPLATES.map((tpl) => (
                  <option key={tpl.id} value={tpl.id}>
                    {tpl.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Subtask List */}
          <div className="space-y-1.5 max-h-40 overflow-y-auto mb-2 pr-1">
            {subtasks.map((st, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between gap-2 p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-4 h-4 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-400 text-[10px] flex items-center justify-center font-mono shrink-0">
                    {idx + 1}
                  </span>
                  <span className="truncate text-slate-800 dark:text-slate-200">{st}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveSubtask(idx)}
                  className="p-1 text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded"
                  aria-label={`Remove step ${idx + 1}`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>

          {/* Add Subtask Input */}
          <div className="flex items-center gap-2">
            <input
              type="text"
              placeholder="Add another 10-15 minute actionable step..."
              value={newSubtaskInput}
              onChange={(e) => setNewSubtaskInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddSubtask(e);
                }
              }}
              className="flex-1 text-xs px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            />
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleAddSubtask}
              disabled={!newSubtaskInput.trim()}
              icon={<Plus className="w-3.5 h-3.5" />}
            >
              Add Step
            </Button>
          </div>
        </div>

        {/* Tags Row */}
        <div>
          <label htmlFor="task-tags" className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Tags (Press Enter to add)
          </label>
          <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200"
              >
                <span>#{tag}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="hover:text-red-500 rounded p-0.5"
                  aria-label={`Remove tag ${tag}`}
                >
                  ×
                </button>
              </span>
            ))}
            <input
              id="task-tags"
              type="text"
              placeholder={tags.length === 0 ? "Add tags like 'Biology', 'Essay'..." : "Add tag..."}
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
              className="flex-1 text-xs bg-transparent text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none min-w-[120px]"
            />
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            {taskIdToEdit ? 'Save Changes' : 'Create Task'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
