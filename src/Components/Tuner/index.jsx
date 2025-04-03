import { useState, useEffect, useRef } from "react";
import { noteFrequencies } from "../../noteFrequencies";

// Function to calculate cents difference
function getCentsDifference(freq, refFreq) {
  return 1200 * Math.log2(freq / refFreq);
}

// Find closest note
function getClosestNote(frequency) {
  return noteFrequencies.reduce((closest, current) =>
    Math.abs(current.freq - frequency) < Math.abs(closest.freq - frequency)
      ? current
      : closest
  );
}

function Tuner({ frequency }) {
  const [closestNote, setClosestNote] = useState(null);
  const [centsOff, setCentsOff] = useState(0);
  const [smoothedFrequency, setSmoothedFrequency] = useState(frequency);
  const previousFrequencies = useRef([]);

  useEffect(() => {
    if (frequency) {
      // Moving Average Smoothing (use last 5 values)
      previousFrequencies.current.push(frequency);
      if (previousFrequencies.current.length > 5) {
        previousFrequencies.current.shift(); // Keep array size small
      }
      const avgFrequency =
        previousFrequencies.current.reduce((sum, f) => sum + f, 0) /
        previousFrequencies.current.length;

      setSmoothedFrequency(avgFrequency);

      // Find closest note
      const note = getClosestNote(avgFrequency);
      setClosestNote(note);

      // Calculate cents
      setCentsOff(getCentsDifference(avgFrequency, note.freq));
    }
  }, [frequency]);

  // Improved natural feel: Define in-tune zones
  const absCents = Math.abs(centsOff);
  let tuningStatus, indicatorColor;

  if (absCents < 5) {
    tuningStatus = "Afinado 🎯";
    indicatorColor = "text-green-500";
  } else if (absCents < 15) {
    tuningStatus = "Casi afinado 🔸";
    indicatorColor = "text-yellow-500";
  } else if (absCents < 30) {
    tuningStatus = centsOff > 0 ? "Un poco alto 🔺" : "Un poco bajo 🔻";
    indicatorColor = "text-orange-500";
  } else {
    tuningStatus = centsOff > 0 ? "Muy alto 🔴" : "Muy bajo 🔴";
    indicatorColor = "text-red-500";
  }

  return (
    <div
      className="flex flex-col items-center p-4 border-zinc-400 border-2 rounded-lg shadow-lg bg-zinc-800 min-w-[300px]"
    >
      <h2 className="text-xl font-bold">Afinador</h2>
      {closestNote ? (
        <div className="text-center">
          <p className={`text-2xl font-semibold ${indicatorColor}`}>
            {closestNote.note}
          </p>
          <p className={indicatorColor}>
            {tuningStatus} ({centsOff.toFixed(2)} cents)
          </p>
        </div>
      ) : (
        <p>Esperando frecuencia...</p>
      )}
    </div>
  );
}

export default Tuner;
