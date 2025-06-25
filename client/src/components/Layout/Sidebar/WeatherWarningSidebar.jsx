import React from 'react';

export default function WeatherWarningSidebar({
  weatherWarnings,
  samplesEvery2km
}) {
  return (
    // add a top margin so this panel sits below the generate/save UI
    <div className="mt-6 p-4 border-t border-gray-700">
      <h3 className="text-lg font-semibold mb-2">Weather Status</h3>
      {!weatherWarnings || weatherWarnings.length === 0 ? (
        <p className="text-green-300">
          All clear: no bad weather along route
        </p>
      ) : (
        <ul className="space-y-3">
          {weatherWarnings.map((warn, i) => {
            const section = samplesEvery2km.findIndex(
              pt => pt.lat === warn.lat && pt.lng === warn.lng
            ) + 1;
            return (
              <li key={i}>
                <span className="font-medium">Section {section || i+1}:</span>
                <ul className="ml-4 list-disc mt-1">
                  {warn.badHours.map((h, j) => (
                    <li key={j}>
                      {h.time} – {h.condition}
                    </li>
                  ))}
                </ul>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
