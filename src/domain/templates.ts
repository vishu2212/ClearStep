export interface TaskTemplate {
  id: string;
  name: string;
  description: string;
  category: 'study' | 'project' | 'admin' | 'exam';
  subtasks: string[];
}

export const TASK_TEMPLATES: TaskTemplate[] = [
  {
    id: 'essay-research',
    name: 'Research Paper & Essay',
    description: 'Deconstruct a multi-page essay from thesis to proofread draft',
    category: 'study',
    subtasks: [
      'Define clear thesis statement and research question',
      'Gather 3-4 peer-reviewed sources and annotate key quotes',
      'Construct section-by-section argument outline',
      'Draft introduction and initial body paragraph',
      'Draft remaining body arguments with source citations',
      'Draft conclusion and check argument alignment',
      'Format references & perform final read-through against rubric',
    ],
  },
  {
    id: 'exam-prep',
    name: 'Exam & Test Preparation',
    description: 'Structured review cycle to master course modules without cramming',
    category: 'exam',
    subtasks: [
      'Print or review syllabus learning outcomes for module',
      'Identify 3 weakest topic areas needing immediate focus',
      'Create active recall cards for core terms and formulas',
      'Complete 2 practice problem sets without referencing notes',
      'Review mistakes and write correction explanations',
      'Perform a 30-minute timed mock test run',
    ],
  },
  {
    id: 'project-feature',
    name: 'Project Milestone / Feature',
    description: 'Break down an engineering or creative assignment milestone',
    category: 'project',
    subtasks: [
      'Clarify input/output requirements and boundary edge cases',
      'Sketch architecture / component wireframe',
      'Implement core data structures and interfaces',
      'Build minimal working path (happy path)',
      'Add error handling and edge condition tests',
      'Clean up code, comments, and prepare demonstration',
    ],
  },
  {
    id: 'admin-application',
    name: 'Administrative / Forms & Applications',
    description: 'Tackle paperwork, scholarship applications, or registration forms',
    category: 'admin',
    subtasks: [
      'Read official instructions and list all required materials',
      'Gather transcripts, ID, or prerequisite documents',
      'Complete initial draft of required answers / essay prompt',
      'Verify formatting, file sizes, and submission guidelines',
      'Submit form and save confirmation / receipt PDF',
    ],
  },
];
