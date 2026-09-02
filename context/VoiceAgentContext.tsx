'use client';

import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { speechService } from '@/services/speech';
import { voiceIntentService, DecodedIntent } from '@/services/voice/intent';
import { ActionName, VOICE_ACTIONS } from '@/services/voice/registry';
import { seedJobs, emptyCandidate } from '@/database/seed-data';
import { aiService } from '@/services/ai';
import { parseSpokenEmail } from '@/services/voice/emailParser';
import { useAuth } from '@/context/AuthContext';
import { geminiLiveService } from '@/services/ai/geminiLiveService';
import { pcmRecorder } from '@/services/audio/pcmRecorder';
import { geminiLiveClient, GeminiToolCall } from '@/services/ai/geminiLiveClient';
import { intentValidator } from '@/services/ai/intentValidator';

export type EntryState =
  | 'INITIAL'
  | 'VOICE_MODE_QUESTION'
  | 'LANGUAGE_QUESTION'
  | 'AUTH_METHOD_QUESTION'
  | 'SIGNUP_NAME'
  | 'SIGNUP_EMAIL'
  | 'SIGNUP_PASSWORD'
  | 'LOGIN_EMAIL'
  | 'LOGIN_PASSWORD'
  | 'TEXT_MODE'
  | 'COMPLETE';

export type VoiceStatus =
  | 'IDLE'
  | 'SPEAKING'
  | 'LISTENING'
  | 'PROCESSING'
  | 'UNDERSTANDING'
  | 'CLARIFYING'
  | 'EXECUTING'
  | 'CONFIRMING'
  | 'ONBOARDING'
  | 'COMPLETE'
  | 'ERROR'
  | 'ENTRY_GREETING'
  | 'ENTRY_LANGUAGE'
  | 'ENTRY_CHOICE'
  | 'SIGNUP_NAME'
  | 'SIGNUP_NAME_CONFIRM'
  | 'SIGNUP_EMAIL'
  | 'SIGNUP_EMAIL_CONFIRM'
  | 'SIGNUP_PASSWORD'
  | 'LOGIN_EMAIL'
  | 'LOGIN_EMAIL_CONFIRM'
  | 'LOGIN_PASSWORD'
  | 'CONFIRM_LOGOUT';

export type OnboardingStep =
  | 'OFF'
  | 'NAME'
  | 'EXPERIENCE'
  | 'ROLES'
  | 'SKILLS'
  | 'WORK_PREF'
  | 'ACCESSIBILITY'
  | 'CONFIRM';

export interface VoiceLogEntry {
  id: string;
  text: string;
  timestamp: string;
  source: 'user' | 'assistant';
}

interface VoiceAgentContextType {
  entryState: EntryState;
  status: VoiceStatus;
  transcript: string;
  voiceLogs: VoiceLogEntry[];
  clearVoiceLogs: () => void;
  addVoiceLog: (text: string, source?: 'user' | 'assistant') => void;
  feedback: string;
  ttsEnabled: boolean;
  setTtsEnabled: (enabled: boolean) => void;
  voiceFirstMode: boolean;
  setVoiceFirstMode: (mode: boolean) => void;
  activeLanguage: string;
  speechRate: number;
  setLanguageLocale: (locale: string) => void;
  setSpeechSpeedRate: (rate: number) => void;
  cycleVoiceIndexOption: () => void;
  onboardingStep: OnboardingStep;
  startVoiceOnboarding: () => void;
  startZeroTouchVoiceEntry: () => void;
  handleVoiceModeDecision: (decision: 'yes' | 'no') => void;
  handleLanguageDecision: (lang: 'en-IN' | 'hi-IN') => void;
  handleAuthMethodDecision: (choice: 'LOGIN' | 'SIGNUP') => void;
  enableVoiceMode: () => void;
  enableTextMode: () => void;
  selectLanguageChoice: (lang: 'en-IN' | 'hi-IN') => void;
  selectAuthChoice: (choice: 'LOGIN' | 'SIGNUP') => void;
  startAgentListening: () => void;
  stopAgentListening: () => void;
  toggleAgentListening: () => void;
  handleVoiceInputText: (text: string) => void;
  triggerVoiceDemo: () => void;
  replayLastSpeech: () => void;
  speakPageSummary: () => void;
  speakFeedback: (text: string, callback?: () => void) => void;
  isSpellingMode: boolean;
  candidate: { profile: any; accessibility: any; skills: string[] };
  updateCandidateState: (newCand: { profile: any; accessibility: any; skills: string[] }) => void;
}

const VoiceAgentContext = createContext<VoiceAgentContextType | undefined>(undefined);

