import React, { useRef, useEffect } from 'react';
import { Search, SlidersHorizontal, Plus, X } from 'lucide-react';
import { useTasks } from '../../context/TaskContext';
import { TaskStatusFilter, TaskPriorityFilter, TaskSortOption } from '../../domain/types';

interface TaskFilterBarProps {
  onOpenNewTask: () => void;
}

export const TaskFilterBar: React.FC<TaskFilterBarProps> = ({ onOpenNewTask }) => {
  const {
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    priorityFilter,
    setPriorityFilter,
    sortOption,
    setSortOption,
  } = useTasks();

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Global '/' listener to focus search input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && document.activeElement !== searchInputRef.current) {
        const tagName = (document.activeElement?.tagName || '').toLowerCase();
        if (tagName !== 'input' && tagName !== 'textarea') {
          e.preventDefault();
          searchInputRef.current?.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const statusOptions: { id: TaskStatusFilter; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'active', label: 'Active' },
    { id: 'due-today', label: 'Due Today' },
    { id: 'completed', label: 'Completed' },
  ];

  return (
    <div className="bg-bg-surface border border-border-subtle/40 rounded-2xl p-4 shadow-sm mb-6 space-y-4">
      {/* Top search & add task row */}
      <div className="flex items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder="Search tasks, descriptions, or tags... (Press / to search)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full font-body-md text-body-md pl-10 pr-9 py-2.5 rounded-xl border border-border-subtle/40 bg-bg-sunken text-text-primary placeholder:text-text-tertiary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:bg-bg-surface transition-all"
            aria-label="Search tasks"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-tertiary hover:text-text-primary p-1 rounded cursor-pointer"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* New Task Button */}
        <button
          type="button"
          onClick={onOpenNewTask}
          className="shrink-0 inline-flex items-center justify-center gap-2 px-4 py-2.5 font-label-md text-label-md font-semibold rounded-xl bg-brand hover:bg-brand-strong text-brand-on shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>New Task</span>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono rounded bg-brand-strong/40 text-brand-tint">
            n
          </kbd>
        </button>
      </div>

      {/* Filter and Sort controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-border-subtle/20">
        {/* Status Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0" role="tablist" aria-label="Task Status Filters">
          {statusOptions.map((opt) => {
            const isSelected = statusFilter === opt.id;
            return (
              <button
                key={opt.id}
                role="tab"
                aria-selected={isSelected}
                onClick={() => setStatusFilter(opt.id)}
                className={`px-3 py-1.5 rounded-lg font-label-md text-label-md font-semibold whitespace-nowrap transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand cursor-pointer ${
                  isSelected
                    ? 'bg-brand text-brand-on shadow-sm'
                    : 'text-text-secondary hover:bg-bg-sunken hover:text-text-primary'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        {/* Priority & Sort Dropdowns */}
        <div className="flex items-center gap-2 font-body-sm text-body-sm">
          <div className="flex items-center gap-1.5">
            <SlidersHorizontal className="w-3.5 h-3.5 text-text-tertiary" />
            <label htmlFor="priority-filter" className="sr-only">
              Filter by priority
            </label>
            <select
              id="priority-filter"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value as TaskPriorityFilter)}
              className="font-body-sm text-body-sm px-2.5 py-1.5 rounded-lg border border-border-subtle/40 bg-white bg-bg-surface text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              style={{ backgroundColor: '#FFFFFF' }}
            >
              <option value="all">Priority: All</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          <div>
            <label htmlFor="sort-option" className="sr-only">
              Sort tasks
            </label>
            <select
              id="sort-option"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as TaskSortOption)}
              className="font-body-sm text-body-sm px-2.5 py-1.5 rounded-lg border border-border-subtle/40 bg-white bg-bg-surface text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              style={{ backgroundColor: '#FFFFFF' }}
            >
              <option value="recommended">Sort: Recommended</option>
              <option value="dueDate">Sort: Due Date</option>
              <option value="priority">Sort: Priority</option>
              <option value="alphabetical">Sort: Alphabetical</option>
              <option value="createdAt">Sort: Recently Added</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};
