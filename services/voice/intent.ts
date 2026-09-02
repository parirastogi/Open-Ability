import { ActionName } from './registry';

export interface DecodedIntent {
  action: ActionName;
  parameters?: any;
  entities?: {
    index?: number;
    pronoun?: boolean;
    remoteOnly?: boolean;
    companyName?: string;
    text?: string;
  };
  confidence: number;
}

export class VoiceIntentService {
  public classify(transcript: string): DecodedIntent {
    const text = transcript.toLowerCase().trim();

    // 1. Pronoun and target selections
    const isPronoun = text === 'it' || text === 'that' || text.includes('save it') || text.includes('open it') || text.includes('apply it') || text.includes('why is it');
    
    let index: number | undefined = undefined;
    if (text.includes('first one') || text.includes('first job') || text.includes('first matching')) {
      index = 0;
    } else if (text.includes('second one') || text.includes('second job')) {
      index = 1;
    } else if (text.includes('third one') || text.includes('third job')) {
      index = 2;
    }

    const isRemoteSelection = text.includes('remote one') || text.includes('the remote one');
    
    let companyName: string | undefined = undefined;
    if (text.includes('abc') || text.includes('abc technologies')) {
      companyName = 'ABC Technologies';
    } else if (text.includes('vidhwan') || text.includes('vidhwan labs')) {
      companyName = 'Vidhwan Labs';
    } else if (text.includes('inclusion') || text.includes('inclusion first')) {
      companyName = 'Inclusion First';
    }

    // 2. Action routing with entity tagging
    if (this.matchesAny(text, ['open the first job', 'open first job', 'open the first one', 'open first one', 'open the second one', 'open the remote one', 'open abc technologies'])) {
      return {
        action: 'OPEN_JOB',
        entities: { index, remoteOnly: isRemoteSelection, companyName },
        confidence: 0.99
      };
    }

    if (this.matchesAny(text, ['save it', 'save that', 'save the job', 'save job'])) {
      return {
        action: 'SAVE_JOB',
        entities: { pronoun: true },
        confidence: 0.98
      };
    }

    if (this.matchesAny(text, ['apply it', 'apply that', 'apply to this job', 'apply to it', 'submit my application'])) {
      return {
        action: 'APPLY_JOB',
        entities: { pronoun: true },
        confidence: 0.98
      };
    }

    if (this.matchesAny(text, ['why did you recommend this', 'why was this job recommended', 'why is it a good match', 'explain this match', 'why is it good', 'explain it'])) {
      return {
        action: 'EXPLAIN_MATCH',
        entities: { pronoun: isPronoun },
        confidence: 0.99
      };
    }

    if (this.matchesAny(text, ['is this workplace accessible', 'read readiness details', 'show accessibility readiness', 'is it accessible'])) {
      return {
        action: 'READ_MATCH_SCORE',
        entities: { pronoun: isPronoun },
        confidence: 0.99
      };
    }

    // 3. Navigation
    if (this.matchesAny(text, ['click get started', 'open get started', "let's get started", 'start my career', 'start your career', 'get started'])) {
      return { action: 'CLICK_GET_STARTED', confidence: 0.99 };
    }
    if (this.matchesAny(text, ['open dashboard', 'go to dashboard', 'show overview', 'view dashboard', 'show dashboard'])) {
      return { action: 'OPEN_DASHBOARD', confidence: 0.99 };
    }
    if (this.matchesAny(text, ['open my resume', 'open resume', 'go to resume', 'show resume analysis', 'view resume', 'upload my resume'])) {
      return { action: 'OPEN_RESUME', parameters: { autoUpload: text.includes('upload') }, confidence: 0.99 };
    }
    if (this.matchesAny(text, ['show me remote jobs', 'find remote opportunities', 'find jobs that allow remote work', 'show remote jobs', 'filter remote jobs'])) {
      return { action: 'FILTER_REMOTE_JOBS', confidence: 0.99 };
    }
    if (this.matchesAny(text, ['open jobs', 'go to jobs', 'view jobs', 'show jobs', 'browse jobs', 'find jobs'])) {
      const roleMatch = text.match(/(?:find|show)\s+(.+?)\s+jobs/);
      if (roleMatch && roleMatch[1]) {
        return { action: 'SEARCH_JOBS', parameters: { role: roleMatch[1].trim() }, confidence: 0.95 };
      }
      return { action: 'OPEN_JOBS', confidence: 0.99 };
    }
    if (this.matchesAny(text, ['go to my profile', 'open my profile', 'open profile', 'edit profile', 'profile settings'])) {
      return { action: 'OPEN_PROFILE', confidence: 0.99 };
    }
    if (this.matchesAny(text, ['open assistant', 'go to assistant', 'ask assistant', 'career assistant'])) {
      return { action: 'OPEN_ASSISTANT', confidence: 0.99 };
    }
    if (this.matchesAny(text, ['start my interview', 'open interview', 'go to interview', 'start interview', 'mock interview'])) {
      return { action: 'OPEN_INTERVIEW', parameters: { autoStart: text.includes('start') }, confidence: 0.99 };
    }
    if (this.matchesAny(text, ['go back', 'take me to the previous page', 'previous page', 'back'])) {
      return { action: 'GO_BACK', confidence: 0.99 };
    }
    if (this.matchesAny(text, ['what can i say', 'show voice commands', 'help command', 'voice help'])) {
      return { action: 'COMMAND_HELP', confidence: 0.99 };
    }
    if (this.matchesAny(text, ['stop listening', 'stop', 'cancel', 'mute'])) {
      return { action: 'STOP', confidence: 0.99 };
    }

    // 4. Form Spelling
    if (this.matchesAny(text, ['spell my name', 'spell my first name', 'spelling mode'])) {
      return { action: 'SPELL_NAME', confidence: 0.98 };
    }

    // 5. Form Conversational Inputs
    const nameMatch = text.match(/(?:my name is|i am|name is|change my name to)\s+(.+)/i);
    if (nameMatch && nameMatch[1]) {
      const cleanName = this.capitalizeWords(nameMatch[1].replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "").trim());
      return { action: 'FILL_NAME', parameters: { name: cleanName }, confidence: 0.95 };
    }

