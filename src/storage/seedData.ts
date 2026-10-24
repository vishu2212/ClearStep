import { AppStore, Task } from '../domain/types';
import { getLocalDateString } from '../domain/recommendationEngine';

export function getInitialSeedData(): AppStore {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = getLocalDateString(tomorrow);

  const fourDaysLater = new Date();
  fourDaysLater.setDate(fourDaysLater.getDate() + 4);
  const fourDaysLaterStr = getLocalDateString(fourDaysLater);

  const sampleTasks: Task[] = [
    {
      id: 'task-bio-lab',
      title: 'Biology Lab Report: Cellular Respiration',
      description: 'Analyze experimental data on yeast yeast respiration rates and complete lab write-up.',
      priority: 'urgent',
      dueDate: tomorrowStr,
      tags: ['Academics', 'Biology', 'Lab'],
      subtasks: [
        {
          id: 'sub-bio-1',
          title: 'Calculate mean CO2 production across trial runs',
          completed: true,
          completedAt: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: 'sub-bio-2',
          title: 'Plot bar graph of oxygen consumption rates',
          completed: false,
          completedAt: null,
        },
        {
          id: 'sub-bio-3',
          title: 'Write 2-paragraph discussion on source of error',
          completed: false,
          completedAt: null,
        },
        {
          id: 'sub-bio-4',
          title: 'Proofread conclusion against grading rubric',
          completed: false,
          completedAt: null,
        },
      ],
      completed: false,
      completedAt: null,
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
      isFocusPinned: false,
    },
    {
      id: 'task-hist-essay',
      title: 'History Essay: Industrial Revolution Causes',
      description: 'Draft 1,500 word argumentative essay evaluating technological vs economic factors.',
      priority: 'high',
      dueDate: fourDaysLaterStr,
      tags: ['History', 'Writing'],
      subtasks: [
        {
          id: 'sub-hist-1',
          title: 'Select 3 primary source quotes on steam engine adoption',
          completed: true,
          completedAt: new Date(Date.now() - 7200000).toISOString(),
        },
        {
          id: 'sub-hist-2',
          title: 'Outline main arguments for Section 2',
          completed: false,
          completedAt: null,
        },
        {
          id: 'sub-hist-3',
          title: 'Draft body paragraphs 1 and 2',
          completed: false,
          completedAt: null,
        },
      ],
      completed: false,
      completedAt: null,
      createdAt: new Date(Date.now() - 172800000).toISOString(),
      updatedAt: new Date().toISOString(),
      isFocusPinned: false,
    },
    {
      id: 'task-math-ps',
      title: 'Linear Algebra: Problem Set 4',
      description: 'Matrix determinants and eigenvector calculations for Friday lecture.',
      priority: 'medium',
      dueDate: null,
      tags: ['Math'],
      subtasks: [
        {
          id: 'sub-math-1',
          title: 'Review Chapter 4 eigenvalue formula proofs',
          completed: false,
          completedAt: null,
        },
        {
          id: 'sub-math-2',
          title: 'Solve questions 1 through 5 in textbook',
          completed: false,
          completedAt: null,
        },
      ],
      completed: false,
      completedAt: null,
      createdAt: new Date(Date.now() - 43200000).toISOString(),
      updatedAt: new Date().toISOString(),
      isFocusPinned: false,
    },
  ];

  return {
    schemaVersion: 1,
    tasks: sampleTasks,
    sessions: [
      {
        id: 'seed-session-1',
        taskId: 'task-bio-lab',
        taskTitle: 'Biology Lab Report: Cellular Respiration',
        mode: 'focus',
        durationMinutes: 25,
        completedAt: new Date(Date.now() - 3600000).toISOString(),
      },
    ],
    preferences: {
      focusDuration: 25,
      shortBreakDuration: 5,
      longBreakDuration: 15,
      theme: 'system',
      reducedMotion: false,
      highContrastFocus: false,
      soundAlerts: false,
    },
    lastUpdated: new Date().toISOString(),
  };
}
