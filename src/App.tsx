import React, { useState, useEffect } from 'react';
import { Navbar, NavTab } from './components/layout/Navbar';
import { CorruptionAlert } from './components/layout/CorruptionAlert';
import { NextActionHero } from './components/nextAction/NextActionHero';
import { TaskFilterBar } from './components/tasks/TaskFilterBar';
import { TaskCard } from './components/tasks/TaskCard';
import { TaskModal } from './components/tasks/TaskModal';
import { FocusModeView } from './components/focus/FocusModeView';
import { ProgressView } from './components/progress/ProgressView';
import { SettingsView } from './components/settings/SettingsView';
import { useTasks } from './context/TaskContext';
import { useTimer } from './context/TimerContext';
import { getLocalDateString } from './domain/recommendationEngine';
import { Plus, CheckCircle, ArrowRight } from 'lucide-react';

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavTab>('today');
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);

  const { tasks, filteredTasks } = useTasks();
  const { startTimer } = useTimer();

  // Global Keyboard Shortcuts (n for new task, f for focus, Esc)
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

  // Compute Today's priority tasks (tasks due today or urgent/high priority)
  const todayStr = getLocalDateString();
  const todayTasks = tasks.filter(
    (t) => !t.completed && (t.dueDate === todayStr || t.priority === 'urgent' || t.isFocusPinned)
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans">
      {/* Safe Storage Recovery Banner */}
      <CorruptionAlert />

      {/* Main Navbar */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenNewTask={handleOpenNewTask}
      />

      {/* Main View Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {/* TAB 1: TODAY (HOME) */}
        {activeTab === 'today' && (
          <div className="space-y-8 animate-fade-in">
            {/* Top Welcome & Rationale */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                One clear next step for today.
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-xl">
                Don't look at the entire mountain of work at once. Focus on the single action below to build real momentum.
              </p>
            </div>

            {/* Next Best Action Hero Card */}
            <NextActionHero
              onStartFocus={handleStartFocus}
              onEditTask={handleEditTask}
              onCreateTask={handleOpenNewTask}
            />

            {/* Today's Priority Queue */}
            <section aria-labelledby="today-queue-heading">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h2 id="today-queue-heading" className="text-lg font-bold text-slate-900 dark:text-white">
                    Today's Priority Focus
                  </h2>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono font-medium">
                    {todayTasks.length}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab('tasks')}
                  className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  <span>View All Tasks ({tasks.length})</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {todayTasks.length === 0 ? (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 text-center text-xs text-slate-500 dark:text-slate-400">
                  <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                  <p className="font-semibold text-slate-700 dark:text-slate-300">
                    No urgent tasks scheduled specifically for today.
                  </p>
                  <p className="mt-1">
                    You can pick an upcoming task from your backlog or take a break.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {todayTasks.map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onEdit={handleEditTask}
                      onStartFocus={handleStartFocus}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>
        )}

        {/* TAB 2: TASKS (BACKLOG & SEARCH) */}
        {activeTab === 'tasks' && (
          <div className="space-y-6 animate-fade-in">
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                All Tasks & Backlog
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                Filter, search, organize, and deconstruct your assignments into discrete steps.
              </p>
            </div>

            {/* Filter and Search Bar */}
            <TaskFilterBar onOpenNewTask={handleOpenNewTask} />

            {/* Tasks List */}
            {filteredTasks.length === 0 ? (
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-10 text-center">
                <p className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  No matching tasks found.
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                  Try adjusting your search query, clearing filters, or create a new task.
                </p>
                <button
                  type="button"
                  onClick={handleOpenNewTask}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-blue-600 text-white shadow-sm hover:bg-blue-700"
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
          <div className="animate-fade-in">
            <FocusModeView onExit={() => setActiveTab('today')} />
          </div>
        )}

        {/* TAB 4: PROGRESS */}
        {activeTab === 'progress' && (
          <div className="animate-fade-in">
            <ProgressView />
          </div>
        )}

        {/* TAB 5: SETTINGS */}
        {activeTab === 'settings' && (
          <div className="animate-fade-in">
            <SettingsView />
          </div>
        )}
      </main>

      {/* Task Creation / Edit Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => {
          setIsTaskModalOpen(false);
          setEditingTaskId(null);
        }}
        taskIdToEdit={editingTaskId}
      />

      {/* Accessible Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-6 px-4 bg-white/50 dark:bg-slate-950/50 mt-auto">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
          <p>
            <strong>ClearStep</strong> — Engineered for cognitive clarity & accessibility. Built for the Taskforge Hackathon.
          </p>
          <div className="flex items-center gap-4">
            <span>Local-first • 100% Offline</span>
            <span>WCAG 2.2 AA</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
