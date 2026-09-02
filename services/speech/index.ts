export interface SpeechService {
  speak(text: string, onEnd?: () => void): void;
  stopSpeaking(): void;
  startListening(onResult: (text: string) => void, onError?: (err: any) => void): void;
  stopListening(): void;
  isSpeechSupported(): boolean;
  setSpeechRate(rate: number): number;
  getSpeechRate(): number;
  setVoiceIndex(index: number): string;
  getAvailableIndianVoices(): SpeechSynthesisVoice[];
  setRecognitionLang(lang: string): void;
}

export class WebSpeechService implements SpeechService {
  private synth: SpeechSynthesis | null = null;
  private recognition: any = null;
  private selectedVoice: SpeechSynthesisVoice | null = null;
  private speechRate: number = 0.95; // Friendly, clear, human-like speaking cadence
  private selectedVoiceIndex: number = 0;

  constructor() {
    if (typeof window !== 'undefined') {
      this.synth = window.speechSynthesis;
      
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        this.recognition = new SpeechRecognition();
        this.recognition.continuous = false;
        this.recognition.interimResults = false;
        this.recognition.lang = 'en-IN'; // Default Indian English recognition
      }

      if (this.synth) {
        this.loadVoices();
        if (typeof this.synth.onvoiceschanged !== 'undefined') {
          this.synth.onvoiceschanged = () => this.loadVoices();
        }
      }
    }
  }

  private loadVoices() {
    if (!this.synth) return;
    const voices = this.synth.getVoices();
    const indianVoices = voices.filter(v => v.lang.includes('en-IN') || v.lang.includes('en_IN') || v.lang.includes('hi-IN'));

    if (indianVoices.length > 0) {
      this.selectedVoice = indianVoices[this.selectedVoiceIndex % indianVoices.length];
    } else {
      // Fallback to en-GB / en-US if en-IN is loading or not present in browser
      const fallbackVoice = voices.find(v => v.lang.includes('en-GB') || v.lang.includes('en-US'));
      if (fallbackVoice) this.selectedVoice = fallbackVoice;
    }
  }

  getAvailableIndianVoices(): SpeechSynthesisVoice[] {
    if (!this.synth) return [];
    const voices = this.synth.getVoices();
    const indian = voices.filter(v => v.lang.includes('en-IN') || v.lang.includes('en_IN') || v.lang.includes('hi-IN'));
    return indian.length > 0 ? indian : voices.filter(v => v.lang.startsWith('en'));
  }

  setSpeechRate(rate: number): number {
    this.speechRate = Math.max(0.5, Math.min(2.0, rate));
    return this.speechRate;
  }

  getSpeechRate(): number {
    return this.speechRate;
  }

  setVoiceIndex(index: number): string {
    const voices = this.getAvailableIndianVoices();
    if (voices.length > 0) {
      this.selectedVoiceIndex = index % voices.length;
      this.selectedVoice = voices[this.selectedVoiceIndex];
      return this.selectedVoice.name;
    }
    return 'Default Voice';
  }

  setRecognitionLang(lang: string): void {
    if (this.recognition) {
      this.recognition.lang = lang;
    }
  }

  isSpeechSupported(): boolean {
    return !!this.synth && !!this.recognition;
  }

  private isListening = false;

  speak(text: string, onEnd?: () => void): void {
    if (!this.synth) {
      if (onEnd) onEnd();
      return;
    }

    this.stopSpeaking();

    // Ensure voices are loaded
    if (!this.selectedVoice) {
      this.loadVoices();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    if (this.selectedVoice) {
      utterance.voice = this.selectedVoice;
      utterance.lang = this.selectedVoice.lang;
    } else {
      utterance.lang = 'en-IN';
    }

    utterance.rate = this.speechRate;
    utterance.pitch = 1.0;

    if (onEnd) {
      utterance.onend = () => {
        onEnd();
      };
      utterance.onerror = () => {
        onEnd();
      };
    }

    this.synth.speak(utterance);
  }

  stopSpeaking(): void {
    if (this.synth) {
      this.synth.cancel();
    }
  }

  startListening(onResult: (text: string) => void, onError?: (err: any) => void): void {
    if (!this.recognition) {
      console.warn('⚠️ [WebSpeech] Speech recognition not supported in this browser.');
      if (onError) onError('Speech recognition not supported in this browser.');
      return;
    }

    if (this.isListening) {
      // Recognition is already running, skip redundant start call
      return;
    }

    this.recognition.onspeechstart = () => {
      console.log('%c🗣️ [WebSpeech] Voice detected! Listening to microphone...', 'color: #3B82F6; font-weight: bold;');
    };

    this.recognition.onspeechend = () => {
      console.log('%c🤫 [WebSpeech] Voice pause detected. Processing transcript...', 'color: #8B5CF6; font-weight: bold;');
    };

    this.recognition.onresult = (event: any) => {
      this.isListening = false;
      const text = event.results[0][0].transcript;
      const confidence = event.results[0][0].confidence;
      console.log(
        `%c✅ [WebSpeech] Voice Caught! Transcript: "%c${text}%c" (Confidence: ${(confidence ? confidence * 100 : 100).toFixed(1)}%)`,
        'color: #10B981; font-weight: bold;',
        'color: #F59E0B; font-weight: bold; text-decoration: underline;',
        'color: #10B981; font-weight: bold;'
      );

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('openability-voice-transcript', {
          detail: { text, confidence: confidence || 1.0, timestamp: new Date().toLocaleTimeString() }
        }));
      }

      onResult(text);
    };

    this.recognition.onerror = (event: any) => {
      this.isListening = false;
      const errName = event.error || event;
      console.log(`%c⚠️ [WebSpeech] Recognition Event: ${errName}`, 'color: #EF4444;');
      if (errName === 'no-speech' || errName === 'aborted' || errName === 'network') {
        return; // Ignore benign errors gracefully
      }
      if (onError) onError(errName);
    };

    this.recognition.onend = () => {
      this.isListening = false;
    };

    try {
      this.isListening = true;
      console.log('%c🎤 [WebSpeech] Microphone open & listening for your voice...', 'color: #06B6D4; font-weight: bold;');
      this.recognition.start();
    } catch (e: any) {
      this.isListening = false;
      if (e?.name === 'InvalidStateError' || e?.message?.includes('already started')) {
        // Recognition is already started, ignore gracefully
        return;
      }
      if (onError) onError(e);
    }
  }

  stopListening(): void {
    this.isListening = false;
    if (this.recognition) {
      try {
        this.recognition.stop();
      } catch (e) {
        // ignore errors if not running
      }
    }
  }
}

export const speechService = new WebSpeechService();
