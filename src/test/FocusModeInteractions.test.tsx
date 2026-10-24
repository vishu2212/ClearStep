import { describe, it, expect, beforeEach, vi } from 'vitest';
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

describe('Focus Mode Full Interaction & Verification Suite', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.useRealTimers();
  });

  it('navigates to Focus Mode with original 7/5 column layout elements', () => {
    renderApp();

    // Navigate to Focus Mode
    const focusNavBtn = screen.getByRole('button', { name: /Focus Mode/i });
    fireEvent.click(focusNavBtn);

    // Verify 7-column Left: Timer card, 320px circular timer, numeric timer, audio deck
    expect(screen.getByText('Deep Cognitive Block')).toBeInTheDocument();
    expect(screen.getByText(/Time Remaining/i)).toBeInTheDocument();
    expect(screen.getByText('25:00')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Start timer/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Add 5 minutes/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Complete session early/i })).toBeInTheDocument();

    // Ambient audio deck
    expect(screen.getByText(/Ambient Sound Muted/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Brown Noise/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Rain on Library/i })).toBeInTheDocument();

    // Verify 5-column Right: Execution sequence, Distraction Vault, Thesis context
    expect(screen.getByText('Execution Sequence')).toBeInTheDocument();
    expect(screen.getByText(/Distraction Vault \/ Scratchpad/i)).toBeInTheDocument();
    expect(screen.getByText('Thesis Advisor Checkpoint')).toBeInTheDocument();
  });

  it('starts, pauses, and resumes the timer accurately', () => {
    renderApp();
    fireEvent.click(screen.getByRole('button', { name: /Focus Mode/i }));

    const startBtn = screen.getByRole('button', { name: /Start timer/i });
    fireEvent.click(startBtn);

    // After clicking start, button becomes Pause
    const pauseBtn = screen.getByRole('button', { name: /Pause timer/i });
    expect(pauseBtn).toBeInTheDocument();

    // Clicking pause switches to Resume
    fireEvent.click(pauseBtn);
    const resumeBtn = screen.getByRole('button', { name: /Resume timer/i });
    expect(resumeBtn).toBeInTheDocument();

    // Clicking resume switches back to Pause
    fireEvent.click(resumeBtn);
    expect(screen.getByRole('button', { name: /Pause timer/i })).toBeInTheDocument();
  });

  it('adds +5 minutes (300 seconds) to target and remaining time', () => {
    renderApp();
    fireEvent.click(screen.getByRole('button', { name: /Focus Mode/i }));

    expect(screen.getByText('25:00')).toBeInTheDocument();

    const add5MinBtn = screen.getByRole('button', { name: /Add 5 minutes/i });
    fireEvent.click(add5MinBtn);

    // 25:00 + 5 min = 30:00
    expect(screen.getByText('30:00')).toBeInTheDocument();
    expect(screen.getByText(/Target: 30m 00s/i)).toBeInTheDocument();
  });

  it('resets timer back to starting state when reset button is clicked', () => {
    renderApp();
    fireEvent.click(screen.getByRole('button', { name: /Focus Mode/i }));

    const add5MinBtn = screen.getByRole('button', { name: /Add 5 minutes/i });
    fireEvent.click(add5MinBtn);
    expect(screen.getByText('30:00')).toBeInTheDocument();

    const resetBtn = screen.getByRole('button', { name: /Reset timer/i });
    fireEvent.click(resetBtn);

    // Resets back to 25:00
    expect(screen.getByText('25:00')).toBeInTheDocument();
  });

  it('completes session early and renders the Session Accomplished modal with stats', () => {
    renderApp();
    fireEvent.click(screen.getByRole('button', { name: /Focus Mode/i }));

    const completeBtn = screen.getByRole('button', { name: /Complete session early/i });
    fireEvent.click(completeBtn);

    // Verify modal appeared
    expect(screen.getByText('Session Accomplished')).toBeInTheDocument();
    expect(screen.getByText('Brilliant Flow')).toBeInTheDocument();
    expect(screen.getByText('Cognitive Focus')).toBeInTheDocument();
    expect(screen.getByText('Micro-Steps Done')).toBeInTheDocument();
    expect(screen.getByText('Ideas Saved')).toBeInTheDocument();
  });

  it('buffers distraction thoughts and transfers them to the task inbox', () => {
    renderApp();
    fireEvent.click(screen.getByRole('button', { name: /Focus Mode/i }));

    const scratchpad = screen.getByLabelText(/Distraction vault notes/i);
    expect(scratchpad).toBeInTheDocument();

    // Type new buffered thoughts
    fireEvent.change(scratchpad, {
      target: { value: '• Email prof about thesis sources\n• Buy index cards' },
    });

    expect(screen.getByText('2 thoughts buffered')).toBeInTheDocument();

    // Click Transfer to Inbox
    const transferBtn = screen.getByRole('button', { name: /Transfer to Inbox/i });
    fireEvent.click(transferBtn);

    expect(screen.getByText(/Transferred 2 thoughts directly to your Tasks Inbox/i)).toBeInTheDocument();
    expect(screen.getByText('0 thoughts buffered')).toBeInTheDocument();

    // Navigate to Tasks tab to confirm new tasks were persisted into real state
    const mainNav = screen.getByRole('navigation', { name: /Main Navigation/i });
    const tasksTab = within(mainNav).getByRole('button', { name: /Tasks/i });
    fireEvent.click(tasksTab);

    expect(screen.getByText('Email prof about thesis sources')).toBeInTheDocument();
    expect(screen.getByText('Buy index cards')).toBeInTheDocument();
  });
});
