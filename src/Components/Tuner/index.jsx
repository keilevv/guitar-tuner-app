import { useState, useEffect } from "react";
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

  useEffect(() => {
    if (frequency) {
      const note = getClosestNote(frequency);
      setClosestNote(note);
      setCentsOff(getCentsDifference(frequency, note.freq));
    }
  }, [frequency]);

  const isInTune = Math.abs(centsOff) < 5; // Acceptable threshold in cents
  const indicatorColor = isInTune ? "text-green-500" : "text-red-500";
  const direction = centsOff > 0 ? "Too High" : "Too Low";

  return (
    <div className={`flex flex-col items-center p-4 border ${indicatorColor} min-w-[300px]`}>
      <h2 className="text-xl font-bold">Tuner</h2>
      {closestNote ? (
        <div className="text-center">
          <p className="text-2xl font-semibold">{closestNote.note}</p>
          <p className={indicatorColor}>
            {isInTune
              ? "In Tune"
              : `${direction} (${centsOff.toFixed(2)} cents)`}
          </p>
        </div>
      ) : (
        <p>Waiting for frequency...</p>
      )}
    </div>
  );
}

export default Tuner;
