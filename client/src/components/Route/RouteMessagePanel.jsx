//For Route Generated text and save icon
import React from 'react';
import { FaBookmark } from 'react-icons/fa'

export default function RouteMessagePanel({ message, distance, loading, error, success, onSave, currentGeneratedRoute }) {
  return (
    <div className="mt-4 text-sm">
      {loading && (
        <p className="text-blue-500">Generating route…</p>
      )}

      {error && (
        <p className="!text-red-500 text-sm italic mt-2">{error}</p>
      )}

      {success && (
        <p className="!text-green-400 text-sm italic mt-2">{success}</p>
      )}
      
      {message && currentGeneratedRoute && (
        <div className="bg-white/10 backdrop-blur-sm border border-white/20 text-white px-4 py-3 rounded-lg shadow-md mt-4 space-y-2">
          <p>{message}</p>
          {distance && (
            <p className="text-xs text-gray-400">
              Distance: {(distance / 1000).toFixed(2)} km
            </p>
          )}
          <button
            type="button"
            onClick={() => {
              console.log("Saving:", currentGeneratedRoute);
              onSave(currentGeneratedRoute);
            }}
            className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            <FaBookmark size={20}/>
          </button>
        </div>
      )}
    </div>
  );
}