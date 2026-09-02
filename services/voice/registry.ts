export type ActionName =
  | 'NAVIGATE_HOME'
  | 'CLICK_GET_STARTED'
  | 'OPEN_DASHBOARD'
  | 'OPEN_RESUME'
  | 'OPEN_JOBS'
  | 'OPEN_PROFILE'
  | 'OPEN_ACCESSIBILITY'
  | 'OPEN_ASSISTANT'
  | 'OPEN_INTERVIEW'
  | 'OPEN_VOICE'
  | 'OPEN_SIGN_LANGUAGE'
  | 'FILL_NAME'
  | 'FILL_EMAIL'
  | 'FILL_EDUCATION'
  | 'FILL_CAREER_GOAL'
  | 'SELECT_COMMUNICATION_METHOD'
  | 'SELECT_WORK_PREFERENCE'
  | 'SELECT_ACCESSIBILITY_OPTION'
  | 'UPLOAD_RESUME'
  | 'ANALYZE_RESUME'
  | 'SEARCH_JOBS'
  | 'FILTER_REMOTE_JOBS'
  | 'OPEN_JOB'
  | 'SAVE_JOB'
  | 'APPLY_JOB'
  | 'START_INTERVIEW'
  | 'NEXT_INTERVIEW_QUESTION'
  | 'SCROLL_DOWN'
  | 'SCROLL_UP'
  | 'GO_BACK'
  | 'READ_PAGE'
  | 'READ_MATCH_SCORE'
  | 'EXPLAIN_MATCH'
  | 'SPELL_NAME'
  | 'COMMAND_HELP'
  | 'STOP';

export interface VoiceAction {
  name: ActionName;
  description: string;
  requiresConfirmation: boolean;
  validate?: (params: any) => boolean;
}

export const VOICE_ACTIONS: Record<ActionName, VoiceAction> = {
  NAVIGATE_HOME: { name: 'NAVIGATE_HOME', description: 'Go to home landing page', requiresConfirmation: false },
  CLICK_GET_STARTED: { name: 'CLICK_GET_STARTED', description: 'Click start career journey', requiresConfirmation: false },
  OPEN_DASHBOARD: { name: 'OPEN_DASHBOARD', description: 'Open dashboard status view', requiresConfirmation: false },
  OPEN_RESUME: { name: 'OPEN_RESUME', description: 'Open resume analysis page', requiresConfirmation: false },
  OPEN_JOBS: { name: 'OPEN_JOBS', description: 'Open jobs matching page', requiresConfirmation: false },
  OPEN_PROFILE: { name: 'OPEN_PROFILE', description: 'Open profile edit settings', requiresConfirmation: false },
  OPEN_ACCESSIBILITY: { name: 'OPEN_ACCESSIBILITY', description: 'Open accessibility settings tab', requiresConfirmation: false },
  OPEN_ASSISTANT: { name: 'OPEN_ASSISTANT', description: 'Open AI career assistant page', requiresConfirmation: false },
  OPEN_INTERVIEW: { name: 'OPEN_INTERVIEW', description: 'Open inclusive mock interview sessions', requiresConfirmation: false },
  OPEN_VOICE: { name: 'OPEN_VOICE', description: 'Open dedicated voice console', requiresConfirmation: false },
  OPEN_SIGN_LANGUAGE: { name: 'OPEN_SIGN_LANGUAGE', description: 'Open sign language prototype', requiresConfirmation: false },
  
  FILL_NAME: { 
    name: 'FILL_NAME', 
    description: 'Fill name in profile', 
    requiresConfirmation: false,
    validate: (p) => typeof p?.name === 'string' && p.name.trim().length > 0
  },
  FILL_EMAIL: { 
    name: 'FILL_EMAIL', 
    description: 'Fill email address', 
    requiresConfirmation: false,
    validate: (p) => typeof p?.email === 'string' && p.email.includes('@')
  },
  FILL_EDUCATION: { 
    name: 'FILL_EDUCATION', 
    description: 'Fill academic history details', 
    requiresConfirmation: false 
  },
  FILL_CAREER_GOAL: { 
    name: 'FILL_CAREER_GOAL', 
    description: 'Fill target job roles', 
    requiresConfirmation: false 
  },
  
  SELECT_COMMUNICATION_METHOD: { 
    name: 'SELECT_COMMUNICATION_METHOD', 
    description: 'Select communication channels', 
    requiresConfirmation: false 
  },
  SELECT_WORK_PREFERENCE: { 
    name: 'SELECT_WORK_PREFERENCE', 
    description: 'Select remote or office options', 
    requiresConfirmation: false 
  },
  SELECT_ACCESSIBILITY_OPTION: { 
    name: 'SELECT_ACCESSIBILITY_OPTION', 
    description: 'Toggle accessibility accommodations checklist', 
    requiresConfirmation: false 
  },
  
  UPLOAD_RESUME: { name: 'UPLOAD_RESUME', description: 'Open browser file picker to select resume', requiresConfirmation: false },
  ANALYZE_RESUME: { name: 'ANALYZE_RESUME', description: 'Analyze the uploaded resume contents', requiresConfirmation: false },
  
  SEARCH_JOBS: { name: 'SEARCH_JOBS', description: 'Filter jobs list by keyword or roles', requiresConfirmation: false },
  FILTER_REMOTE_JOBS: { name: 'FILTER_REMOTE_JOBS', description: 'Filter jobs to remote only', requiresConfirmation: false },
  OPEN_JOB: { name: 'OPEN_JOB', description: 'View compatibility match detail for a job', requiresConfirmation: false },
  SAVE_JOB: { name: 'SAVE_JOB', description: 'Save job to candidate profile', requiresConfirmation: false },
  APPLY_JOB: { name: 'APPLY_JOB', description: 'Apply to position opening', requiresConfirmation: true },
  
  START_INTERVIEW: { name: 'START_INTERVIEW', description: 'Launch practice session', requiresConfirmation: false },
  NEXT_INTERVIEW_QUESTION: { name: 'NEXT_INTERVIEW_QUESTION', description: 'Move to next question prompt', requiresConfirmation: false },
  
  SCROLL_DOWN: { name: 'SCROLL_DOWN', description: 'Scroll page layout down', requiresConfirmation: false },
  SCROLL_UP: { name: 'SCROLL_UP', description: 'Scroll page layout up', requiresConfirmation: false },
  GO_BACK: { name: 'GO_BACK', description: 'Navigate back in routing log', requiresConfirmation: false },
  
  READ_PAGE: { name: 'READ_PAGE', description: 'Synthesize overview reading of active page contents', requiresConfirmation: false },
  READ_MATCH_SCORE: { name: 'READ_MATCH_SCORE', description: 'Read candidate compatibility rating', requiresConfirmation: false },
  EXPLAIN_MATCH: { name: 'EXPLAIN_MATCH', description: 'Explain why the job matches', requiresConfirmation: false },
  
  SPELL_NAME: { name: 'SPELL_NAME', description: 'Initiate keyboard letter spelling sequences', requiresConfirmation: false },
  COMMAND_HELP: { name: 'COMMAND_HELP', description: 'Display vocal help shortcuts menu', requiresConfirmation: false },
  STOP: { name: 'STOP', description: 'Stop current listening cycles', requiresConfirmation: false }
};
