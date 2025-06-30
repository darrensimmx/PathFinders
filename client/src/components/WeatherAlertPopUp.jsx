import React from 'react';

export default function WeatherAlertPopup({
  weatherWarnings = [],
  samplesEvery2km = [],
  onClose,
  onRegenerate
}) {
  const hasWarnings = weatherWarnings.length > 0;

  return (
    <div className="
      w-[95%] sm:w-[90%] max-w-xl 
    bg-white shadow-xl rounded-xl border border-gray-200 
    p-0 z-[1000]
    ">
      {/* Header */}
      <div className={`flex items-center justify-between px-4 py-2 rounded-t-xl
        ${hasWarnings ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
        <h3 className="font-semibold text-lg">
          {hasWarnings ? '⚠️ Weather Warning' : '✅ All Clear'}
        </h3>
        <button
          onClick={onClose}
          className="text-current text-2xl leading-none"
          aria-label="Close popup"
        >
          ×
        </button>
      </div>

      {/* Body with scrollable warning list */}
      <div className="px-6 py-4 max-h-[25vh] overflow-y-auto">
        {hasWarnings ? (
          <ul className="list-disc pl-5 space-y-1 text-gray-800 pr-2">
            {weatherWarnings.map((warn, i) => {
              const idx = samplesEvery2km.findIndex(
                pt => pt.lat === warn.lat && pt.lng === warn.lng
              );
              const section = idx >= 0 ? idx + 1 : i + 1;
              const items = warn.badHours || [];

              return (
                <li key={i}>
                  <strong>Section {section}:</strong>{' '}
                  {items.map((h, j) => (
                    <span key={j}>
                      {h.time} ({h.condition})
                      {j < items.length - 1 ? ', ' : ''}
                    </span>
                  ))}
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-gray-700">No bad weather detected along your route.</p>
        )}
      </div>

      {/* Footer */}
      <div className="px-6 pb-4">
        <button
          onClick={onRegenerate}
          className={`
            w-full py-2 rounded-lg text-white
            ${hasWarnings ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}
          `}
        >
          Generate another route
        </button>
      </div>
    </div>
  );
}