    const emailMatch = text.match(/(?:email is|email address is|email)\s+(\S+@\S+)/i);
    if (emailMatch && emailMatch[1]) {
      return { action: 'FILL_EMAIL', parameters: { email: emailMatch[1].trim() }, confidence: 0.95 };
    }

    const eduMatch = text.match(/(?:studying|degree in|education is|education in)\s+(.+)/i);
    if (eduMatch && eduMatch[1]) {
      return { action: 'FILL_EDUCATION', parameters: { education: this.capitalizeWords(eduMatch[1].trim()) }, confidence: 0.90 };
    }

    const goalMatch = text.match(/(?:become an|become a|career goal is|target role is|target is)\s+(.+)/i);
    if (goalMatch && goalMatch[1]) {
      return { action: 'FILL_CAREER_GOAL', parameters: { goal: this.capitalizeWords(goalMatch[1].trim()) }, confidence: 0.90 };
    }

    // 6. Conversational Preferences
    if (this.matchesAny(text, ['prefer text communication', 'select text communication', 'text communication only', 'i prefer text'])) {
      return { action: 'SELECT_COMMUNICATION_METHOD', parameters: { method: 'TEXT' }, confidence: 0.98 };
    }
    if (this.matchesAny(text, ['prefer voice communication', 'select voice communication', 'voice communication only', 'i prefer voice'])) {
      return { action: 'SELECT_COMMUNICATION_METHOD', parameters: { method: 'VOICE' }, confidence: 0.98 };
    }
    if (this.matchesAny(text, ['prefer sign language', 'select sign language', 'sign language only'])) {
      return { action: 'SELECT_COMMUNICATION_METHOD', parameters: { method: 'SIGN_LANGUAGE' }, confidence: 0.98 };
    }

    if (this.matchesAny(text, ['want remote work', 'select remote work', 'i prefer remote', 'remote preference'])) {
      return { action: 'SELECT_WORK_PREFERENCE', parameters: { preference: 'REMOTE' }, confidence: 0.98 };
    }
    if (this.matchesAny(text, ['i use a screen reader', 'screen reader compatibility', 'screen reader support'])) {
      return { action: 'SELECT_ACCESSIBILITY_OPTION', parameters: { option: 'screenReaderRequired' }, confidence: 0.98 };
    }
    if (this.matchesAny(text, ['flexible working hours', 'i need flexible hours', 'flexible hours support'])) {
      return { action: 'SELECT_ACCESSIBILITY_OPTION', parameters: { option: 'flexibleHours' }, confidence: 0.98 };
    }

    // 7. Interview practice controls
    if (this.matchesAny(text, ['repeat the question', 'read question aloud'])) {
      return { action: 'READ_PAGE', parameters: { context: 'interview_question' }, confidence: 0.90 };
    }
    if (this.matchesAny(text, ['ask me the next question', 'next question', 'move to the next question'])) {
      return { action: 'NEXT_INTERVIEW_QUESTION', confidence: 0.98 };
    }

    // Clarification triggers (if confidence is moderate/low)
    if (text.includes('ai') || text.includes('engineer') || text.includes('remote') || text.includes('jobs')) {
      return { 
        action: 'SEARCH_JOBS', 
        parameters: { role: 'AI Engineer' }, 
        confidence: 0.65 // Triggers clarification flow!
      };
    }

    // Default: Ask assistant question
    return {
      action: 'OPEN_ASSISTANT',
      parameters: { query: transcript },
      confidence: 0.70
    };
  }

  private matchesAny(text: string, patterns: string[]): boolean {
    return patterns.some(p => text.includes(p) || p.includes(text));
  }

  private capitalizeWords(str: string): string {
    return str.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  }
}

export const voiceIntentService = new VoiceIntentService();
