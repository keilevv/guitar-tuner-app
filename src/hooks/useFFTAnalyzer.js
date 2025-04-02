import { useEffect, useState, useRef } from "react";

function useFFTAnalyzer(analyser, isRecording) {
  const [frequency, setFrequency] = useState(null);
  const [frequencyData, setFrequencyData] = useState(new Uint8Array(0));
  const animationFrameId = useRef(null);
  const sampleRate = 44100;
  const historySize = 10;
  const frequencyHistoryRef = useRef([]);
  const smoothingFactor = 0.1; // For low-pass filter

  useEffect(() => {
    if (!analyser || !isRecording) return;

    analyser.fftSize = 2048; // Increased FFT size for better resolution
    const bufferLength = analyser.fftSize;
    const dataArray = new Uint8Array(bufferLength);
    const fftData = new Uint8Array(bufferLength);

    const analyze = () => {
      if (!isRecording) return;
      animationFrameId.current = requestAnimationFrame(analyze);

      analyser.getByteFrequencyData(fftData); // Frequency domain data
      setFrequencyData(fftData);

      // Find dominant frequency using parabolic interpolation
      let maxIndex = 0;
      let maxValue = 0;
      for (let i = 1; i < fftData.length / 2; i++) {
        if (fftData[i] > maxValue) {
          maxValue = fftData[i];
          maxIndex = i;
        }
      }

      // Parabolic interpolation to refine peak frequency
      const alpha = fftData[maxIndex - 1] || 0;
      const beta = fftData[maxIndex];
      const gamma = fftData[maxIndex + 1] || 0;
      const peakOffset = (alpha - gamma) / (2 * (alpha - 2 * beta + gamma));
      const detectedFrequency =
        ((maxIndex + peakOffset) * sampleRate) / bufferLength;

      // Ignore large frequency jumps (outlier detection)
      if (
        frequencyHistoryRef.current.length > 0 &&
        Math.abs(detectedFrequency - frequencyHistoryRef.current.at(-1)) > 50
      ) {
        return; // Ignore sudden jumps
      }

      // Update frequency history
      frequencyHistoryRef.current.push(detectedFrequency);
      if (frequencyHistoryRef.current.length > historySize) {
        frequencyHistoryRef.current.shift();
      }

      // Apply Weighted Moving Average
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

    // Reset history when recording starts
    frequencyHistoryRef.current = [];
    analyze();

    return () => cancelAnimationFrame(animationFrameId.current);
  }, [analyser, isRecording]);

  return { frequency, frequencyData };
}

export default useFFTAnalyzer;
