class RecorderProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.isPaused = false;

    this.port.onmessage = (e) => {
      if (e.data === "pause") this.isPaused = true;
      if (e.data === "resume") this.isPaused = false;
    };
  }

  process(inputs) {
    if (this.isPaused) return true;

    const input = inputs[0];
    if (!input || !input[0]) return true;

    // Send Float32 PCM to main thread
    this.port.postMessage(input[0]);
    return true;
  }
}

registerProcessor("recorder-processor", RecorderProcessor);
