class PCMProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.bufferSize = 1600; // ~100ms at 16kHz
    this.buffer = new Int16Array(this.bufferSize);
    this.bufferIndex = 0;
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    if (!input || !input[0]) return true;

    const inputChannel = input[0]; // Mono input channel

    for (let i = 0; i < inputChannel.length; i++) {
      // Convert float32 sample (-1.0 to 1.0) to int16 (-32768 to 32767)
      const sample = Math.max(-1, Math.min(1, inputChannel[i]));
      const int16Sample = sample < 0 ? sample * 0x8000 : sample * 0x7FFF;
      
      this.buffer[this.bufferIndex++] = int16Sample;

      // When buffer reaches ~100ms size, emit to main thread
      if (this.bufferIndex >= this.bufferSize) {
        this.port.postMessage({
          type: 'audio_chunk',
          pcmData: this.buffer.slice(0, this.bufferSize).buffer
        });
        this.bufferIndex = 0;
      }
    }

    return true;
  }
}

registerProcessor('pcm-processor', PCMProcessor);
