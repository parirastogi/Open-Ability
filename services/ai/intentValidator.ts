import { EntryState } from '@/context/VoiceAgentContext';

export interface ValidationResult {
  isValid: boolean;
  targetNextState?: EntryState;
  reason?: string;
  actionPayload?: any;
}

export class IntentValidator {
  /**
   * Validate Gemini Live Tool Call against authoritative OpenAbility state machine guard
   */
  public validateToolCall(
    functionName: string,
    args: any,
    currentEntryState: EntryState,
    activeQuestionId: string,
    isResolved: boolean
  ): ValidationResult {
    // 1. Single-Decision Atomic Resolution Guard
    if (isResolved) {
      return {
        isValid: false,
        reason: `Question ${activeQuestionId} is already resolved. Discarding duplicate tool call.`
      };
    }

    // 2. questionId Guard (if tool call specified questionId, verify it matches active question)
    if (args?.questionId && args.questionId !== activeQuestionId) {
      return {
        isValid: false,
        reason: `Mismatched questionId (Received: ${args.questionId}, Active: ${activeQuestionId}). Discarding out-of-order tool call.`
      };
    }

    // 3. Global Priority Controls (STOP, REPEAT, CANCEL, GO_BACK, HELP)
    if (functionName === 'triggerGlobalControl') {
      const control = args?.control;
      if (control === 'STOP') {
        return { isValid: true, actionPayload: { type: 'GLOBAL_CONTROL', control: 'STOP' } };
      }
      if (control === 'REPEAT') {
        return { isValid: true, actionPayload: { type: 'GLOBAL_CONTROL', control: 'REPEAT' } };
      }
      if (control === 'CANCEL') {
        return { isValid: true, targetNextState: 'TEXT_MODE', actionPayload: { type: 'GLOBAL_CONTROL', control: 'CANCEL' } };
      }
      if (control === 'GO_BACK') {
        return { isValid: true, actionPayload: { type: 'GLOBAL_CONTROL', control: 'GO_BACK' } };
      }
    }

    // 4. VOICE_MODE_QUESTION State Guard
    if (functionName === 'submitVoiceModeDecision') {
      if (currentEntryState !== 'VOICE_MODE_QUESTION') {
        return {
          isValid: false,
          reason: `submitVoiceModeDecision is invalid in state ${currentEntryState}`
        };
      }
      const answer = args?.answer;
      if (answer === 'yes') {
        return { isValid: true, targetNextState: 'LANGUAGE_QUESTION', actionPayload: { answer: 'yes' } };
      }
      if (answer === 'no') {
        return { isValid: true, targetNextState: 'TEXT_MODE', actionPayload: { answer: 'no' } };
      }
    }

    // 5. LANGUAGE_QUESTION State Guard
    if (functionName === 'submitLanguageDecision') {
      if (currentEntryState !== 'LANGUAGE_QUESTION') {
        return {
          isValid: false,
          reason: `submitLanguageDecision is invalid in state ${currentEntryState}`
        };
      }
      const lang = args?.lang;
      if (lang === 'en-IN' || lang === 'hi-IN') {
        return { isValid: true, targetNextState: 'AUTH_METHOD_QUESTION', actionPayload: { lang } };
      }
    }

    // 6. AUTH_METHOD_QUESTION State Guard
    if (functionName === 'submitAuthChoice') {
      if (currentEntryState !== 'AUTH_METHOD_QUESTION') {
        return {
          isValid: false,
          reason: `submitAuthChoice is invalid in state ${currentEntryState}`
        };
      }
      const choice = args?.choice;
      if (choice === 'LOGIN') {
        return { isValid: true, targetNextState: 'LOGIN_EMAIL', actionPayload: { choice: 'LOGIN' } };
      }
      if (choice === 'SIGNUP') {
        return { isValid: true, targetNextState: 'SIGNUP_NAME', actionPayload: { choice: 'SIGNUP' } };
      }
    }

    return {
      isValid: false,
      reason: `Unrecognized tool call ${functionName} for state ${currentEntryState}`
    };
  }
}

export const intentValidator = new IntentValidator();
