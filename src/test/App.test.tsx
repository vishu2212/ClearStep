import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { App } from '../App';
import { PreferencesProvider } from '../context/PreferencesContext';
import { TaskProvider } from '../context/TaskContext';
import { TimerProvider } from '../context/TimerContext';

const renderApp = () => {
  return render(
    <PreferencesProvider>
      <TaskProvider>
        <TimerProvider>
          <App />
        </TimerProvider>
      </TaskProvider>
    </PreferencesProvider>
  );
};

describe('ClearStep Application Integration', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders the header brand and Next Action card', () => {
    renderApp();

    expect(screen.getAllByText(/ClearStep/i).length).toBeGreaterThan(0);
    expect(screen.getByText('One clear next step for today.')).toBeInTheDocument();
    expect(screen.getByText('Next Best Action')).toBeInTheDocument();
  });

  it('navigates to Tasks tab and displays search filter', () => {
    renderApp();

    const mainNav = screen.getByRole('navigation', { name: /Main Navigation/i });
    const tasksTabBtn = within(mainNav).getByRole('button', { name: /Tasks/i });
    fireEvent.click(tasksTabBtn);

    expect(screen.getByText('All Tasks & Backlog')).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Search tasks/i)).toBeInTheDocument();
  });

  it('navigates to Focus Mode and displays timer', () => {
    renderApp();

    const mainNav = screen.getByRole('navigation', { name: /Main Navigation/i });
    const focusTabBtn = within(mainNav).getByRole('button', { name: /Focus Mode/i });
    fireEvent.click(focusTabBtn);

    expect(screen.getByText('Deep Focus')).toBeInTheDocument();
    expect(screen.getByText('25:00')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Start timer/i })).toBeInTheDocument();
  });

  it('navigates to Progress tab and renders stat cards', () => {
    renderApp();

    const mainNav = screen.getByRole('navigation', { name: /Main Navigation/i });
    const progressTabBtn = within(mainNav).getByRole('button', { name: /Progress/i });
    fireEvent.click(progressTabBtn);

    expect(screen.getByText('Your Progress & Reflection')).toBeInTheDocument();
    expect(screen.getByText('Tasks Finished')).toBeInTheDocument();
    expect(screen.getByText('7-Day Focused Time Distribution')).toBeInTheDocument();
  });

  it('navigates to Settings tab and renders preferences controls', () => {
    renderApp();

    const mainNav = screen.getByRole('navigation', { name: /Main Navigation/i });
    const settingsTabBtn = within(mainNav).getByRole('button', { name: /Settings/i });
    fireEvent.click(settingsTabBtn);

    expect(screen.getByText('Preferences & Accessibility')).toBeInTheDocument();
    expect(screen.getByText('Focus & Break Intervals')).toBeInTheDocument();
    expect(screen.getByText('Export Backup (.json)')).toBeInTheDocument();
  });

  it('opens and closes the new task modal', () => {
    renderApp();

    const newTaskBtn = screen.getByLabelText(/Create new task/i);
    fireEvent.click(newTaskBtn);

    expect(screen.getByText('Create New Task')).toBeInTheDocument();

    const cancelBtn = screen.getByText('Cancel');
    fireEvent.click(cancelBtn);

    expect(screen.queryByText('Create New Task')).not.toBeInTheDocument();
  });
});
