// client/src/components/WeatherWarning.jsx

import React from 'react';

export default function WeatherWarning({ weatherWarnings, samplesEvery2km }) {
  return (
    <div className="mt-6">
      <h2 className="text-lg font-semibold mb-2">Weather Status</h2>

      {(!weatherWarnings || weatherWarnings.length === 0) ? (
        <p className="text-green-300">
          All clear: no bad weather along route
        </p>
      ) : (
        <ul className="space-y-4">
          {weatherWarnings.map((warn, i) => {
            // find which 2km section this warning belongs to
            const idx = samplesEvery2km.findIndex(
              pt => pt.lat === warn.lat && pt.lng === warn.lng
            );
            const section = idx >= 0 ? idx + 1 : i + 1;

            return (
              <li key={i}>
                <span className="font-medium">Section {section}:</span>
                <ul className="ml-4 list-disc">
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
