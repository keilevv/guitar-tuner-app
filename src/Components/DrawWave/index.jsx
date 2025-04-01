import { useEffect, useRef } from "react";
import useFFTAnalyzer from "../../hooks/useFFTAnalyzer";

function DrawWave({ analyser, isRecording }) {
  const canvasRef = useRef(null);
  const { frequency } = useFFTAnalyzer(analyser, isRecording);

  useEffect(() => {
    if (!analyser || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const bufferLength = analyser.fftSize;
    const dataArray = new Uint8Array(bufferLength);
    let animationFrameId;
    let timeElapsed = 0; // Reset when component mounts
    const sampleRate = 44100; 

    const draw = () => {
      if (!isRecording) {
        cancelAnimationFrame(animationFrameId); // Stop animation
        return;
      }
      animationFrameId = requestAnimationFrame(draw);

      analyser.getByteTimeDomainData(dataArray);

      ctx.fillStyle = "black";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.lineWidth = 2;
      ctx.strokeStyle = "lime";
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
      ctx.stroke();

      // Draw moving time labels
      ctx.fillStyle = "white";
      ctx.font = "14px Arial";
      ctx.textAlign = "center";

      const timeStep = bufferLength / sampleRate; // Time per sample
      for (let i = 0; i <= 5; i++) {
        const xPos = (i / 5) * canvas.width;
        const timeLabel = (timeElapsed / 1000 + i * timeStep).toFixed(2) + "s";
        ctx.fillText(timeLabel, xPos, canvas.height - 10);
      }

      timeElapsed += 1000 * (bufferLength / sampleRate);
    };

    if (isRecording) {
      timeElapsed = 0; // Reset time when starting
      draw();
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
      timeElapsed = 0; // Ensure reset when unmounting
    };
  }, [analyser, isRecording]);

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
