function RecordButton({ isRecording, setIsRecording, audioContext, analyser }) {
  const toggleRecording = async () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
    setIsRecording(!isRecording);
  };

  const startRecording = async () => {
    if (!audioContext) return;
    if (audioContext.state === "suspended") {
      await audioContext.resume();
    }
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const source = audioContext.createMediaStreamSource(stream);
    const gainNode = audioContext.createGain();
    gainNode.gain.value = 2;
    source.connect(gainNode);
    gainNode.connect(analyser);
  };

  const stopRecording = () => {
    if (audioContext) {
      audioContext.suspend();
    }
  };

  return (
    <button
      onClick={toggleRecording}
      className="bg-zinc-500 hover:bg-zinc-700 text-white font-bold py-2 px-4 rounded cursor-pointer"
    >
      {isRecording ? "Detener Captura de Sonido" : "Iniciar Captura de Sonido"}
    </button>
  );
}

export default RecordButton;
