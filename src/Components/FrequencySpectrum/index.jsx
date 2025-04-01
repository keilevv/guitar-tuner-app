import { useEffect, useRef } from "react";
import useFFTAnalyzer from "../../hooks/useFFTAnalyzer";
import useViewport from "../../hooks/useViewport";

function FrequencySpectrum({ analyser, isRecording }) {
  const canvasRef = useRef(null);
  const { frequencyData } = useFFTAnalyzer(analyser, isRecording);
  const { isMobileScreen } = useViewport();
  const sampleRate = 44100; // Assuming a 44.1kHz sample rate
  const maxFrequency = 2000; // Max frequency to display

  useEffect(() => {
    if (!canvasRef.current || !frequencyData.length) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const bufferLength = frequencyData.length;
    const nyquist = sampleRate / 2; // 22050 Hz in 44.1kHz sample rate
    const maxIndex = Math.round((maxFrequency / nyquist) * bufferLength); // Convert 2000Hz to index

    const draw = () => {
      if (!isRecording) return;
      requestAnimationFrame(draw);

      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const barWidth = canvas.width / maxIndex;
      let x = 0;

      // Draw frequency bars (only up to maxIndex)
      for (let i = 0; i < maxIndex; i++) {
        const barHeight = frequencyData[i] / 2;
        ctx.fillStyle = `rgb(${barHeight + 100}, 50, 50)`;
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        x += barWidth;
      }

      // Draw frequency labels
      ctx.fillStyle = "white";
      ctx.font = "12px Consolas";
      ctx.textAlign = "center";

      const labelFrequencies = [100, 500, 1000, 1500, 2000]; // Adjusted labels for the range
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
    };

    if (isRecording) {
      draw();
    }
  }, [frequencyData, isRecording]);

  return (
    <div>
      <h2 className="font-semibold">Espectro de Frecuencias</h2>
      <canvas
        ref={canvasRef}
        className="border-2 border-gray-400 bg-black"
        width={isMobileScreen ? 350 : 800}
        height={isMobileScreen ? 200 : 300}
      ></canvas>
    </div>
  );
}

export default FrequencySpectrum;
