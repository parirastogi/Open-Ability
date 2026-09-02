import { parseSpokenEmail } from '@/services/voice/emailParser';

export type GeminiIntentType =
  | 'VOICE_MODE_DECISION'
  | 'LANGUAGE_DECISION'
  | 'AUTH_METHOD_DECISION'
  | 'SIGNUP_NAME'
  | 'SIGNUP_EMAIL'
  | 'GLOBAL_CONTROL'
  | 'NAVIGATION'
  | 'UNKNOWN';

export interface GeminiStructuredIntent {
  intent: GeminiIntentType;
  confidence: number;
  value?: string;
  parameters?: {
    answer?: 'yes' | 'no';
    lang?: 'en-IN' | 'hi-IN';
    choice?: 'LOGIN' | 'SIGNUP';
    fullName?: string;
    email?: string;
    control?: 'STOP' | 'REPEAT' | 'CANCEL';
    action?: string;
  };
}

export class GeminiLiveService {
  public async parseSpokenAudioStream(
    transcript: string,
    currentState: string
  ): Promise<GeminiStructuredIntent> {
    const raw = transcript.trim();
    const text = raw.toLowerCase();

    if (text === 'stop' || text === 'pause' || text === 'quiet') {
      return {
        intent: 'GLOBAL_CONTROL',
        confidence: 0.99,
        parameters: { control: 'STOP' }
      };
    }

    if (text === 'repeat' || text === 'say again' || text === 'again' || text === 'repeat question') {
      return {
        intent: 'GLOBAL_CONTROL',
        confidence: 0.99,
        parameters: { control: 'REPEAT' }
      };
    }

    if (text === 'cancel' || text === 'exit voice' || text === 'use text') {
      return {
        intent: 'GLOBAL_CONTROL',
        confidence: 0.99,
        parameters: { control: 'CANCEL' }
      };
    }

    if (currentState === 'VOICE_MODE_QUESTION') {
      const isYes = text.includes('yes') || text.includes('yeah') || text.includes('yep') || text.includes('sure') || text.includes('voice') || text.includes('hands-free') || text.includes('ok');
      const isNo = text.includes('no') || text.includes('text') || text.includes('not now');

      if (isYes) {
        return {
          intent: 'VOICE_MODE_DECISION',
          confidence: 0.98,
          parameters: { answer: 'yes' }
        };
      }
      if (isNo) {
        return {
          intent: 'VOICE_MODE_DECISION',
          confidence: 0.98,
          parameters: { answer: 'no' }
        };
      }
    }

    if (currentState === 'LANGUAGE_QUESTION') {
      if (text.includes('hindi') || text.includes('हिंदी')) {
        return {
          intent: 'LANGUAGE_DECISION',
          confidence: 0.98,
          parameters: { lang: 'hi-IN' }
        };
      }
      if (text.includes('english')) {
        return {
          intent: 'LANGUAGE_DECISION',
          confidence: 0.98,
          parameters: { lang: 'en-IN' }
        };
      }
    }

    if (currentState === 'AUTH_METHOD_QUESTION') {
      const isLogin = text.includes('login') || text.includes('sign in') || text.includes('already have') || text.includes('existing');
      const isSignup = text.includes('signup') || text.includes('create') || text.includes('new') || text.includes('register');

      if (isLogin) {
        return {
          intent: 'AUTH_METHOD_DECISION',
          confidence: 0.98,
          parameters: { choice: 'LOGIN' }
        };
      }
      if (isSignup) {
        return {
          intent: 'AUTH_METHOD_DECISION',
          confidence: 0.98,
          parameters: { choice: 'SIGNUP' }
        };
      }
    }

    if (currentState === 'SIGNUP_NAME') {
      const nameMatch = raw.match(/(?:my name is|i am|name is|call me)\s+(.+)/i);
      const cleanName = nameMatch ? nameMatch[1].trim() : raw;
      if (cleanName.length > 1) {
        return {
          intent: 'SIGNUP_NAME',
          confidence: 0.95,
          parameters: { fullName: cleanName }
        };
      }
    }

    if (currentState === 'SIGNUP_EMAIL') {
      const parsedEmail = parseSpokenEmail(raw);
      if (parsedEmail.includes('@')) {
        return {
          intent: 'SIGNUP_EMAIL',
          confidence: 0.95,
          parameters: { email: parsedEmail }
        };
      }
    }

    return {
      intent: 'UNKNOWN',
      confidence: 0.5,
      value: raw
    };
  }
}

export const geminiLiveService = new GeminiLiveService();
