import { useState, useEffect } from "react";
import DrawWave from "./Components/DrawWave";
import FrequencySpectrum from "./Components/FrequencySpectrum";
import RecordButton from "./Components/RecordButton";

function App() {
  const [audioContext, setAudioContext] = useState(null);
  const [analyser, setAnalyser] = useState(null);
  const [isRecording, setIsRecording] = useState(false);

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
    <div className="min-h-screen w-screen flex flex-col items-center gap-8 p-8">
      <h1 className="text-3xl font-semibold">Analizador de Frecuencias</h1>
      <DrawWave analyser={analyser} isRecording={isRecording} />
      <FrequencySpectrum analyser={analyser} isRecording={isRecording} />
      <RecordButton
        isRecording={isRecording}
        setIsRecording={setIsRecording}
        audioContext={audioContext}
        analyser={analyser}
      />
    </div>
  );
}

export default App;
