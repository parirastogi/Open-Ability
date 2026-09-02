export type AudioChunkCallback = (base64Audio: string) => void;

export class PCMRecorder {
  private audioContext: AudioContext | null = null;
  private audioWorklet: AudioWorkletNode | null = null;
  private mediaStream: MediaStream | null = null;
  private audioSource: MediaStreamAudioSourceNode | null = null;
  private isStreaming = false;
  private targetSampleRate = 16000;
  private pendingPcmBuffer: number[] = [];
  private targetChunkSamples = 1600; // ~100ms at 16kHz

  public async start(onAudioChunk: AudioChunkCallback): Promise<boolean> {
    if (this.isStreaming) return true;

    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: this.targetSampleRate,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        }
      });

      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: this.targetSampleRate,
      });

      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      await this.audioContext.audioWorklet.addModule('/audio-worklet/capture.worklet.js');

      this.audioWorklet = new AudioWorkletNode(
        this.audioContext,
        'audio-capture-processor'
      );

      let currentPeak = 0;
      let chunkCount = 0;

      this.audioWorklet.port.onmessage = (event) => {
        if (!this.isStreaming) return;

        if (event.data.type === 'audio') {
          const inputData: Float32Array = event.data.data;
          
          // Convert Float32 to Int16 PCM and measure peak amplitude
          for (let i = 0; i < inputData.length; i++) {
            const sample = Math.max(-1, Math.min(1, inputData[i]));
            const absSample = Math.abs(sample);
            if (absSample > currentPeak) currentPeak = absSample;

            const int16Sample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
            this.pendingPcmBuffer.push(int16Sample);
          }

          // Emit when aggregated buffer reaches ~100ms target chunk size
          if (this.pendingPcmBuffer.length >= this.targetChunkSamples) {
            const chunkSamples = this.pendingPcmBuffer.splice(0, this.targetChunkSamples);
            const int16Array = new Int16Array(chunkSamples);
            const base64Audio = this.arrayBufferToBase64(int16Array.buffer);

            chunkCount++;
            const volumePercent = (currentPeak * 100).toFixed(1);

            // Log audio level when voice/sound is caught (> 1.5% volume peak) or periodically
            if (currentPeak > 0.015) {
              console.log(
                `%c🎙️ [PCM Microphone] Voice/Audio caught! Volume Peak: ${volumePercent}% | Chunk #${chunkCount}`,
                'color: #10B981; font-weight: bold;'
              );
            } else if (chunkCount % 20 === 0) {
              console.log(
                `%c🎤 [PCM Microphone] Audio Stream Active (Ambient level: ${volumePercent}%)`,
                'color: #9CA3AF;'
              );
            }

            currentPeak = 0;
            onAudioChunk(base64Audio);
          }
        }
      };

      this.audioSource = this.audioContext.createMediaStreamSource(this.mediaStream);
      this.audioSource.connect(this.audioWorklet);

      this.isStreaming = true;
      console.log('🎤 PCM Microphone recorder started (~100ms 16kHz PCM chunks)');
      return true;
    } catch (err) {
      console.error('Failed to start PCM microphone recorder:', err);
      this.stop();
      return false;
    }
  }

  public stop(): void {
    this.isStreaming = false;
    this.pendingPcmBuffer = [];

    if (this.audioSource) {
      this.audioSource.disconnect();
      this.audioSource = null;
    }

    if (this.audioContext && this.audioContext.state === 'running') {
      this.audioContext.suspend();
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach((track) => track.stop());
      this.mediaStream = null;
    }

    console.log('🛑 PCM Microphone recorder stopped');
  }

  public active(): boolean {
    return this.isStreaming;
  }

  private arrayBufferToBase64(buffer: ArrayBuffer): string {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return window.btoa(binary);
  }
}

export const pcmRecorder = new PCMRecorder();
