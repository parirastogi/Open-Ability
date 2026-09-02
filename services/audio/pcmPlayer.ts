export class PCMPlayer {
  private audioContext: AudioContext | null = null;
  private workletNode: AudioWorkletNode | null = null;
  private gainNode: GainNode | null = null;
  private isInitialized = false;
  private sampleRate = 24000; // Gemini Live outputs PCM at 24kHz

  public async init(): Promise<void> {
    if (this.isInitialized) return;

    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: this.sampleRate,
      });

      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      await this.audioContext.audioWorklet.addModule('/audio-worklet/playback.worklet.js');

      this.workletNode = new AudioWorkletNode(this.audioContext, 'pcm-processor');
      this.gainNode = this.audioContext.createGain();
      this.gainNode.gain.value = 1.0;

      this.workletNode.connect(this.gainNode);
      this.gainNode.connect(this.audioContext.destination);

      this.isInitialized = true;
      console.log('🔊 PCM Audio Player initialized (24kHz Gemini output)');
    } catch (err) {
      console.error('Failed to initialize PCM Audio Player:', err);
    }
  }

  public async play(base64Audio: string): Promise<void> {
    if (!this.isInitialized) {
      await this.init();
    }

    try {
      if (this.audioContext && this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      const binaryString = atob(base64Audio);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const inputArray = new Int16Array(bytes.buffer);
      const float32Data = new Float32Array(inputArray.length);
      for (let i = 0; i < inputArray.length; i++) {
        float32Data[i] = inputArray[i] / 32768;
      }

      if (this.workletNode) {
        this.workletNode.port.postMessage(float32Data);
      }
    } catch (err) {
      console.error('Error playing Gemini audio chunk:', err);
    }
  }

  public interrupt(): void {
    if (this.workletNode) {
      this.workletNode.port.postMessage('interrupt');
      console.log('⚡ PCM Player interrupted playback for barge-in');
    }
  }

  public stop(): void {
    this.interrupt();
    if (this.audioContext && this.audioContext.state === 'running') {
      this.audioContext.suspend();
    }
  }
}

export const pcmPlayer = new PCMPlayer();
