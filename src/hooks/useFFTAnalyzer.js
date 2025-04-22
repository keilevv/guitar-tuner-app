import { useEffect, useState, useRef } from "react";

function useFFTAnalyzer(analyser, isRecording) {
  const [frequency, setFrequency] = useState(null); // Real-time (smoothed)
  const [finalFrequency, setFinalFrequency] = useState(null);
  const [finalSpectrum, setFinalSpectrum] = useState(new Uint8Array(0));

  const sampleRate = 44100;
  const fftSize = 8192;
  const smoothingFactor = 0.05;

  const frequencyHistoryRef = useRef([]);
  const spectrumSumRef = useRef(null);
  const frameCountRef = useRef(0);
  const animationFrameId = useRef(null);

  useEffect(() => {
    if (!analyser) return;

    analyser.fftSize = fftSize;
    const bufferLength = analyser.frequencyBinCount;
    const fftData = new Uint8Array(bufferLength);

    const resetState = () => {
      frequencyHistoryRef.current = [];
      spectrumSumRef.current = new Float32Array(bufferLength);
      frameCountRef.current = 0;
      setFinalFrequency(null);
      setFinalSpectrum(new Uint8Array(0));
    };

    const analyze = () => {
      if (!isRecording) return;

      animationFrameId.current = requestAnimationFrame(analyze);

      analyser.getByteFrequencyData(fftData);

      // Accumulate spectrum
      for (let i = 0; i < bufferLength; i++) {
        spectrumSumRef.current[i] += fftData[i];
      }
      frameCountRef.current++;

      // Detect dominant frequency
      let maxIndex = 0;
      let maxValue = 0;
      for (let i = 1; i < bufferLength / 2; i++) {
        if (fftData[i] > maxValue) {
          maxValue = fftData[i];
          maxIndex = i;
        }
      }

      let rawFreq = (maxIndex * sampleRate) / fftSize;
      let correctedFreq = rawFreq;

      // Subharmonic correction
      for (let div = 2; div <= 5; div++) {
        const idx = Math.round(maxIndex / div);
        if (idx > 0 && fftData[idx] > fftData[maxIndex] * 0.6) {
          correctedFreq = rawFreq / div;
          break;
        }
      }

      frequencyHistoryRef.current.push(correctedFreq);

      // Smooth real-time frequency
      setFrequency((prev) =>
        prev
          ? prev * (1 - smoothingFactor) + correctedFreq * smoothingFactor
          : correctedFreq
      );
    };

    if (isRecording) {
      resetState();
      animationFrameId.current = requestAnimationFrame(analyze);
    } else {
      // Stop analyzing
      cancelAnimationFrame(animationFrameId.current);

      const freqs = frequencyHistoryRef.current;
      const summed = spectrumSumRef.current;
      const frameCount = frameCountRef.current;

      if (freqs.length > 0 && frameCount > 0) {
        // Average spectrum
        const avgSpectrum = new Uint8Array(summed.length);
        for (let i = 0; i < summed.length; i++) {
          avgSpectrum[i] = Math.min(255, summed[i] / frameCount);
        }
        setFinalSpectrum(avgSpectrum);

        // Get most frequent (mode) frequency
        const freqBins = {};
        freqs.forEach((f) => {
          const rounded = Math.round(f);
          freqBins[rounded] = (freqBins[rounded] || 0) + 1;
        });

        const mostFrequent = Object.entries(freqBins).reduce((a, b) =>
          a[1] > b[1] ? a : b
        )[0];

        setFinalFrequency(parseFloat(mostFrequent));
      } else {
        // In case no data was collected
        setFinalFrequency(null);
        setFinalSpectrum(new Uint8Array(0));
      }
    }

    return () => cancelAnimationFrame(animationFrameId.current);
  }, [analyser, isRecording]);

  return { frequency, finalFrequency, finalSpectrum };
}

export default useFFTAnalyzer;
