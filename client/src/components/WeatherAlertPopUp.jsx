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
          <ul className="list-none space-y-3">
            {weatherWarnings.map((warn, i) => {
              const idx = samplesEvery2km.findIndex(
                pt => pt.lat === warn.lat && pt.lng === warn.lng
              );
              const section = idx >= 0 ? idx + 1 : i + 1;
              const items = warn.badHours || [];
              // 10 much darker red shades for clear visibility
              const redShades = ['#CC0000','#B30000','#990000','#800000','#660000','#4D0000','#330000','#1A0000','#110000','#080000'];
              // choose shade based on section index
              // alternating 1,6,2,7,3,8 indices in redShades array
              let color;
              if (items.length > 0) {
                const secIdx = section - 1;
                const half = redShades.length / 2;
                // 1->0,2->5,3->1,4->6,... then wrap every 10
                let shadeIdx = secIdx % redShades.length;
                if (shadeIdx % 2 === 0) shadeIdx = shadeIdx / 2;
                else shadeIdx = half + Math.floor((shadeIdx - 1) / 2);
                shadeIdx = shadeIdx % redShades.length;
                color = redShades[shadeIdx];
              } else {
                // 10 distinct non-warm colors for clear segments in popup
                const goodCols = [
                  '#2ECC71', // green
                  '#3498DB', // light blue
                  '#9B59B6', // purple
                  '#1ABC9C', // turquoise
                  '#34495E', // dark slate
                  '#27AE60', // dark green
                  '#8E44AD', // dark purple
                  '#2980B9', // dark blue
                  '#16A085', // teal
                  '#7F8C8D'  // gray
                ];
                color = goodCols[(section - 1) % goodCols.length];
              }

              return (
                <li key={i} className="flex items-start space-x-2">
                  <span
                    style={{
                      backgroundColor: color,
                      width: 12,
                      height: 12,
                      borderRadius: '50%',
                      marginTop: 4
                    }}
                  />
                  <div className="text-gray-800">
                    <strong style={{ color }}>Section {section}:</strong>{' '}
                    {items.map((h, j) => (
                      <span key={j}>
                        {h.time} ({h.condition})
                        {j < items.length - 1 ? ', ' : ''}
                      </span>
                    ))}
                  </div>
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
