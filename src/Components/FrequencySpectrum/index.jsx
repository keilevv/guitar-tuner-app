import { useEffect, useRef } from "react";
import useViewport from "../../hooks/useViewport.js";

function FrequencySpectrum({ frequencyData, isRecording, frequency }) {
  const canvasRef = useRef(null);
  const { isMobileScreen } = useViewport();
  const sampleRate = 44100; // Assuming a 44.1kHz sample rate
  const maxFrequency = 500; // Max frequency to display

  useEffect(() => {
    if (!canvasRef.current || !frequencyData.length || isRecording) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const bufferLength = frequencyData.length;
    const nyquist = sampleRate / 2;
    const maxIndex = Math.round((maxFrequency / nyquist) * bufferLength);

    // Clear canvas before drawing
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const barWidth = canvas.width / maxIndex;
    let x = 0;

    const maxDataValue = Math.max(...frequencyData.slice(0, maxIndex));
    for (let i = 0; i < maxIndex; i++) {
      const maxBarHeight = canvas.height;
      const normalizedHeight =
        maxDataValue > 0 ? (frequencyData[i] / maxDataValue) * maxBarHeight : 0;
      const barHeight = Math.min(normalizedHeight, maxBarHeight);
      ctx.fillStyle = `rgb(${barHeight + 100}, 50, 50)`;
      ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
      x += barWidth;
    }

    // Frequency labels
    ctx.fillStyle = "white";
    ctx.font = "12px Consolas";
    ctx.textAlign = "center";

    const labelFrequencies = [100, 200, 300, 400, 500];
    labelFrequencies.forEach((freq) => {
      const index = Math.round((freq / nyquist) * bufferLength);
      const labelX = (index / maxIndex) * canvas.width;

      ctx.fillText(`${freq} Hz`, labelX, canvas.height - 5);
      ctx.beginPath();
      ctx.moveTo(labelX, canvas.height - 20);
      ctx.lineTo(labelX, canvas.height - 10);
      ctx.strokeStyle = "white";
      ctx.stroke();
    });
  }, [frequencyData, isRecording]);

  return (
    <div>
      <div className="flex gap-2">
        <h2 className="font-semibold">Frecuencia:</h2>
        <h2 className="font-semibold text-lime-400">
          {frequency ? frequency.toFixed(2) + " Hz" : " Calculando..."}
        </h2>
      </div>
      <canvas
        ref={canvasRef}
        className="border-2 border-zinc-400 bg-black rounded-lg "
        width={isMobileScreen ? 350 : 800}
        height={isMobileScreen ? 200 : 300}
      ></canvas>
    </div>
  );
}

export default FrequencySpectrum;
