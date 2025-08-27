// VAD AudioWorklet Processor
class VADProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.leftover = null;
    this.CHUNK_SIZE = 160; // 10ms @ 16kHz
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    if (input.length === 0) return true;

    const channelData = input[0]; // First channel
    if (!channelData || channelData.length === 0) return true;

    // Calculate RMS volume
    let sumSq = 0;
    for (let i = 0; i < channelData.length; i++) {
      sumSq += channelData[i] * channelData[i];
    }
    const rms = Math.sqrt(sumSq / channelData.length);

    // Accumulate samples
    let samples;
    if (this.leftover) {
      samples = new Float32Array(this.leftover.length + channelData.length);
      samples.set(this.leftover);
      samples.set(channelData, this.leftover.length);
      this.leftover = null;
    } else {
      samples = channelData;
    }

    // Process in CHUNK_SIZE chunks
    const chunks = [];
    let processed = 0;
    for (; processed + this.CHUNK_SIZE <= samples.length; processed += this.CHUNK_SIZE) {
      const chunk = samples.subarray(processed, processed + this.CHUNK_SIZE);
      chunks.push(Array.from(chunk)); // Convert to regular array for postMessage
    }

    // Save leftover
    const rest = samples.length - processed;
    if (rest > 0) {
      this.leftover = samples.subarray(samples.length - rest);
    }

    // Send data to main thread
    if (chunks.length > 0) {
      this.port.postMessage({
        type: 'audioData',
        chunks: chunks,
        rms: rms,
      });
    }

    return true;
  }
}

registerProcessor('vad-processor', VADProcessor);
