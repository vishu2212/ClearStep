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
          <div className="p-3 font-body-sm text-body-sm bg-danger-bg text-danger border border-danger/30 rounded-xl">
            {error}
          </div>
        )}

        {/* Task Title */}
        <div>
          <label htmlFor="task-title" className="block font-label-md text-label-md font-semibold text-text-secondary mb-1.5">
            Task Title <span className="text-danger">*</span>
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
            className="w-full font-body-md text-body-md px-3.5 py-2.5 rounded-xl border border-border-strong/40 bg-bg-sunken text-text-primary placeholder:text-text-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:bg-white transition-all shadow-2xs"
            style={{ backgroundColor: '#EAEFED' }}
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="task-desc" className="block font-label-md text-label-md font-semibold text-text-secondary mb-1.5">
            Description / Context (Optional)
          </label>
          <textarea
            id="task-desc"
            rows={2}
            maxLength={1000}
            placeholder="Add any helpful instructions, rubric requirements, or links..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full font-body-md text-body-md px-3.5 py-2 rounded-xl border border-border-strong/40 bg-bg-sunken text-text-primary placeholder:text-text-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:bg-white resize-none transition-all shadow-2xs"
            style={{ backgroundColor: '#EAEFED' }}
          />
        </div>

        {/* Priority & Due Date Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label htmlFor="task-priority" className="block font-label-md text-label-md font-semibold text-text-secondary mb-1.5">
              Priority Tier
            </label>
            <select
              id="task-priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as TaskPriority)}
              className="w-full font-body-md text-body-md px-3 py-2 rounded-xl border border-border-strong/40 bg-white text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand shadow-2xs cursor-pointer"
              style={{ backgroundColor: '#FFFFFF' }}
            >
              <option value="urgent">Urgent (Immediate deadline)</option>
              <option value="high">High priority</option>
              <option value="medium">Medium priority</option>
              <option value="low">Low priority</option>
            </select>
          </div>

          <div>
            <label htmlFor="task-due-date" className="block font-label-md text-label-md font-semibold text-text-secondary mb-1.5">
              Due Date (Optional)
            </label>
            <input
              id="task-due-date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full font-body-md text-body-md px-3 py-2 rounded-xl border border-border-strong/40 bg-white text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand shadow-2xs cursor-pointer"
              style={{ backgroundColor: '#FFFFFF' }}
            />
          </div>
        </div>

        {/* Focus Pin Checkbox (Consistent Dedicated Container) */}
        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-bg-sunken border border-border-subtle/50" style={{ backgroundColor: '#EAEFED' }}>
          <input
            id="focus-pinned-check"
            type="checkbox"
            checked={isFocusPinned}
            onChange={(e) => setIsFocusPinned(e.target.checked)}
            className="w-4 h-4 rounded text-brand accent-brand focus:ring-brand border-border-strong cursor-pointer"
          />
          <label htmlFor="focus-pinned-check" className="font-label-md text-label-md font-medium text-text-primary flex items-center gap-1.5 cursor-pointer select-none">
            <Pin className="w-3.5 h-3.5 text-accent fill-accent" />
            <span>Pin as my primary focus task (gives highest priority in Next Best Action)</span>
          </label>
        </div>

        {/* Subtask Deconstruction Section */}
        <div className="pt-4 border-t border-border-subtle/40 mt-1">
          <div className="flex items-center justify-between mb-2">
            <label className="font-label-md text-label-md font-semibold text-text-primary flex items-center gap-1.5">
              <span>Subtasks & Micro-Steps</span>
              <span className="font-label-sm text-label-sm font-normal text-text-tertiary">({subtasks.length} steps)</span>
            </label>

            {/* Quick Template Selector */}
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-brand" />
              <select
                onChange={(e) => {
                  if (e.target.value) {
                    handleApplyTemplate(e.target.value);
                    e.target.value = '';
                  }
                }}
                defaultValue=""
                className="font-label-sm text-label-sm px-2.5 py-1 rounded-lg border border-brand/30 bg-brand-tint text-brand-strong font-medium focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand cursor-pointer"
                style={{ backgroundColor: '#DCEFEC' }}
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
          <div className="space-y-2 max-h-40 overflow-y-auto mb-2 pr-1">
            {subtasks.map((st, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-bg-sunken border border-border-subtle/50 font-body-sm text-body-sm"
                style={{ backgroundColor: '#EAEFED' }}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-4 h-4 rounded-full bg-border-subtle text-text-secondary font-label-sm text-[10px] flex items-center justify-center font-mono shrink-0">
                    {idx + 1}
                  </span>
                  <span className="break-words text-text-primary font-medium">{st}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveSubtask(idx)}
                  className="p-1 text-text-tertiary hover:text-danger rounded cursor-pointer transition-colors"
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
              className="flex-1 font-body-sm text-body-sm px-3 py-2 rounded-lg border border-border-strong/40 bg-bg-sunken text-text-primary placeholder:text-text-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:bg-white"
              style={{ backgroundColor: '#EAEFED' }}
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
          <label htmlFor="task-tags" className="block font-label-md text-label-md font-semibold text-text-secondary mb-1.5">
            Tags (Press Enter to add)
          </label>
          <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-xl border border-border-strong/40 bg-bg-sunken" style={{ backgroundColor: '#EAEFED' }}>
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md font-label-sm text-label-sm bg-white text-text-secondary border border-border-subtle shadow-2xs"
                style={{ backgroundColor: '#FFFFFF' }}
              >
                <span>#{tag}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="hover:text-danger rounded p-0.5 cursor-pointer"
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
              className="flex-1 font-body-sm text-body-sm bg-transparent text-text-primary placeholder:text-text-tertiary focus:outline-none min-w-[120px]"
            />
          </div>
        </div>

        {/* Modal Action Buttons - Pinned Sticky Footer with Solid Background */}
        <div
          className="sticky -bottom-5 flex items-center justify-end gap-2.5 py-3 -mx-5 px-5 border-t border-border-subtle bg-white shrink-0 z-10"
          style={{ backgroundColor: '#FFFFFF' }}
        >
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
