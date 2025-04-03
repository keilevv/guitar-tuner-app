import { useEffect, useRef } from "react";
import useViewport from "../../hooks/useViewport.js";

function DrawWave({ frequency, analyser, isRecording }) {
  const canvasRef = useRef(null);
  const { isMobileScreen } = useViewport();

  useEffect(() => {
    if (!analyser || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const bufferLength = analyser.fftSize;
    const dataArray = new Uint8Array(bufferLength);
    let animationFrameId;
    let startTime = null; // Store recording start time
    const sampleRate = 44100;

    const draw = (timestamp) => {
      if (!isRecording) {
        cancelAnimationFrame(animationFrameId);
        return;
      }

      if (!startTime) {
        startTime = timestamp; // Set start time when recording begins
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

      // Compute actual elapsed time
      const timeElapsed = (timestamp - startTime) / 1000; // Convert to seconds

      // Draw time labels with correct timing
      ctx.fillStyle = "white";
      ctx.font = "14px Consolas";
      ctx.textAlign = "center";

      const durationDisplayed = 3; // Seconds shown on the canvas
      for (let i = 0; i <= 5; i++) {
        const xPos = (i / 5) * canvas.width;
        const timeLabel =
          Math.max(
            0,
            timeElapsed - durationDisplayed + (i * durationDisplayed) / 5
          ).toFixed(2) + "s";

        ctx.fillText(timeLabel, xPos, canvas.height - 10);
      }
    };

    if (isRecording) {
      startTime = null; // Reset start time when recording starts
      requestAnimationFrame(draw);
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [analyser, isRecording]);

  return (
    <div>
      <div className="flex flex-col">
        <div className="flex gap-2">
          <h2 className="font-semibold">Frecuencia:</h2>
          <h2 className="font-semibold text-lime-400">
            {frequency ? frequency.toFixed(2) + " Hz" : " Calculando..."}
          </h2>
        </div>
        <div className="flex gap-2 flex-wrap">
          <h2 className="font-semibold">Arm 1:</h2>
          <h2 className="font-normal ">
            {frequency ? (frequency * 2).toFixed(2) + " Hz" : " Calculando..."}
          </h2>
          <h2 className="font-semibold">Arm 2:</h2>
          <h2 className="font-normal ">
            {frequency ? (frequency * 3).toFixed(2) + " Hz" : " Calculando..."}
          </h2>
          <h2 className="font-semibold">Arm 3:</h2>
          <h2 className="font-normal ">
            {frequency ? (frequency * 4).toFixed(2) + " Hz" : " Calculando..."}
          </h2>
        </div>
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

export default DrawWave;
