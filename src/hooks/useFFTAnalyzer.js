import { useEffect, useState, useRef } from "react";

function useFFTAnalyzer(analyser, isRecording) {
  const [frequency, setFrequency] = useState(null);
  const [frequencyData, setFrequencyData] = useState(new Uint8Array(0));
  const animationFrameId = useRef(null);
  const sampleRate = 44100;
  const historySize = 10;
  const frequencyHistoryRef = useRef([]);
  const smoothingFactor = 0.1; // Low-pass filter

  useEffect(() => {
    if (!analyser || !isRecording) return;

    analyser.fftSize = 8192; // Higher FFT resolution for better accuracy
    const bufferLength = analyser.frequencyBinCount; // Half of fftSize
    const fftData = new Uint8Array(bufferLength);

    const analyze = () => {
      if (!isRecording) return;
      animationFrameId.current = requestAnimationFrame(analyze);

      analyser.getByteFrequencyData(fftData);
      setFrequencyData(fftData);

      let maxIndex = 0;
      let maxValue = 0;

      // Find dominant frequency
      for (let i = 1; i < bufferLength / 4; i++) {
        if (fftData[i] > maxValue) {
          maxValue = fftData[i];
          maxIndex = i;
        }
      }

      if (maxIndex <= 0 || maxIndex >= bufferLength - 1) return;

      let detectedFreq = (maxIndex * sampleRate) / analyser.fftSize;

      // Harmonic Energy Analysis (Check if we are detecting an octave harmonic)
      let fundamentalFreq = detectedFreq;
      for (let div = 2; div <= 4; div++) {
        let harmonicIndex = Math.round(maxIndex / div);
        if (harmonicIndex > 0 && fftData[harmonicIndex] > fftData[maxIndex] * 0.6) {
          fundamentalFreq = detectedFreq / div;
          break; // Take the strongest subharmonic
        }
      }

      // Ignore sudden frequency jumps
      if (
        frequencyHistoryRef.current.length > 0 &&
        Math.abs(fundamentalFreq - frequencyHistoryRef.current.at(-1)) > 30
      ) {
        return;
      }

      // Store detected frequency
      frequencyHistoryRef.current.push(fundamentalFreq);
      if (frequencyHistoryRef.current.length > historySize) {
        frequencyHistoryRef.current.shift();
      }

      // Weighted Moving Average
      const weights = frequencyHistoryRef.current.map((_, i) => i + 1);
      const weightedSum = frequencyHistoryRef.current.reduce(
        (sum, f, i) => sum + f * weights[i],
        0
      );
      const weightTotal = weights.reduce((sum, w) => sum + w, 0);
      const avgFrequency = weightedSum / weightTotal;

      // Apply Low-Pass Filtering
      setFrequency((prev) =>
        prev
          ? prev * (1 - smoothingFactor) + avgFrequency * smoothingFactor
          : avgFrequency
      );
    };

    frequencyHistoryRef.current = [];
    analyze();

    return () => cancelAnimationFrame(animationFrameId.current);
  }, [analyser, isRecording]);

  return { frequency, frequencyData };
}

export default useFFTAnalyzer;
