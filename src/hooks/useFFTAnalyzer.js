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

    analyser.fftSize = 2048; // Higher FFT resolution
    const bufferLength = analyser.fftSize;
    const dataArray = new Uint8Array(bufferLength);
    const fftData = new Uint8Array(bufferLength);

    const analyze = () => {
      if (!isRecording) return;
      animationFrameId.current = requestAnimationFrame(analyze);

      analyser.getByteFrequencyData(fftData); // Get frequency domain data
      setFrequencyData(fftData);

      // Find peak frequency index
      let maxIndex = 0;
      let maxValue = 0;
      for (let i = 1; i < fftData.length / 2; i++) {
        if (fftData[i] > maxValue) {
          maxValue = fftData[i];
          maxIndex = i;
        }
      }

      // Avoid index out of bounds
      if (maxIndex <= 0 || maxIndex >= fftData.length - 1) {
        return; // Skip this frame to prevent NaN
      }

      // Parabolic interpolation for better frequency precision
      const alpha = fftData[maxIndex - 1] || 0;
      const beta = fftData[maxIndex];
      const gamma = fftData[maxIndex + 1] || 0;
      const denominator = 2 * (alpha - 2 * beta + gamma);

      let peakOffset = 0;
      if (denominator !== 0) {
        peakOffset = (alpha - gamma) / denominator;
      }

      const detectedFrequency =
        ((maxIndex + peakOffset) * sampleRate) / bufferLength;

      // Prevent NaN frequencies
      if (!isFinite(detectedFrequency) || detectedFrequency <= 0) {
        return;
      }

      // Ignore sudden frequency jumps
      if (
        frequencyHistoryRef.current.length > 0 &&
        Math.abs(detectedFrequency - frequencyHistoryRef.current.at(-1)) > 50
      ) {
        return; // Ignore outliers
      }

      // Store detected frequency
      frequencyHistoryRef.current.push(detectedFrequency);
      if (frequencyHistoryRef.current.length > historySize) {
        frequencyHistoryRef.current.shift();
      }

      // Weighted Moving Average
      if (frequencyHistoryRef.current.length > 0) {
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
      }
    };

    // Reset history on new recording
    frequencyHistoryRef.current = [];
    analyze();

    return () => cancelAnimationFrame(animationFrameId.current);
  }, [analyser, isRecording]);

  return { frequency, frequencyData };
}

export default useFFTAnalyzer;
