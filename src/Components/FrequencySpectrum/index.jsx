import { useEffect, useRef, useState } from "react";
import useViewport from "../../hooks/useViewport.js";

function FrequencySpectrum({ frequencyData, isRecording, frequency }) {
  const canvasRef = useRef(null);
  const { isMobileScreen } = useViewport();
  const sampleRate = 44100;
  const nyquist = sampleRate / 2;

  const [zoom, setZoom] = useState(100); // Default windowSize: ±100 Hz

  useEffect(() => {
    if (
      !canvasRef.current ||
      !frequencyData.length ||
      isRecording ||
      !frequency
    )
      return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const bufferLength = frequencyData.length;

    const minFreq = Math.max(0, frequency - zoom);
    const maxFreq = Math.min(nyquist, frequency + zoom);

    const minIndex = Math.floor((minFreq / nyquist) * bufferLength);
    const maxIndex = Math.ceil((maxFreq / nyquist) * bufferLength);
    const visibleRange = maxIndex - minIndex;

    // Clear canvas
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const barWidth = canvas.width / visibleRange;
    let x = 0;

    const maxDataValue = Math.max(...frequencyData.slice(minIndex, maxIndex));

    for (let i = minIndex; i < maxIndex; i++) {
      const maxBarHeight = canvas.height;
      const normalizedHeight =
        maxDataValue > 0 ? (frequencyData[i] / maxDataValue) * maxBarHeight : 0;
      const barHeight = Math.min(normalizedHeight, maxBarHeight);
      ctx.fillStyle = `rgb(${barHeight + 100}, 50, 50)`;
      ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
      x += barWidth;
    }

    // Frequency labels every 50Hz (optional: adjust based on zoom)
    ctx.fillStyle = "white";
    ctx.font = "12px Consolas";
    ctx.textAlign = "center";

    const step = 50;
    for (let f = Math.ceil(minFreq / step) * step; f < maxFreq; f += step) {
      const index = (f - minFreq) / (maxFreq - minFreq);
      const labelX = index * canvas.width;

      ctx.fillText(`${f} Hz`, labelX, canvas.height - 5);
      ctx.beginPath();
      ctx.moveTo(labelX, canvas.height - 20);
      ctx.lineTo(labelX, canvas.height - 10);
      ctx.strokeStyle = "white";
      ctx.stroke();
    }
  }, [frequencyData, isRecording, frequency, zoom]);

  return (
    <div>
      <div className="flex gap-4 items-center mb-2">
        <div className="flex gap-2 items-center">
          <h2 className="font-semibold">Frecuencia:</h2>
          <h2 className="font-semibold text-lime-400">
            {frequency ? frequency.toFixed(2) + " Hz" : "Calculando..."}
          </h2>
        </div>
        <div className="flex gap-2 items-center">
          <label className="font-semibold" htmlFor="zoom">
            Zoom:
          </label>
          <select
            id="zoom"
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="bg-zinc-800 text-white px-2 py-1 rounded border border-zinc-500"
          >
            <option value={50}>±50 Hz</option>
            <option value={100}>±100 Hz</option>
            <option value={250}>±250 Hz</option>
            <option value={500}>±500 Hz</option>
          </select>
        </div>
      </div>
      <canvas
        ref={canvasRef}
        className="border-2 border-zinc-400 bg-black rounded-lg"
        width={isMobileScreen ? 350 : 800}
        height={isMobileScreen ? 200 : 300}
      ></canvas>
    </div>
  );
}

export default FrequencySpectrum;
