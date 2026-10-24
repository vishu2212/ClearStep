import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Sparkles, Pin } from 'lucide-react';
import { TaskPriority, Subtask } from '../../domain/types';
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
  const [subtasks, setSubtasks] = useState<Subtask[]>([]);
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
        setSubtasks(existing.subtasks.map((s) => ({ ...s })));
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
    const trimmed = newSubtaskInput.trim();
    if (trimmed) {
      const newSub: Subtask = {
        id: `sub-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
        title: trimmed,
        completed: false,
        completedAt: null,
      };
      setSubtasks((prev) => [...prev, newSub]);
      setNewSubtaskInput('');
    }
  };

  const handleUpdateSubtaskTitle = (id: string, newTitle: string) => {
    setSubtasks((prev) =>
      prev.map((s) => (s.id === id ? { ...s, title: newTitle } : s))
    );
  };

  const handleRemoveSubtask = (id: string) => {
    setSubtasks((prev) => prev.filter((s) => s.id !== id));
  };

  const handleApplyTemplate = (templateId: string) => {
    const tpl = TASK_TEMPLATES.find((t) => t.id === templateId);
    if (tpl) {
      const newSubs: Subtask[] = tpl.subtasks.map((st, idx) => ({
        id: `sub-tpl-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 6)}`,
        title: st,
        completed: false,
        completedAt: null,
      }));
      setSubtasks((prev) => {
        const existingTitles = new Set(prev.map((s) => s.title.trim().toLowerCase()));
        const toAdd = newSubs.filter((s) => !existingTitles.has(s.title.trim().toLowerCase()));
        return [...prev, ...toAdd];
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Task title is required.');
      return;
    }

    const filteredSubtasks = subtasks
      .map((s) => ({ ...s, title: s.title.trim() }))
      .filter((s) => s.title.length > 0);

    if (taskIdToEdit) {
      updateTask(taskIdToEdit, {
        title: title.trim(),
        description: description.trim(),
        priority,
        dueDate: dueDate || null,
        tags,
        subtasks: filteredSubtasks,
        isFocusPinned,
      });
    } else {
      createTask({
        title: title.trim(),
        description: description.trim(),
        priority,
        dueDate: dueDate || null,
        tags,
        subtasks: filteredSubtasks,
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
            className="w-full font-body-md text-body-md px-3.5 py-2.5 rounded-xl border border-border-strong/40 bg-white text-text-primary placeholder:text-text-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand shadow-2xs"
            style={{ backgroundColor: '#FFFFFF' }}
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
            placeholder="Add relevant notes, rubric reminders, or assignment criteria..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full font-body-md text-body-md px-3.5 py-2.5 rounded-xl border border-border-strong/40 bg-white text-text-primary placeholder:text-text-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand shadow-2xs resize-none"
            style={{ backgroundColor: '#FFFFFF' }}
          />
        </div>

        {/* Priority & Due Date Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="task-priority" className="block font-label-md text-label-md font-semibold text-text-secondary mb-1.5">
              Priority Level
            </label>
            <select
              id="task-priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as TaskPriority)}
              className="w-full font-body-md text-body-md px-3.5 py-2.5 rounded-xl border border-border-strong/40 bg-white text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand shadow-2xs"
              style={{ backgroundColor: '#FFFFFF' }}
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
              <option value="urgent">Urgent Priority</option>
            </select>
          </div>

          <div>
            <label htmlFor="task-due-date" className="block font-label-md text-label-md font-semibold text-text-secondary mb-1.5">
              Due Date
            </label>
            <input
              id="task-due-date"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full font-body-md text-body-md px-3.5 py-2.5 rounded-xl border border-border-strong/40 bg-white text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand shadow-2xs"
              style={{ backgroundColor: '#FFFFFF' }}
            />
          </div>
        </div>

        {/* Focus Pin Checkbox */}
        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-bg-sunken border border-border-subtle/30" style={{ backgroundColor: '#F0F4F2' }}>
          <input
            type="checkbox"
            id="focus-pinned-check"
            checked={isFocusPinned}
            onChange={(e) => setIsFocusPinned(e.target.checked)}
            className="w-4 h-4 rounded text-brand focus:ring-brand accent-brand cursor-pointer"
          />
          <label htmlFor="focus-pinned-check" className="font-body-sm text-body-sm text-text-primary flex items-center gap-1.5 font-medium cursor-pointer select-none">
            <Pin className="w-3.5 h-3.5 text-accent" />
            <span>Pin as my priority focus task (Elevates to top recommendation)</span>
          </label>
        </div>

        {/* Subtasks Section */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <span className="block font-label-md text-label-md font-semibold text-text-secondary">
              Deconstruct Into Micro-Steps
            </span>
            <span className="font-label-sm text-label-sm text-text-tertiary">
              {subtasks.length} step{subtasks.length === 1 ? '' : 's'} added
            </span>
          </div>

          {/* Quick Step Breakdown Templates */}
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="font-label-sm text-label-sm text-text-tertiary mr-1 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-brand" />
              1-Click Templates:
            </span>
            {TASK_TEMPLATES.map((tpl) => (
              <button
                key={tpl.id}
                type="button"
                onClick={() => handleApplyTemplate(tpl.id)}
                className="font-label-sm text-label-sm px-2.5 py-1 rounded-lg bg-white border border-border-subtle hover:bg-brand-tint hover:border-brand-tint/60 text-text-secondary hover:text-brand-strong transition-colors shadow-2xs cursor-pointer"
                style={{ backgroundColor: '#FFFFFF' }}
              >
                + {tpl.name.replace(' Checklist', '')}
              </button>
            ))}
          </div>

          {/* Subtasks Checklist */}
          {subtasks.length > 0 && (
            <div className="space-y-1.5 max-h-48 overflow-y-auto p-1">
              {subtasks.map((st, index) => (
                <div
                  key={st.id}
                  className="flex items-center justify-between p-2.5 rounded-xl border border-border-subtle/40 bg-white font-body-sm text-body-sm text-text-primary shadow-2xs gap-2"
                  style={{ backgroundColor: '#FFFFFF' }}
                >
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className="font-mono text-xs text-text-tertiary font-medium shrink-0">
                      {index + 1}.
                    </span>
                    <input
                      type="text"
                      value={st.title}
                      onChange={(e) => handleUpdateSubtaskTitle(st.id, e.target.value)}
                      className={`bg-transparent text-body-sm focus:outline-none focus:ring-1 focus:ring-brand rounded px-1.5 py-0.5 min-w-0 flex-1 border border-transparent hover:border-border-subtle/30 focus:border-brand ${
                        st.completed ? 'line-through text-text-tertiary' : 'text-text-primary'
                      }`}
                      aria-label={`Edit step ${index + 1}: ${st.title}`}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveSubtask(st.id)}
                    aria-label={`Remove step ${index + 1}: ${st.title}`}
                    className="text-text-tertiary hover:text-danger p-1 rounded transition-colors cursor-pointer shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add Subtask Input Form */}
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="e.g. Find 2 primary research sources..."
              value={newSubtaskInput}
              onChange={(e) => setNewSubtaskInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddSubtask(e);
                }
              }}
              className="flex-1 font-body-md text-body-md px-3.5 py-2 rounded-xl border border-border-strong/40 bg-white text-text-primary placeholder:text-text-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand shadow-2xs"
              style={{ backgroundColor: '#FFFFFF' }}
            />
            <Button
              type="button"
              variant="secondary"
              onClick={handleAddSubtask}
              icon={<Plus className="w-4 h-4" />}
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
