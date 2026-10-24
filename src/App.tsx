import React, { useState, useEffect } from 'react';
import { Sidebar, NavTab } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { ContextualSidePanel } from './components/layout/ContextualSidePanel';
import { CorruptionAlert } from './components/layout/CorruptionAlert';
import { NextActionHero } from './components/nextAction/NextActionHero';
import { TodayTaskRow } from './components/tasks/TodayTaskRow';
import { TaskFilterBar } from './components/tasks/TaskFilterBar';
import { TaskCard } from './components/tasks/TaskCard';
import { TaskModal } from './components/tasks/TaskModal';
import { FocusModeView } from './components/focus/FocusModeView';
import { ProgressView } from './components/progress/ProgressView';
import { SettingsView } from './components/settings/SettingsView';
import { useTasks } from './context/TaskContext';
import { useTimer } from './context/TimerContext';
import { getLocalDateString } from './domain/recommendationEngine';
import { Plus, PlusCircle, Timer, CheckCircle2, Clock } from 'lucide-react';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavTab>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      if (tabParam === 'focus' || tabParam === 'tasks' || tabParam === 'progress' || tabParam === 'settings') {
        return tabParam;
      }
      if (window.location.hash === '#focus') return 'focus';
    }
    return 'today';
  });
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [quickAddTitle, setQuickAddTitle] = useState('');

  const { tasks, filteredTasks, createTask, toggleTaskCompletion } = useTasks();
  const { startTimer } = useTimer();

  // Global Keyboard Shortcuts (n for new task, f for focus, Space for focus start, Esc)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = (document.activeElement?.tagName || '').toLowerCase();
      const isInput = activeTag === 'input' || activeTag === 'textarea' || activeTag === 'select';

      if (!isInput) {
        if (e.key === 'n' || e.key === 'N') {
          e.preventDefault();
          setEditingTaskId(null);
          setIsTaskModalOpen(true);
        } else if (e.key === 'f' || e.key === 'F') {
          e.preventDefault();
          setActiveTab('focus');
        } else if (e.key === 'Escape') {
          if (isTaskModalOpen) {
            setIsTaskModalOpen(false);
          } else if (activeTab === 'focus') {
            setActiveTab('today');
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isTaskModalOpen, activeTab]);

  const handleStartFocus = (taskId: string, taskTitle: string) => {
    startTimer(taskId, taskTitle);
    setActiveTab('focus');
  };

  const handleEditTask = (taskId: string) => {
    setEditingTaskId(taskId);
    setIsTaskModalOpen(true);
  };

  const handleOpenNewTask = () => {
    setEditingTaskId(null);
    setIsTaskModalOpen(true);
  };

  // Quick Add handler
  const handleQuickAdd = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && quickAddTitle.trim()) {
      e.preventDefault();
      createTask({
        title: quickAddTitle.trim(),
        priority: 'medium',
        dueDate: getLocalDateString(),
        tags: ['Coursework'],
        subtasks: [],
        isFocusPinned: false,
      });
      setQuickAddTitle('');
    }
  };

  // Compute Today's priority tasks
  const todayStr = getLocalDateString();
  const todayTasks = tasks.filter(
    (t) => t.dueDate === todayStr || t.priority === 'urgent' || t.isFocusPinned || !t.completed
  );

  const pendingTodayCount = todayTasks.filter((t) => !t.completed).length;
  const doneTodayCount = tasks.filter((t) => t.completed).length;

  // Format date for page title
  const todayDate = new Date();
  const formattedDate = todayDate.toLocaleDateString('en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });

  return (
    <div className="min-h-screen bg-bg-page font-body-md text-text-primary antialiased selection:bg-brand-tint selection:text-brand-strong flex flex-col">
      {/* Safe Storage Recovery Banner */}
      <CorruptionAlert />

      {/* Stitch Approved Fixed Left Sidebar (248px) */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        isOpenMobile={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Workspace Wrapper (offset by left sidebar 248px on desktop) */}
      <div className="pl-0 lg:pl-[248px] flex flex-col flex-1">
        {/* Stitch Approved Fixed Top Header (56px) */}
        <Header
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          onOpenNewTask={handleOpenNewTask}
          onSelectTab={setActiveTab}
        />

        {/* Main Content Area (offset by top header 56px) */}
        <main className="relative pt-14 min-h-screen bg-bg-page w-full px-space-md sm:px-space-lg">
          {/* TAB 1: TODAY (APPROVED STITCH 2-COLUMN DASHBOARD) */}
          {activeTab === 'today' && (
            <div className="flex flex-col w-full animate-fade-in pt-space-xs">
              {/* Main Grid: Primary Focus Area + Right 320px Contextual Panel */}
              <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-space-xl items-start pb-space-2xl max-w-[1240px]">
                {/* LEFT / MAIN WORKSPACE COLUMN (~880px max feel) */}
                <div className="flex flex-col gap-space-lg min-w-0">
                  {/* Screen Heading & Page Header */}
                  <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-space-md pt-space-xs">
                    <div className="flex flex-col">
                      <h1 className="font-headline-lg text-headline-lg text-text-primary tracking-tight font-semibold">
                        Today
                      </h1>
                      <p className="font-body-md text-body-md text-text-secondary mt-1 flex items-center gap-2">
                        <span>Good morning. Let's make today manageable.</span>
                        <span className="sr-only">One clear next step for today.</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-border-strong inline-block"></span>
                        <span className="text-text-tertiary">{formattedDate}</span>
                      </p>
                    </div>

                    <div className="flex items-center gap-space-sm self-start sm:self-auto">
                      <button
                        onClick={handleOpenNewTask}
                        aria-label="Create new task"
                        className="inline-flex items-center gap-space-xs h-[44px] px-space-md rounded-xl bg-bg-surface text-text-primary border border-border-subtle/40 shadow-sm hover:bg-bg-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand transition-all cursor-pointer select-none font-label-md text-label-md font-semibold"
                        type="button"
                      >
                        <Plus className="w-4 h-4 text-brand" />
                        <span>Add task</span>
                      </button>
                    </div>
                  </div>

                  {/* 8A: SIGNATURE HERO — NEXT BEST ACTION */}
                  <NextActionHero
                    onStartFocus={handleStartFocus}
                    onEditTask={handleEditTask}
                    onCreateTask={handleOpenNewTask}
                  />

                  {/* Quick-Add Inline Input Field */}
                  <div className="w-full">
                    <label className="sr-only" htmlFor="quick-add-task-input">
                      Quick add a task for today
                    </label>
                    <div className="relative flex items-center rounded-xl bg-bg-surface shadow-sm transition-all focus-within:ring-2 focus-within:ring-brand border border-border-subtle/30">
                      <PlusCircle className="w-5 h-5 text-text-tertiary ml-space-md shrink-0" />
                      <input
                        className="w-full h-[48px] bg-transparent pl-space-sm pr-16 font-body-md text-body-md text-text-primary placeholder:text-text-tertiary focus:outline-none"
                        id="quick-add-task-input"
                        value={quickAddTitle}
                        onChange={(e) => setQuickAddTitle(e.target.value)}
                        onKeyDown={handleQuickAdd}
                        placeholder="Add a task for today... (Press Enter to save)"
                        type="text"
                      />
                      <div className="absolute right-space-md flex items-center gap-1 pointer-events-none">
                        <span className="font-mono text-xs text-text-tertiary bg-bg-sunken px-1.5 py-0.5 rounded">
                          ↵ Enter
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Today's Tasks Section (Strictly Rows over Cards) */}
                  <section aria-labelledby="today-tasks-title" className="flex flex-col mt-space-sm">
                    <div className="flex items-center justify-between mb-space-sm">
                      <div className="flex items-center gap-space-sm">
                        <h2
                          className="font-headline-sm text-headline-sm text-text-primary font-semibold"
                          id="today-tasks-title"
                        >
                          Today's Tasks
                        </h2>
                        <span className="px-2 py-0.5 rounded-full bg-bg-sunken text-text-secondary font-label-sm text-label-sm font-semibold">
                          {pendingTodayCount} remaining
                        </span>
                      </div>
                      <span className="font-label-sm text-label-sm text-text-tertiary">
                        Grouped by deadline urgency
                      </span>
                    </div>

                    {/* Task Rows Container */}
                    <div
                      className="flex flex-col rounded-xl bg-bg-surface shadow-sm overflow-hidden border border-border-subtle/30 divide-y divide-bg-sunken"
                      id="task-rows-container"
                    >
                      {todayTasks.length === 0 ? (
                        <div className="p-8 text-center text-text-secondary">
                          <p className="font-semibold text-text-primary mb-1">
                            No active tasks scheduled for today.
                          </p>
                          <p className="text-xs text-text-tertiary">
                            Use the quick-add input above or add a task to plan ahead.
                          </p>
                        </div>
                      ) : (
                        todayTasks.map((task) => (
                          <TodayTaskRow
                            key={task.id}
                            task={task}
                            onToggleComplete={toggleTaskCompletion}
                            onStartFocus={handleStartFocus}
                            onEditTask={handleEditTask}
                          />
                        ))
                      )}
                    </div>
                  </section>

                  {/* 8A: DAILY OVERVIEW STRIP (Quiet, honest 3-item row) */}
                  <footer
                    aria-label="Daily honest metrics"
                    className="flex flex-wrap items-center justify-between gap-space-md px-space-md py-space-sm rounded-xl bg-bg-surface/80 text-text-secondary font-body-sm text-body-sm shadow-sm mt-space-xs border border-border-subtle/30"
                  >
                    <div className="flex items-center gap-2">
                      <Timer className="w-4 h-4 text-brand shrink-0" />
                      <span>
                        Focused today: <strong className="text-text-primary font-semibold">45 min</strong>
                      </span>
                    </div>
                    <div className="hidden sm:block w-1 h-1 rounded-full bg-border-strong"></div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                      <span>
                        Tasks done today: <strong className="text-text-primary font-semibold">{doneTodayCount}</strong>
                      </span>
                    </div>
                    <div className="hidden sm:block w-1 h-1 rounded-full bg-border-strong"></div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-text-tertiary shrink-0" />
                      <span>
                        Left to do: <strong className="text-text-primary font-semibold">{pendingTodayCount}</strong>
                      </span>
                    </div>
                  </footer>
                </div>

                {/* RIGHT CONTEXTUAL PANEL: 'Coming Up' (Next 7 Days, Exactly 320px Wide) */}
                <ContextualSidePanel />
              </div>
            </div>
          )}

          {/* TAB 2: TASKS (BACKLOG & SEARCH) */}
          {activeTab === 'tasks' && (
            <div className="space-y-6 animate-fade-in py-space-lg max-w-5xl">
              <div>
                <h1 className="font-headline-lg text-headline-lg text-text-primary tracking-tight font-semibold">
                  All Tasks & Backlog
                </h1>
                <p className="font-body-md text-body-md text-text-secondary mt-1">
                  Filter, search, organize, and deconstruct your assignments into discrete steps.
                </p>
              </div>

              {/* Filter and Search Bar */}
              <TaskFilterBar onOpenNewTask={handleOpenNewTask} />

              {/* Tasks List */}
              {filteredTasks.length === 0 ? (
                <div className="bg-bg-surface border border-border-subtle/40 rounded-2xl p-10 text-center">
                  <p className="text-sm font-semibold text-text-primary mb-1">
                    No matching tasks found.
                  </p>
                  <p className="text-xs text-text-tertiary mb-4">
                    Try adjusting your search query, clearing filters, or create a new task.
                  </p>
                  <button
                    type="button"
                    onClick={handleOpenNewTask}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-brand text-brand-on shadow-sm hover:bg-brand-strong cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create Task (n)</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onEdit={handleEditTask}
                      onStartFocus={handleStartFocus}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: FOCUS MODE */}
          {activeTab === 'focus' && (
            <div className="animate-fade-in py-space-md">
              <FocusModeView onExit={() => setActiveTab('today')} />
            </div>
          )}

          {/* TAB 4: PROGRESS */}
          {activeTab === 'progress' && (
            <div className="animate-fade-in py-space-lg max-w-5xl">
              <ProgressView />
            </div>
          )}

          {/* TAB 5: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="animate-fade-in py-space-lg max-w-5xl">
              <SettingsView />
            </div>
          )}
        </main>
      </div>

      {/* Accessible Task Creation / Edit Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setEditingTaskId(null);
        }}
        taskIdToEdit={editingTaskId}
      />
    </div>
  );
};
