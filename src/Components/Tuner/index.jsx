import { useState, useEffect } from "react";
import { noteFrequencies } from "../../noteFrequencies";

function getClosestNote(frequency) {
  return noteFrequencies.reduce((closest, current) =>
    Math.abs(current.freq - frequency) < Math.abs(closest.freq - frequency)
      ? current
      : closest
  );
}

function Tuner({ frequency }) {
  const [closestNote, setClosestNote] = useState(null);
  const [difference, setDifference] = useState(0);

  useEffect(() => {
    if (frequency) {
      const note = getClosestNote(frequency);
      setClosestNote(note);
      setDifference(frequency - note.freq);
    }
  }, [frequency]);

  const isInTune = Math.abs(difference) < 1;
  const indicatorColor = isInTune ? "text-green-500" : "text-red-500";
  const direction = difference > 0 ? "Too High" : "Too Low";

  return (
    <div className={`flex flex-col items-center p-4 border ${indicatorColor}`}>
      <h2 className="text-xl font-bold">Tuner</h2>
      {closestNote ? (
        <div className="text-center">
          <p className="text-2xl font-semibold">{closestNote.note}</p>
          <p className={indicatorColor}>{isInTune ? "In Tune" : direction}</p>
        </div>
      ) : (
        <p>Waiting for frequency...</p>
      )}
    </div>
  );
}

export default Tuner;
