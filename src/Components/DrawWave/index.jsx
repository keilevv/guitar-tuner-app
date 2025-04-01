import { useEffect, useRef, useState } from "react";

function DrawWave({ analyser, isRecording }) {
  const canvasRef = useRef(null);
  const [frequency, setFrequency] = useState(null);
  const [frequencyHistory, setFrequencyHistory] = useState([]);
  const historySize = 10; // Número de valores a promediar
  let animationFrameId = null;
  let lastTime = performance.now();
  const updateInterval = 50;
  const sampleRate = 44100;

  useEffect(() => {
    if (!analyser || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const bufferLength = analyser.fftSize;
    const dataArray = new Uint8Array(bufferLength);
    const fftData = new Uint8Array(bufferLength);
    let timeElapsed = 0;

    const draw = (timestamp) => {
      if (!isRecording) return;
      animationFrameId = requestAnimationFrame(draw);

      if (timestamp - lastTime < updateInterval) return;
      lastTime = timestamp;

      analyser.getByteTimeDomainData(dataArray); // Onda original
      analyser.getByteFrequencyData(fftData); // Datos FFT

      // Limpiar canvas sin parpadeo
      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.lineWidth = 2;
      ctx.strokeStyle = "lime";
      ctx.beginPath();

      const sliceWidth = canvas.width / bufferLength;
      let x = 0;

      // Dibujar la onda temporal original
      for (let i = 0; i < bufferLength; i++) {
        const v = dataArray[i] / 128.0;
        const y = (v * canvas.height) / 2;

        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);

        x += sliceWidth;
      }
      ctx.stroke();

      // Calcular frecuencia usando FFT
      let maxIndex = 0;
      let maxValue = 0;
      for (let i = 1; i < fftData.length / 2; i++) {
        if (fftData[i] > maxValue) {
          maxValue = fftData[i];
          maxIndex = i;
        }
      }

      const detectedFrequency = (maxIndex * sampleRate) / bufferLength;

      // Agregar al historial y promediar
      setFrequencyHistory((prev) => {
        const newHistory = [...prev, detectedFrequency];
        if (newHistory.length > historySize) newHistory.shift();
        return newHistory;
      });

      // Dibujar etiquetas de tiempo
      ctx.fillStyle = "white";
      ctx.font = "14px Arial";
      ctx.textAlign = "center";
      for (let i = 0; i <= 5; i++) {
        const xPos = (i / 5) * canvas.width;
        const timeLabel = ((timeElapsed / 1000) + (i * updateInterval / 1000)).toFixed(2) + "s";
        ctx.fillText(timeLabel, xPos, canvas.height - 10);
      }

      timeElapsed += updateInterval;
    };

    if (isRecording) {
      setFrequencyHistory([]); // Reiniciar historial
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      draw(performance.now());
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [analyser, isRecording]);

  // Calcular frecuencia promedio del historial
  useEffect(() => {
    if (frequencyHistory.length > 0) {
      const avgFrequency =
        frequencyHistory.reduce((a, b) => a + b, 0) / frequencyHistory.length;
      setFrequency(avgFrequency.toFixed(2));
    }
  }, [frequencyHistory]);

  return (
    <div>
      <h2>Frecuencia {frequency ? frequency + " Hz" : "Calculando..."}</h2>
      <canvas
        ref={canvasRef}
        width={800}
        height={300}
        style={{ border: "1px solid white", background: "black" }}
      ></canvas>
    </div>
  );
}

export default DrawWave;
