import { useState, useEffect, useRef } from "react";

function App() {
  const [audioContext, setAudioContext] = useState(null);
  const [analyser, setAnalyser] = useState(null);
  const [dataArray, setDataArray] = useState(new Uint8Array(0));
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!audioContext) {
      const context = new (window.AudioContext || window.webkitAudioContext)();
      const analyserNode = context.createAnalyser();
      analyserNode.fftSize = 2048;
      setAudioContext(context);
      setAnalyser(analyserNode);
    }
  }, []);

  const startRecording = async () => {
    if (!audioContext) return;
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const source = audioContext.createMediaStreamSource(stream);
    source.connect(analyser);
    const bufferLength = analyser.frequencyBinCount;
    const newDataArray = new Uint8Array(bufferLength);
    setDataArray(newDataArray);
    drawWaveform(newDataArray);
  };

  const drawWaveform = (data) => {
    if (!analyser || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const draw = () => {
      requestAnimationFrame(draw);
      analyser.getByteTimeDomainData(data);
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.lineWidth = 2;
      ctx.strokeStyle = "lime";
      ctx.beginPath();

      const sliceWidth = (canvas.width * 1.0) / data.length;
      let x = 0;

      for (let i = 0; i < data.length; i++) {
        const v = data[i] / 128.0;
        const y = (v * canvas.height) / 2;

        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
        x += sliceWidth;
      }

      ctx.lineTo(canvas.width, canvas.height / 2);
      ctx.stroke();
    };
    draw();
  };

  return (
    <div>
      <h1>Analizador de Frecuencias para Guitarra</h1>
      <button onClick={startRecording}>Iniciar Captura de Sonido</button>
      <canvas
        ref={canvasRef}
        width={600}
        height={300}
        style={{ border: "1px solid white" }}
      ></canvas>
    </div>
  );
}

export default App;
