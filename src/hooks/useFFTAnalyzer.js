import { useEffect, useState, useRef } from "react";

function useFFTAnalyzer(analyser, isRecording) {
  const [frequency, setFrequency] = useState(null);
  const [frequencyData, setFrequencyData] = useState(new Uint8Array(0));
  const animationFrameId = useRef(null);
  const sampleRate = 44100;
  const historySize = 10;
  const frequencyHistoryRef = useRef([]);

  useEffect(() => {
    if (!analyser || !isRecording) return;

    const bufferLength = analyser.fftSize;
    const dataArray = new Uint8Array(bufferLength);
    const fftData = new Uint8Array(bufferLength);

    const analyze = () => {
      if (!isRecording) return;
      animationFrameId.current = requestAnimationFrame(analyze);

      analyser.getByteTimeDomainData(dataArray); // Waveform data
      analyser.getByteFrequencyData(fftData); // Frequency data
      setFrequencyData(fftData); // Update frequency spectrum data

      // Find dominant frequency
      let maxIndex = 0;
      let maxValue = 0;
      for (let i = 1; i < fftData.length / 2; i++) {
        if (fftData[i] > maxValue) {
          maxValue = fftData[i];
          maxIndex = i;
        }
      }
      const detectedFrequency = (maxIndex * sampleRate) / bufferLength;

      // Update history (useRef to avoid triggering re-renders)
      frequencyHistoryRef.current.push(detectedFrequency);
      if (frequencyHistoryRef.current.length > historySize) {
        frequencyHistoryRef.current.shift();
      }

      // Compute and update frequency only when history is full
      if (frequencyHistoryRef.current.length === historySize) {
        const avgFrequency =
          frequencyHistoryRef.current.reduce((a, b) => a + b, 0) /
          frequencyHistoryRef.current.length;
        setFrequency(avgFrequency.toFixed(2));
      }
    };

    // Reset history when recording starts
    frequencyHistoryRef.current = [];
    analyze();

    return () => cancelAnimationFrame(animationFrameId.current);
  }, [analyser, isRecording]); // Dependencies: Only re-run when these change

  return { frequency, frequencyData };
}

export default useFFTAnalyzer;
