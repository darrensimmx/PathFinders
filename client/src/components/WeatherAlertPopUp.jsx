// WeatherAlertPopup.jsx

import React from 'react';

export default function WeatherAlertPopup({ weatherWarnings, samplesEvery2km, onClose, onRegenerate }) {
  if (!weatherWarnings || weatherWarnings.length === 0) return null;

  console.log("Rendering popup with:", weatherWarnings);

  return (
    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-[90%] max-w-xl bg-white shadow-lg rounded-md border border-gray-300 p-4 z-[1000]">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-red-600 font-bold text-base"> Weather Warning!</h3>
          <ul className="list-disc pl-5 text-sm mt-2 text-black">
            {weatherWarnings.map((warn, i) => {
              const idx = samplesEvery2km.findIndex(
                pt => pt.lat === warn.lat && pt.lng === warn.lng
              );
              const section = idx >= 0 ? idx + 1 : i + 1;
              const hours = warn.badHours || warn.BadHours || []; 
              console.log("Rendering warning:", warn, "Hours:", hours);

              return (
                <li key={i}>
                  <strong>Section {section}</strong> –&nbsp;
                  {hours.map((h, j) => (
                    <span key={j}>
                      {h.time} ({h.condition}){j < hours.length - 1 ? ', ' : ''}
                    </span>
                  ))}
                </li>
              );
            })}
          </ul>
        </div>
        <button onClick={onClose} className="ml-4 text-gray-500 hover:text-black text-xl font-bold">×</button>
      </div>
      <button
        className="mt-3 bg-black text-white px-3 py-1 rounded hover:bg-gray-800 text-sm"
        onClick={onRegenerate}
      >
        Click here to generate another route
      </button>
    </div>
  );
}
