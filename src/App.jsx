import { useState, useEffect, useRef } from 'react';

function App() {
  const [audioContext, setAudioContext] = useState(null);
  const [analyser, setAnalyser] = useState(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!audioContext) {
      const context = new (window.AudioContext || window.webkitAudioContext)();
      const analyserNode = context.createAnalyser();
      analyserNode.fftSize = 4096;
      setAudioContext(context);
      setAnalyser(analyserNode);
    }
  }, []);

  const startRecording = async () => {
    if (!audioContext) return;
    if (audioContext.state === 'suspended') {
      await audioContext.resume();
    }
    console.log("Microphone access granted");

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    stream.getTracks().forEach(track => console.log(track.label, track.readyState));
    
    const source = audioContext.createMediaStreamSource(stream);
    const gainNode = audioContext.createGain();
    gainNode.gain.value = 2; // Amplify input signal
    
    source.connect(gainNode);
    gainNode.connect(analyser);

    drawWaveform();
  };

  const drawWaveform = () => {
    if (!analyser || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      requestAnimationFrame(draw);
      analyser.getByteTimeDomainData(dataArray);
      
      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.lineWidth = 2;
      ctx.strokeStyle = 'lime';
      ctx.beginPath();
      
      const sliceWidth = canvas.width / bufferLength;
      let x = 0;

      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * canvas.height) / 2;

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);

        x += sliceWidth;
      }

      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
    };
    draw();
  };

  return (
    <div style={{ textAlign: 'center', background: '#222', color: 'white', minHeight: '100vh', padding: '20px' }}>
      <h1>Analizador de Frecuencias para Guitarra</h1>
      <button onClick={startRecording} style={{ padding: '10px', fontSize: '16px', marginBottom: '20px' }}>
        Iniciar Captura de Sonido
      </button>
      <canvas ref={canvasRef} width={600} height={300} style={{ border: '1px solid white', background: 'black' }}></canvas>
    </div>
  );
}

export default App;
