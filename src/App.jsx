import { useState, useEffect } from "react";
import DrawWave from "./Components/DrawWave";
import FrequencySpectrum from "./Components/FrequencySpectrum";
import RecordButton from "./Components/RecordButton";
import Tuner from "./Components/Tuner";
import Footer from "./Components/Footer";
import useFFTAnalyzer from "./hooks/useFFTAnalyzer";

function App() {
  const [audioContext, setAudioContext] = useState(null);
  const [analyser, setAnalyser] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const { finalSpectrum, finalFrequency, frequency } = useFFTAnalyzer(
    analyser,
    isRecording
  );

  useEffect(() => {
    if (!audioContext) {
      const context = new (window.AudioContext || window.webkitAudioContext)();
      const analyserNode = context.createAnalyser();
      analyserNode.fftSize = 1024;
      setAudioContext(context);
      setAnalyser(analyserNode);
    }
  }, []);

  return (
    <div className="min-h-screen w-screen flex flex-col items-center gap-8 p-8 overflow-x-auto">
      <h1 className="text-3xl font-semibold text-center">
        Analizador de Frecuencias
      </h1>
      <DrawWave
        frequency={finalFrequency}
        analyser={analyser}
        isRecording={isRecording}
      />
      <RecordButton
        isRecording={isRecording}
        setIsRecording={setIsRecording}
        audioContext={audioContext}
        analyser={analyser}
      />

      {/* <Tuner frequency={frequency} isRecording={isRecording} /> */}

      <FrequencySpectrum
        frequencyData={finalSpectrum}
        isRecording={isRecording}
        frequency={finalFrequency}
      />
      <Footer />
    </div>
  );
}

export default App;