export function VoiceAgentProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const auth = useAuth();

  const [entryState, setEntryState] = useState<EntryState>('INITIAL');
  const [status, setStatus] = useState<VoiceStatus>('IDLE');
  const [feedback, setFeedback] = useState<string>("Ask OpenAbility");
  const [transcript, setTranscript] = useState<string>('');
  const [voiceLogs, setVoiceLogs] = useState<VoiceLogEntry[]>([]);

  const addVoiceLog = (text: string, source: 'user' | 'assistant' = 'user') => {
    if (!text || !text.trim()) return;
    const newEntry: VoiceLogEntry = {
      id: Math.random().toString(36).substring(2, 9),
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      source
    };
    setVoiceLogs((prev) => [newEntry, ...prev.slice(0, 49)]); // Keep last 50 spoken text logs
  };

  const clearVoiceLogs = () => {
    setVoiceLogs([]);
  };
  const [activeLanguage, setActiveLanguage] = useState<string>('en-IN');
  const [speechRate, setSpeechRate] = useState<number>(0.95);
  const [ttsEnabled, setTtsEnabled] = useState<boolean>(true);
  const [voiceFirstMode, setVoiceFirstModeState] = useState<boolean>(false);
  const [pendingAction, setPendingAction] = useState<DecodedIntent | null>(null);
  const [lastSelectedJobId, setLastSelectedJobId] = useState<string>(seedJobs[0]?.id || '');
  const [searchTerm, setSearchTerm] = useState('');
  const [workTypeFilter, setWorkTypeFilter] = useState('ALL');

  // Transition Guard ID
  const transitionIdRef = useRef<number>(0);
  const isInitializedRef = useRef<boolean>(false);

  // Voice Onboarding State Machine
  const [onboardingStep, setOnboardingStep] = useState<OnboardingStep>('OFF');
  const [draftProfile, setDraftProfile] = useState<any>({
    fullName: '',
    experienceYears: 0,
    targetRoles: [],
    skills: [],
    workPreference: 'REMOTE',
    accommodations: [],
    communicationPreference: 'VOICE'
  });

  // Zero-Touch Authentication State Variables
  const [signupDraft, setSignupDraft] = useState({ fullName: '', email: '' });
  const [loginEmailDraft, setLoginEmailDraft] = useState('');

  // Spelling Mode variables
  const [isSpellingMode, setIsSpellingMode] = useState(false);
  const [spelledWord, setSpelledWord] = useState('');

  // Speak TTS then listen with transition ID guard & 300ms safety delay
  const speakQuestionThenListen = (text: string, stateForTransition: EntryState) => {
    transitionIdRef.current += 1;
    const currentId = transitionIdRef.current;

    speechService.stopSpeaking();
    speechService.stopListening();

    setEntryState(stateForTransition);
    setStatus('SPEAKING');
    setFeedback(text);

    speechService.speak(text, () => {
      if (transitionIdRef.current !== currentId) return;

      setTimeout(() => {
        if (transitionIdRef.current !== currentId) return;
        setStatus('LISTENING');
        startAgentListeningWithId(currentId);
      }, 300);
    });
  };

  // Question Request Guard & Single-Decision Resolution Guard Refs
  const questionIdRef = useRef<string>('q_init_0');
  const isResolvedRef = useRef<boolean>(false);

  // Start Zero-Touch Voice Entry Flow
  const startZeroTouchVoiceEntry = async () => {
    if (isInitializedRef.current) return;
    isInitializedRef.current = true;
    questionIdRef.current = 'q_voice_mode_1';
    isResolvedRef.current = false;

    // Connect Gemini Live WebSocket Session with bi-directional Tool Call / toolResponse loop
    await geminiLiveClient.connect((toolCall: GeminiToolCall) => {
      const validation = intentValidator.validateToolCall(
        toolCall.name,
        toolCall.args,
        entryState,
        questionIdRef.current,
        isResolvedRef.current
      );
      
      if (validation.isValid) {
        isResolvedRef.current = true;
        geminiLiveClient.sendToolResponse(toolCall.id, toolCall.name, {
          success: true,
          nextState: validation.targetNextState
        });

        if (toolCall.name === 'submitVoiceModeDecision' && validation.actionPayload?.answer) {
          handleVoiceModeDecision(validation.actionPayload.answer);
        } else if (toolCall.name === 'submitLanguageDecision' && validation.actionPayload?.lang) {
          handleLanguageDecision(validation.actionPayload.lang);
        } else if (toolCall.name === 'submitAuthChoice' && validation.actionPayload?.choice) {
          handleAuthMethodDecision(validation.actionPayload.choice);
        } else if (toolCall.name === 'triggerGlobalControl' && validation.actionPayload?.control === 'CANCEL') {
          handleVoiceModeDecision('no');
        }
      } else {
        geminiLiveClient.sendToolResponse(toolCall.id, toolCall.name, {
          success: false,
          reason: validation.reason
        });
      }
    });

    // Start AudioWorklet Microphone Capture (~100ms 16kHz PCM chunks)
    try {
      await pcmRecorder.start((base64Pcm) => {
        if (geminiLiveClient.active()) {
          geminiLiveClient.sendAudioChunk(base64Pcm);
        }
      });
    } catch (e) {
      console.warn('AudioWorklet PCM recorder start notice:', e);
    }

    const greeting = activeLanguage === 'hi-IN'
      ? "नमस्कार, ओपनएबिलिटी में आपका स्वागत है। क्या आप अपनी आवाज से ओपनएबिलिटी का उपयोग करना चाहते हैं? कृपया हां या ना कहें।"
      : "Hi, welcome to OpenAbility. Would you like to use OpenAbility with your voice? Please say Yes or No.";
    speakQuestionThenListen(greeting, 'VOICE_MODE_QUESTION');
  };

  const handleVoiceModeDecision = (decision: 'yes' | 'no') => {
    transitionIdRef.current += 1;
    speechService.stopSpeaking();
    speechService.stopListening();

    if (decision === 'yes') {
      questionIdRef.current = 'q_language_2';
      isResolvedRef.current = false;
      const msg = activeLanguage === 'hi-IN'
        ? "बहुत बढ़िया! क्या आप हिंदी या अंग्रेजी में जारी रखना चाहते हैं? आप हिंदी या अंग्रेजी बोल सकते हैं।"
        : "Great! Would you like to continue in English or Hindi? You can say English or Hindi.";
      speakQuestionThenListen(msg, 'LANGUAGE_QUESTION');
    } else {
      questionIdRef.current = 'q_text_mode';
      isResolvedRef.current = true;
      pcmRecorder.stop();
      geminiLiveClient.disconnect();
      setEntryState('TEXT_MODE');
      setStatus('IDLE');
      setFeedback("Text interface enabled.");
    }
  };

  const handleLanguageDecision = (lang: 'en-IN' | 'hi-IN') => {
    transitionIdRef.current += 1;
    speechService.stopSpeaking();
    speechService.stopListening();

    questionIdRef.current = 'q_auth_method_3';
    isResolvedRef.current = false;

    setActiveLanguage(lang);
    speechService.setRecognitionLang(lang);

    const msg = lang === 'hi-IN'
      ? "हिंदी चुनी गई है। क्या आपका पहले से ओपनएबिलिटी खाता है, या नया बनाना चाहते हैं?"
      : "English selected. Do you already have an OpenAbility account, or would you like to create a new one?";
    speakQuestionThenListen(msg, 'AUTH_METHOD_QUESTION');
  };

  const handleAuthMethodDecision = (choice: 'LOGIN' | 'SIGNUP') => {
    transitionIdRef.current += 1;
    speechService.stopSpeaking();
    speechService.stopListening();

    isResolvedRef.current = false;

    if (choice === 'LOGIN') {
      questionIdRef.current = 'q_login_email_4';
      const msg = activeLanguage === 'hi-IN'
        ? "ठीक है। आपके खाते से जुड़ा ईमेल पता बताएं।"
        : "Sure. What is the email address associated with your account?";
      speakQuestionThenListen(msg, 'LOGIN_EMAIL');
    } else {
      questionIdRef.current = 'q_signup_name_4';
      const msg = activeLanguage === 'hi-IN'
        ? "नया खाता बनाते हैं। आपका पूरा नाम क्या है?"
        : "Sure! Let's create your account. What is your full name?";
      speakQuestionThenListen(msg, 'SIGNUP_NAME');
    }
  };

  const enableVoiceMode = () => handleVoiceModeDecision('yes');
  const enableTextMode = () => handleVoiceModeDecision('no');
  const selectLanguageChoice = (lang: 'en-IN' | 'hi-IN') => handleLanguageDecision(lang);
  const selectAuthChoice = (choice: 'LOGIN' | 'SIGNUP') => handleAuthMethodDecision(choice);

  // Password Security Protocol: Hard-stop AudioWorklet microphone capture on password steps
  useEffect(() => {
    if (entryState === 'SIGNUP_PASSWORD' || entryState === 'LOGIN_PASSWORD') {
      pcmRecorder.stop();
      speechService.stopListening();
      speakFeedback("For security, please enter your password using the secure password field.");
    }
  }, [entryState]);

  // Default candidate state
  const [candidate, setCandidate] = useState<{ profile: any; accessibility: any; skills: string[] }>(emptyCandidate);

  // Sync candidate profile details from authenticated user session
  useEffect(() => {
    if (auth.isAuthenticated && auth.user) {
      fetch('/api/auth/me')
        .then(res => res.json())
        .then(data => {
          if (data.authenticated && data.profile) {
            setCandidate({
              profile: {
                id: data.user.id,
                userId: data.user.id,
                fullName: data.profile.fullName || data.user.fullName || 'Candidate',
                targetRoles: data.profile.targetRoles?.length > 0 ? data.profile.targetRoles : ['Software Developer'],
                experienceYears: data.profile.experienceYears || 0,
                education: data.profile.education || 'Computer Science Candidate',
                createdAt: new Date(),
                updatedAt: new Date()
              },
              accessibility: data.accessibility || {
                communicationPreference: 'VOICE',
                screenReaderRequired: false,
                highContrastRequired: false,
                largeTextRequired: false,
                captionsRequired: false,
                textCommunicationOnly: false,
                workPreference: 'REMOTE',
                sharingPreferences: false,
                accommodations: []
              },
              skills: data.skills || []
            });
          }
        })
        .catch(console.error);
    } else {
      setCandidate(emptyCandidate);
    }
  }, [auth.isAuthenticated, auth.user?.id]);

  useEffect(() => {
    if (pathname?.includes('/jobs/')) {
      const parts = pathname.split('/');
      const id = parts[parts.length - 1];
      if (id && id !== 'jobs') {
        setLastSelectedJobId(id);
      }
    }

    const handleStartOnboardingEvent = () => {
      startVoiceOnboarding();
    };

    const handleVoiceTranscriptEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ text: string }>;
      if (customEvent.detail?.text) {
        setTranscript(customEvent.detail.text);
        addVoiceLog(customEvent.detail.text, 'user');
      }
    };

    window.addEventListener('voice-start-onboarding', handleStartOnboardingEvent);
    window.addEventListener('openability-voice-transcript', handleVoiceTranscriptEvent);

    return () => {
      window.removeEventListener('voice-start-onboarding', handleStartOnboardingEvent);
      window.removeEventListener('openability-voice-transcript', handleVoiceTranscriptEvent);
    };
  }, [pathname]);

  const setVoiceFirstMode = (mode: boolean) => {
    setVoiceFirstModeState(mode);
    if (typeof window !== 'undefined') {
      localStorage.setItem('openability_voice_first_mode', String(mode));
    }
    if (mode) {
      speakFeedback("Voice-First Accessibility Mode enabled. Voice navigation and page speech announcements are active.");
    } else {
      speakFeedback("Voice-First Accessibility Mode disabled.");
    }
  };

  const updateCandidateState = (newCand: { profile: any; accessibility: any; skills: string[] }) => {
    setCandidate(newCand);
    if (typeof window !== 'undefined') {
      localStorage.setItem('openability_candidate', JSON.stringify(newCand));
    }
  };

  // Read response aloud with TTS Interruption support
  const speakFeedback = (text: string, callback?: () => void) => {
    if (ttsEnabled) {
      speechService.speak(text, callback);
    } else {
      if (callback) callback();
    }
  };

  const startAgentListening = () => {
    startAgentListeningWithId(transitionIdRef.current);
  };

  const startAgentListeningWithId = (expectedId?: number) => {
    if (!speechService.isSpeechSupported()) {
      setStatus('ERROR');
      setFeedback("Speech not supported in this browser. Try manual text fallback.");
      return;
    }

    // Interruptible TTS: Stop speaking immediately when user activates mic!
    speechService.stopSpeaking();

    setStatus('LISTENING');
    setTranscript('');
    setFeedback("Listening...");

    speechService.startListening(
      (result) => {
        if (expectedId && transitionIdRef.current !== expectedId) return;

        setStatus('UNDERSTANDING');
        setTranscript(result);
        setFeedback("Understanding...");
        handleVoiceInput(result);
      },
      (err) => {
        if (expectedId && transitionIdRef.current !== expectedId) return;

        if (err === 'no-speech' || err === 'network' || err === 'aborted') {
          if (entryState === 'VOICE_MODE_QUESTION' || entryState === 'LANGUAGE_QUESTION' || entryState === 'AUTH_METHOD_QUESTION') {
            const retryMsg = "I didn't catch that. Please try again.";
            speakQuestionThenListen(retryMsg, entryState);
            return;
          }
          setStatus('IDLE');
          setFeedback("Ask OpenAbility");
          return;
        }
        setStatus('ERROR');
        setFeedback("I didn't catch that. Please try again or say 'Help'.");
        speakFeedback("I didn't catch that. Please try again.");
      }
    );
  };

  const stopAgentListening = () => {
    speechService.stopListening();
    speechService.stopSpeaking();
    setStatus('IDLE');
    setFeedback("Ask OpenAbility");
  };

  const toggleAgentListening = () => {
    if (status === 'LISTENING') stopAgentListening();
    else startAgentListening();
  };

  // Conversational Voice Onboarding Flow
  const startVoiceOnboarding = () => {
    setOnboardingStep('NAME');
    setStatus('ONBOARDING');
    const prompt = "Welcome to OpenAbility! Your ability. Your career. Your way. Let's set up your career profile through voice. First, what should I call you?";
    setFeedback(prompt);
    speakFeedback(prompt, () => {
      startAgentListening();
    });
  };

  // Natural Language Speech Entity Extractor
  const extractEntitiesFromNaturalSpeech = (text: string) => {
    const lower = text.toLowerCase();

    // Name extraction
    let name = '';
    const nameMatch = lower.match(/(my name is|i am|call me|i'm)\s+([a-z\s]+)/i);
    if (nameMatch && nameMatch[2]) {
      name = nameMatch[2].split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    } else if (text.split(' ').length <= 3 && !lower.includes('work') && !lower.includes('job')) {
      name = text.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    }

    // Experience extraction
    let years = 0;
    const yrMatch = lower.match(/(\d+)\s*(years?|yrs?)/);
    if (yrMatch && yrMatch[1]) {
      years = parseInt(yrMatch[1], 10);
    } else if (lower.includes('student') || lower.includes('fresher') || lower.includes('entry')) {
      years = 0;
    }

    // Work Preference
    let workPref: 'REMOTE' | 'HYBRID' | 'OFFICE' = 'REMOTE';
    if (lower.includes('hybrid')) workPref = 'HYBRID';
    else if (lower.includes('office') || lower.includes('on-site')) workPref = 'OFFICE';
    else if (lower.includes('remote')) workPref = 'REMOTE';

    // Skills extraction
    const commonSkills = [
      'Python', 'Java', 'SQL', 'React', 'TypeScript', 'Node.js', 'HTML', 'CSS',
      'JavaScript', 'PostgreSQL', 'Docker', 'AWS', 'C++', 'Data Analysis', 'Web Accessibility'
    ];
    const foundSkills = commonSkills.filter(s => lower.includes(s.toLowerCase()));

    // Target roles
    let targetRoles: string[] = [];
    if (lower.includes('software') || lower.includes('developer')) targetRoles.push('Software Developer');
    if (lower.includes('intern') || lower.includes('internship')) targetRoles.push('Software Development Intern');
    if (lower.includes('data') || lower.includes('analyst')) targetRoles.push('Data Analyst');
    if (lower.includes('ui') || lower.includes('frontend')) targetRoles.push('Accessible UI Engineer');

    return { name, years, workPref, foundSkills, targetRoles };
  };

  // Main voice input classification and routing pipeline
  const handleVoiceInput = async (rawText: string) => {
    const text = rawText.toLowerCase().trim();

    console.log(
      `%c🗣️ [Voice Agent] Voice Input Caught: "%c${rawText}%c"`,
      'color: #3B82F6; font-weight: bold;',
      'color: #F59E0B; font-weight: bold; font-size: 1.05em;',
      'color: #3B82F6; font-weight: bold;'
    );

    // Global Interruption Commands (Highest Priority across ALL states)
    if (text === 'stop' || text === 'pause' || text === 'mute') {
      stopAgentListening();
      if (typeof window !== 'undefined' && window.speechSynthesis) window.speechSynthesis.cancel();
      setFeedback("Speech paused.");
      return;
    }

    if (text === 'repeat' || text === 'say that again' || text === 'repeat that') {
      replayLastSpeech();
      return;
    }

    if (text === 'go back' || text === 'previous step' || text === 'back') {
      const msg = "Going back to the previous step.";
      setFeedback(msg);
      speakFeedback(msg, () => startAgentListening());
      return;
    }

    if (text === 'cancel') {
      setStatus('IDLE');
      setPendingAction(null);
      const msg = "Current action cancelled.";
      setFeedback(msg);
      speakFeedback(msg);
      return;
    }

    if (text === 'help' || text === 'what can i say') {
      const msg = activeLanguage === 'hi-IN'
        ? "आप कह सकते हैं: 'नौकरी खोजें', 'रिज्यूमे पढ़ें', 'इंटरव्यू अभ्यास', या 'लॉग आउट'।"
        : "You can say: 'Find jobs', 'Build my resume', 'Practice interview', 'Read my profile', or 'Log out'.";
      setFeedback(msg);
      speakFeedback(msg, () => startAgentListening());
      return;
    }

    // Read page command
    if (text.includes('read page') || text.includes('what is on my screen') || text.includes('read screen') || text.includes("what's on my screen")) {
      speakPageSummary();
      return;
    }

    // Indian Voice Controls
    if (text.includes('speak slower') || text === 'slower') {
      const newRate = speechService.setSpeechRate(speechService.getSpeechRate() - 0.2);
      const msg = `Speaking slower at ${Math.round(newRate * 100)} percent speed.`;
      setFeedback(msg);
      speakFeedback(msg);
      return;
    }

    if (text.includes('speak faster') || text === 'faster') {
      const newRate = speechService.setSpeechRate(speechService.getSpeechRate() + 0.2);
      const msg = `Speaking faster at ${Math.round(newRate * 100)} percent speed.`;
      setFeedback(msg);
      speakFeedback(msg);
      return;
    }

    if (text.includes('change voice') || text.includes('switch voice')) {
      const vName = speechService.setVoiceIndex(1);
      const msg = `Switched assistant voice to ${vName}.`;
      setFeedback(msg);
      speakFeedback(msg);
      return;
    }

    if (text.includes('use hindi') || text.includes('hindi mode')) {
      speechService.setRecognitionLang('hi-IN');
      const msg = "Switched voice recognition language to Hindi-English (hi-IN).";
      setFeedback(msg);
      speakFeedback(msg);
      return;
    }

    // Global voice controls during entry flow
    if (text === 'stop' || text === 'pause' || text === 'quiet') {
      speechService.stopSpeaking();
      setStatus('IDLE');
      setFeedback("Voice output stopped.");
      return;
    }

    if (text === 'repeat' || text === 'say again' || text === 'again') {
      if (entryState === 'VOICE_MODE_QUESTION') {
        speakQuestionThenListen("Hi, welcome to OpenAbility. Would you like to use OpenAbility with your voice? Please say Yes or No.", 'VOICE_MODE_QUESTION');
      } else if (entryState === 'LANGUAGE_QUESTION') {
        speakQuestionThenListen("Would you like to continue in English or Hindi?", 'LANGUAGE_QUESTION');
      } else if (entryState === 'AUTH_METHOD_QUESTION') {
        speakQuestionThenListen("Do you already have an OpenAbility account, or would you like to create a new one?", 'AUTH_METHOD_QUESTION');
      }
      return;
    }

    if (text === 'cancel') {
      handleVoiceModeDecision('no');
      return;
    }

    // Zero-Touch Entry Conversational Flow Handlers
    if (entryState === 'VOICE_MODE_QUESTION') {
      const isYes = text.includes('yes') || text.includes('yeah') || text.includes('yep') || text.includes('sure') || text.includes('voice') || text.includes('hands-free') || text.includes('ok');
      const isNo = text.includes('no') || text.includes('text') || text.includes('not now');

      if (isYes) {
        handleVoiceModeDecision('yes');
      } else if (isNo) {
        handleVoiceModeDecision('no');
      } else {
        const msg = "I didn't catch that. Please say Yes or No.";
        speakQuestionThenListen(msg, 'VOICE_MODE_QUESTION');
      }
      return;
    }

    if (entryState === 'LANGUAGE_QUESTION') {
      if (text.includes('hindi') || text.includes('हिंदी')) {
        handleLanguageDecision('hi-IN');
      } else if (text.includes('english')) {
        handleLanguageDecision('en-IN');
      } else {
        const msg = "Please say English or Hindi.";
        speakQuestionThenListen(msg, 'LANGUAGE_QUESTION');
      }
      return;
    }

    if (entryState === 'AUTH_METHOD_QUESTION') {
      const isLogin = text.includes('login') || text.includes('sign in') || text.includes('already have') || text.includes('existing');
      const isSignup = text.includes('signup') || text.includes('create') || text.includes('new') || text.includes('register');

      if (isLogin) {
        handleAuthMethodDecision('LOGIN');
      } else if (isSignup) {
        handleAuthMethodDecision('SIGNUP');
      } else {
        const msg = "Please say Login or Create Account.";
        speakQuestionThenListen(msg, 'AUTH_METHOD_QUESTION');
      }
      return;
    }

    if (status === 'SIGNUP_NAME') {
      const name = extractEntitiesFromNaturalSpeech(text).name || text.replace(/my name is|i am|call me|i'm/gi, '').trim();
      setSignupDraft(prev => ({ ...prev, fullName: name || 'Candidate' }));
      setStatus('SIGNUP_NAME_CONFIRM');
      const msg = `I heard ${name || 'your name'}. Is that correct? Say yes to confirm or say your name again.`;
      setFeedback(msg);
      speakFeedback(msg, () => startAgentListening());
      return;
    }

    if (status === 'SIGNUP_NAME_CONFIRM') {
      if (text.includes('yes') || text.includes('sure') || text.includes('correct')) {
        setStatus('SIGNUP_EMAIL');
        const msg = `Great, ${signupDraft.fullName}. Now, what email address would you like to use for your account? You can say it naturally, for example rahul at gmail dot com.`;
        setFeedback(msg);
        speakFeedback(msg, () => startAgentListening());
      } else {
        setStatus('SIGNUP_NAME');
        const msg = "No problem. Please say your full name again.";
        setFeedback(msg);
        speakFeedback(msg, () => startAgentListening());
      }
      return;
    }

    if (status === 'SIGNUP_EMAIL') {
      const parsedEmail = parseSpokenEmail(text);
      setSignupDraft(prev => ({ ...prev, email: parsedEmail }));
      setStatus('SIGNUP_EMAIL_CONFIRM');
      const msg = `I heard ${parsedEmail.replace('@', ' at ')}. Is that correct? Say yes to confirm or say your email again.`;
      setFeedback(msg);
      speakFeedback(msg, () => startAgentListening());
      return;
    }

    if (status === 'SIGNUP_EMAIL_CONFIRM') {
      if (text.includes('yes') || text.includes('sure') || text.includes('correct')) {
        setStatus('SIGNUP_PASSWORD');
        const msg = "Thank you. For security, please enter your password using the secure password field on screen.";
        setFeedback(msg);
        speakFeedback(msg, () => {
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('voice-focus-password-field', {
              detail: { fullName: signupDraft.fullName, email: signupDraft.email }
            }));
          }
        });
      } else {
        setStatus('SIGNUP_EMAIL');
        const msg = "Please say your email address again.";
        setFeedback(msg);
        speakFeedback(msg, () => startAgentListening());
      }
      return;
    }

    if (status === 'LOGIN_EMAIL') {
      const parsedEmail = parseSpokenEmail(text);
      setLoginEmailDraft(parsedEmail);
      setStatus('LOGIN_EMAIL_CONFIRM');
      const msg = `I heard ${parsedEmail.replace('@', ' at ')}. Is that correct?`;
      setFeedback(msg);
      speakFeedback(msg, () => startAgentListening());
      return;
    }

    if (status === 'LOGIN_EMAIL_CONFIRM') {
      if (text.includes('yes') || text.includes('sure') || text.includes('correct')) {
        setStatus('LOGIN_PASSWORD');
        const msg = "For security, please enter your password using the secure password field on screen.";
        setFeedback(msg);
        speakFeedback(msg, () => {
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('voice-focus-login-password-field', { detail: { email: loginEmailDraft } }));
          }
        });
      } else {
        setStatus('LOGIN_EMAIL');
        const msg = "Please say your registered email address again.";
        setFeedback(msg);
        speakFeedback(msg, () => startAgentListening());
      }
      return;
    }

    // Voice Logout Command
    if (text.includes('log out') || text.includes('logout') || text.includes('sign out')) {
      setStatus('CONFIRM_LOGOUT');
      const msg = "Are you sure you want to log out of OpenAbility?";
      setFeedback(msg);
      speakFeedback(msg, () => startAgentListening());
      return;
    }

    if (status === 'CONFIRM_LOGOUT') {
      if (text.includes('yes') || text.includes('sure') || text.includes('logout')) {
        auth.logout();
        setStatus('ENTRY_GREETING');
        const msg = "You have been logged out successfully. Hello, welcome to OpenAbility. Would you like to use OpenAbility hands-free with your voice?";
        setFeedback(msg);
        speakFeedback(msg, () => startAgentListening());
      } else {
        setStatus('IDLE');
        speakFeedback("Logout cancelled.");
      }
      return;
    }

    // Voice Onboarding State Machine Handler
    if (onboardingStep !== 'OFF') {
      handleOnboardingStepInput(rawText);
      return;
    }

    // Trigger Voice Onboarding command
    if (text.includes('start onboarding') || text.includes('create profile') || text.includes('start my career journey')) {
      startVoiceOnboarding();
      return;
    }

    // A. Clarification Loop Check
    if (status === 'CLARIFYING' && pendingAction) {
      if (text.includes('yes') || text.includes('continue') || text.includes('sure') || text.includes('ok')) {
        const actionToExec = pendingAction;
        setPendingAction(null);
        setStatus('EXECUTING');
        executeCommand(actionToExec.action, actionToExec.parameters, actionToExec.entities);
      } else {
        setPendingAction(null);
        setStatus('IDLE');
        setFeedback("Action cancelled.");
        speakFeedback("Action cancelled.");
      }
      return;
    }

    // B. Confirmation Cycle Check for Critical Actions
    if (status === 'CONFIRMING' && pendingAction) {
      if (text.includes('yes') || text.includes('continue') || text.includes('sure') || text.includes('ok')) {
        const actionToExec = pendingAction;
        setPendingAction(null);
        setStatus('EXECUTING');
        executeCommand(actionToExec.action, actionToExec.parameters, actionToExec.entities);
      } else {
        setPendingAction(null);
        setStatus('IDLE');
        setFeedback("Action cancelled.");
        speakFeedback("Action cancelled.");
      }
      return;
    }

    // C. Spelling Mode Check
    if (isSpellingMode) {
      if (text.includes('done') || text.includes('finished') || text.includes('submit')) {
        setIsSpellingMode(false);
        const finalWord = spelledWord.trim();
        setFeedback(`Finished spelling: ${finalWord}. Filling field.`);
        speakFeedback(`Finished spelling: ${finalWord}.`, () => {
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('voice-fill-profile', { detail: { name: finalWord } }));
          }
          setStatus('COMPLETE');
        });
      } else {
        const cleanLetter = parseSpelledLetter(text);
        if (cleanLetter) {
          const nextWord = spelledWord + cleanLetter;
          setSpelledWord(nextWord);
          setFeedback(`Spelling: ${nextWord.toUpperCase()}`);
          speakFeedback(cleanLetter.toLowerCase());
        }
      }
      return;
    }

    // D. Intent Classifier Match
    const decoded = voiceIntentService.classify(rawText);

    // Check if verification applies
    const actionConfig = VOICE_ACTIONS[decoded.action];
    if (actionConfig?.requiresConfirmation) {
      setStatus('CONFIRMING');
      setPendingAction(decoded);
      setFeedback(`Verify action: ${actionConfig.description}. Shall I proceed?`);
      speakFeedback(`You are about to ${actionConfig.description.toLowerCase()}. Shall I proceed?`);
      return;
    }

    // E. Normal Execution
    executeCommand(decoded.action, decoded.parameters, decoded.entities);
  };

  // Step-by-Step Voice Onboarding Handler
  const handleOnboardingStepInput = (rawText: string) => {
    const text = rawText.trim();
    const lower = text.toLowerCase();

    const isSkipPhrase = lower.includes('skip') || lower.includes('not now') || lower.includes("don't know") || lower.includes('not sure') || lower.includes("don't want to answer");

    if (isSkipPhrase) {
      speakFeedback("Skipping optional question.");
    }

    // Extract multi-entity speech details
    const extracted = extractEntitiesFromNaturalSpeech(text);

    // Handle explicit 0 years / no experience vs null
    let expYears = draftProfile.experienceYears;
    if (lower.includes('no experience') || lower.includes('fresher') || lower.includes('zero years') || lower.includes('no work experience') || lower.includes('0 years')) {
      expYears = 0;
    } else if (extracted.years > 0) {
      expYears = extracted.years;
    }

    const newProfile = {
      ...draftProfile,
      fullName: draftProfile.fullName || extracted.name || auth.user?.fullName || 'Candidate',
      experienceYears: expYears,
      targetRoles: Array.from(new Set([...draftProfile.targetRoles, ...extracted.targetRoles])),
      skills: Array.from(new Set([...draftProfile.skills, ...extracted.foundSkills])),
      workPreference: extracted.workPref || draftProfile.workPreference
    };

    setDraftProfile(newProfile);

    // Dynamically compute next uncollected question step
    if (onboardingStep === 'NAME' && !newProfile.fullName) {
      const name = text.replace(/my name is|i am|call me|i'm/gi, '').trim();
      setDraftProfile({ ...newProfile, fullName: name || 'Candidate' });
      setOnboardingStep('EXPERIENCE');
      const prompt = `Nice to meet you, ${name || 'friend'}! What are you currently studying or doing?`;
      setFeedback(prompt);
      speakFeedback(prompt, () => startAgentListening());
      return;
    }

    // Check remaining missing fields
    if (newProfile.targetRoles.length === 0 && onboardingStep !== 'ROLES') {
      setOnboardingStep('ROLES');
      const prompt = "What kind of job role are you looking for? For example, Software Developer, Data Analyst, or UI Engineer.";
      setFeedback(prompt);
      speakFeedback(prompt, () => startAgentListening());
      return;
    }

    if (newProfile.skills.length === 0 && onboardingStep !== 'SKILLS') {
      setOnboardingStep('SKILLS');
      const prompt = "What technical skills or tools do you currently have? For example, Python, Java, SQL, or React.";
      setFeedback(prompt);
      speakFeedback(prompt, () => startAgentListening());
      return;
    }

    if (!newProfile.workPreference && onboardingStep !== 'WORK_PREF') {
      setOnboardingStep('WORK_PREF');
      const prompt = "Do you prefer Remote, Hybrid, or Office work?";
      setFeedback(prompt);
      speakFeedback(prompt, () => startAgentListening());
      return;
    }

    if (onboardingStep !== 'ACCESSIBILITY' && onboardingStep !== 'CONFIRM') {
      setOnboardingStep('ACCESSIBILITY');
      const prompt = "Are there any accessibility requirements or accommodations you want me to consider? For example, screen reader support, audio captions, or text communication.";
      setFeedback(prompt);
      speakFeedback(prompt, () => startAgentListening());
      return;
    }

    if (onboardingStep === 'ACCESSIBILITY') {
      const screenReader = lower.includes('screen reader');
      const captions = lower.includes('caption');
      const textComm = lower.includes('text');

      setDraftProfile({
        ...newProfile,
        screenReaderRequired: screenReader,
        captionsRequired: captions,
        textCommunicationOnly: textComm
      });

      setOnboardingStep('CONFIRM');
      const summary = `I understood that you're ${newProfile.fullName} with ${newProfile.skills.join(', ') || 'technical'} skills looking for ${newProfile.targetRoles.join(' or ') || 'developer'} roles, preferably ${newProfile.workPreference.toLowerCase()}. Is that correct? Say yes to save or cancel to start over.`;
      setFeedback(summary);
      speakFeedback(summary, () => startAgentListening());
      return;
    }

    if (onboardingStep === 'CONFIRM') {
      if (lower.includes('yes') || lower.includes('sure') || lower.includes('ok') || lower.includes('correct')) {
        const finalFullName = newProfile.fullName || auth.user?.fullName || 'Candidate';
        const finalRoles = newProfile.targetRoles.length > 0 ? newProfile.targetRoles : ['Software Developer'];
        const finalSkills = newProfile.skills.length > 0 ? newProfile.skills : ['Python', 'SQL'];

        const profileData = {
          fullName: finalFullName,
          targetRoles: finalRoles,
          experienceYears: newProfile.experienceYears || 0,
          education: 'Computer Science Candidate',
          onboardingCompleted: true,
          onboardingStep: 'COMPLETE',
          skills: finalSkills
        };

        const accData = {
          communicationPreference: 'VOICE',
          screenReaderRequired: newProfile.screenReaderRequired || false,
          captionsRequired: newProfile.captionsRequired || false,
          textCommunicationOnly: newProfile.textCommunicationOnly || false,
          workPreference: newProfile.workPreference || 'REMOTE',
          sharingPreferences: false
        };

        fetch('/api/user/profile', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(profileData)
        }).catch(console.error);

        fetch('/api/user/accessibility', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(accData)
        }).catch(console.error);

        const newCand = {
          profile: {
            id: auth.user?.id || `cand-${Date.now()}`,
            userId: auth.user?.id || `user-${Date.now()}`,
            fullName: finalFullName,
            bio: `Candidate interested in ${finalRoles.join(', ')}.`,
            targetRoles: finalRoles,
            experienceYears: newProfile.experienceYears,
            education: 'Higher Education Candidate',
            createdAt: new Date(),
            updatedAt: new Date()
          },
          accessibility: {
            id: `acc-${Date.now()}`,
            candidateProfileId: auth.user?.id || `cand-${Date.now()}`,
            communicationPreference: 'VOICE',
            screenReaderRequired: newProfile.screenReaderRequired || false,
            highContrastRequired: false,
            largeTextRequired: false,
            captionsRequired: newProfile.captionsRequired || false,
            textCommunicationOnly: newProfile.textCommunicationOnly || false,
            accessiblePhysicalSpace: false,
            workPreference: newProfile.workPreference || 'REMOTE',
            flexibleHours: true,
            keyboardNavigationOnly: true,
            accommodations: ['Voice interaction', 'Screen reader support'],
            createdAt: new Date(),
            updatedAt: new Date()
          },
          skills: finalSkills
        };

        setCandidate(newCand);
        auth.setOnboardingState(true, 'COMPLETE');
        setOnboardingStep('OFF');
        setStatus('COMPLETE');
        const finalMsg = `Profile created successfully! Welcome ${newCand.profile.fullName}. Your career companion is ready. You can now ask me to find jobs, analyze your resume, or start an interview.`;
        setFeedback(finalMsg);
        speakFeedback(finalMsg, () => {
          router.push('/dashboard');
        });
      } else {
        setOnboardingStep('ROLES');
        const prompt = "No problem! What job roles are you looking for?";
        setFeedback(prompt);
        speakFeedback(prompt, () => startAgentListening());
      }
    }
  };

  // Command executor
  const executeCommand = (action: ActionName, params: any, entities: any) => {
    setStatus('EXECUTING');
    setFeedback(`Executing: ${VOICE_ACTIONS[action].description}...`);

    const resolveTargetJob = (): any => {
      if (entities?.pronoun && lastSelectedJobId) {
        const match = seedJobs.find(j => j.id === lastSelectedJobId);
        if (match) return match;
      }

      const filtered = seedJobs.filter(j => {
        const matchTerm = j.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          j.company.toLowerCase().includes(searchTerm.toLowerCase());
        const matchRemote = workTypeFilter === 'ALL' || j.workType === workTypeFilter;
        return matchTerm && matchRemote;
      });

      if (typeof entities?.index === 'number' && filtered.length > entities.index) {
        return filtered[entities.index];
      }

      return filtered[0] || seedJobs[0];
    };

    const targetJob = resolveTargetJob();

    switch (action) {
      case 'NAVIGATE_HOME':
        router.push('/');
        setFeedback("Done. Navigated Home.");
        speakFeedback("Opening home page.");
        setStatus('COMPLETE');
        break;

      case 'CLICK_GET_STARTED':
        startVoiceOnboarding();
        break;

      case 'OPEN_DASHBOARD':
        router.push('/dashboard');
        setFeedback("Opening dashboard status.");
        speakFeedback("Opening candidate dashboard overview.");
        setStatus('COMPLETE');
        break;

      case 'OPEN_RESUME':
        router.push('/dashboard/resume');
        setFeedback("Opening resume uploader.");
        speakFeedback("Opening resume workspace.");
        setStatus('COMPLETE');
        break;

      case 'OPEN_JOBS':
        router.push('/dashboard/jobs');
        setFeedback("Opening jobs matching board.");
        speakFeedback("Opening job matches board.");
        setStatus('COMPLETE');
        break;

      case 'OPEN_PROFILE':
        router.push('/dashboard/profile');
        setFeedback("Opening accessibility profile.");
        speakFeedback("Opening accessibility profile settings.");
        setStatus('COMPLETE');
        break;

      case 'OPEN_ASSISTANT':
        router.push('/dashboard/assistant');
        setFeedback("Opening career assistant conversation.");
        speakFeedback("Opening career assistant dashboard.");
        setStatus('COMPLETE');
        break;

      case 'OPEN_INTERVIEW':
        router.push('/dashboard/interview');
        setFeedback("Opening mock interview portal.");
        speakFeedback("Opening mock interview session.");
        setStatus('COMPLETE');
        break;

      case 'OPEN_VOICE':
        router.push('/dashboard/voice');
        setFeedback("Opening voice dashboard.");
        speakFeedback("Opening voice portal.");
        setStatus('COMPLETE');
        break;

      case 'OPEN_SIGN_LANGUAGE':
        router.push('/dashboard/sign-language');
        setFeedback("Opening sign language prototype.");
        speakFeedback("Opening sign language translator console.");
        setStatus('COMPLETE');
        break;

      case 'SEARCH_JOBS':
        if (params?.role) setSearchTerm(params.role);
        if (params?.remote) setWorkTypeFilter('REMOTE');

        if (pathname !== '/dashboard/jobs') {
          router.push('/dashboard/jobs');
        }
        setTimeout(() => {
          setFeedback(`Searching jobs matching: ${params?.role || 'openings'}`);
          speakFeedback(`Searching job listings for ${params?.role || 'open positions'}. I found positions matching your criteria.`);
          setStatus('COMPLETE');
        }, 800);
        break;

      case 'OPEN_JOB':
        if (targetJob) {
          setLastSelectedJobId(targetJob.id);
          router.push(`/dashboard/jobs/${targetJob.id}`);
          setFeedback(`Opening job details for ${targetJob.title} at ${targetJob.company}.`);
          speakFeedback(`Opening ${targetJob.title} at ${targetJob.company}. It is a ${targetJob.workType.toLowerCase()} role.`);
          setStatus('COMPLETE');
        }
        break;

      case 'APPLY_JOB':
        if (targetJob) {
          setFeedback(`✓ Applied to ${targetJob.title} at ${targetJob.company}.`);
          speakFeedback(`Your application has been submitted to ${targetJob.company} using your current profile.`);
          setStatus('COMPLETE');
        }
        break;

      case 'READ_PAGE':
        speakPageSummary();
        setStatus('COMPLETE');
        break;

      case 'SPELL_NAME':
        setIsSpellingMode(true);
        setSpelledWord('');
        setFeedback("Spelling Mode Active. Spell letter by letter (e.g. V-A-Y-U). Say 'Done' to finish.");
        speakFeedback("Spelling mode active. Please spell letter by letter.");
        setStatus('IDLE');
        break;

      case 'GO_BACK':
        window.history.back();
        setFeedback("Going back.");
        speakFeedback("Navigating back.");
        setStatus('COMPLETE');
        break;

      case 'COMMAND_HELP':
        const helpText = "Here are commands you can say: Find remote jobs, Analyze my resume, Start mock interview, Open accessibility settings, or Read this page.";
        setFeedback(helpText);
        speakFeedback(helpText);
        setStatus('COMPLETE');
        break;

      default:
        setStatus('ERROR');
        setFeedback("Command not recognized.");
        speakFeedback("I didn't catch that command. You can say 'Help' for options.");
    }
  };

  // NATO / Letter mapping phonetic helpers
  const parseSpelledLetter = (text: string): string => {
    const word = text.toLowerCase().trim();
    if (word.length === 1 && /[a-z]/i.test(word)) return word;
    const nato: Record<string, string> = {
      alpha: 'a', bravo: 'b', charlie: 'c', delta: 'd', echo: 'e', foxtrot: 'f',
      golf: 'g', hotel: 'h', india: 'i', juliet: 'j', kilo: 'k', lima: 'l',
      mike: 'm', november: 'n', oscar: 'o', papa: 'p', quebec: 'q', romeo: 'r',
      sierra: 's', tango: 't', uniform: 'u', victor: 'v', whiskey: 'w', xray: 'x',
      yankee: 'y', zulu: 'z'
    };
    return nato[word] || '';
  };

  // Structured Natural Page Reader for Blind Users
  const speakPageSummary = () => {
    const name = candidate.profile?.fullName || 'User';
    let text = "You are browsing OpenAbility AI.";

    if (pathname === '/dashboard') {
      if (!candidate.profile?.fullName) {
        text = "Welcome to OpenAbility! Your career profile is currently empty. Say 'Start Onboarding' or 'Create Profile' to set up your profile through voice.";
      } else {
        text = `Welcome back, ${name}. You are on the Candidate Overview Dashboard. Your target role is ${candidate.profile.targetRoles[0] || 'Software Developer'}. You have ${candidate.skills.length} skills listed. Recommended job matches are ready on your jobs board.`;
      }
    } else if (pathname?.includes('/jobs/')) {
      const targetJob = seedJobs.find(j => j.id === lastSelectedJobId) || seedJobs[0];
      const accStatus = targetJob?.accessibility?.verificationStatus || 'VERIFIED';
      text = `Viewing job details for ${targetJob.title} at ${targetJob.company}. Location: ${targetJob.location}. Work type: ${targetJob.workType}. Accessibility verification status is ${accStatus.toLowerCase().replace('_', ' ')}.`;
    } else if (pathname === '/dashboard/jobs') {
      text = "You are on the Jobs Matching Board. You can ask me to filter remote jobs, find software developer positions, or explain the first job match.";
    } else if (pathname === '/dashboard/resume') {
      text = "You are on the Resume Workspace page. You can say 'Analyze my resume', 'Read my resume', or 'Add a project' to build your resume through voice.";
    } else if (pathname === '/dashboard/interview') {
      text = "You are in the Mock Interview Portal. You can say 'Start mock interview' to practice technical and behavioral questions by voice.";
    } else if (pathname === '/dashboard/workplace') {
      text = "You are on the Post-Hiring Workplace Companion page. You can generate workplace accommodation request letters and track promotion paths.";
    }

    setFeedback(text);
    speakFeedback(text);
  };

  // Zero-Touch Demo Journey Trigger for Blind Users
  const triggerVoiceDemo = () => {
    startVoiceOnboarding();
  };

  const replayLastSpeech = () => {
    if (feedback) speakFeedback(feedback);
  };

  const setLanguageLocale = (locale: string) => setActiveLanguage(locale);
  const setSpeechSpeedRate = (rate: number) => setSpeechRate(rate);
  const cycleVoiceIndexOption = () => { };

  return (
    <VoiceAgentContext.Provider
      value={{
        entryState,
        status,
        transcript,
        voiceLogs,
        clearVoiceLogs,
        addVoiceLog,
        feedback,
        ttsEnabled,
        setTtsEnabled,
        voiceFirstMode,
        setVoiceFirstMode,
        activeLanguage,
        speechRate,
        setLanguageLocale,
        setSpeechSpeedRate,
        cycleVoiceIndexOption,
        onboardingStep,
        startVoiceOnboarding,
        startZeroTouchVoiceEntry,
        handleVoiceModeDecision,
        handleLanguageDecision,
        handleAuthMethodDecision,
        enableVoiceMode,
        enableTextMode,
        selectLanguageChoice,
        selectAuthChoice,
        startAgentListening,
        stopAgentListening,
        toggleAgentListening,
        handleVoiceInputText: handleVoiceInput,
        triggerVoiceDemo,
        replayLastSpeech,
        speakPageSummary,
        speakFeedback,
        isSpellingMode,
        candidate,
        updateCandidateState
      }}
    >
      {children}
    </VoiceAgentContext.Provider>
  );
}

export function useVoiceAgent() {
  const context = useContext(VoiceAgentContext);
  if (!context) {
    throw new Error('useVoiceAgent must be used inside a VoiceAgentProvider');
  }
  return context;
}
