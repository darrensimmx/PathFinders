//For Route Generated text and save icon
import React from 'react';
import { FaBookmark } from 'react-icons/fa'

export default function RouteMessagePanel({ message, distance, loading, error, onSave }) {
  return (
    <div className="mt-4 text-sm">
      {loading && (
        <p className="text-blue-500">Generating route…</p>
      )}

      {error && (
        <p className="text-red-500">{error}</p>
      )}

      {message && (
        <div className="bg-gray-800 text-white p-3 rounded space-y-2">
          <p>{message}</p>
          {distance && (
            <p className="text-xs text-gray-400">
              Distance: {(distance / 1000).toFixed(2)} km
            </p>
          )}
          <button
            type="button"
            onClick={onSave}
            className="mt-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
          >
            <FaBookmark size={20}/>
          </button>
            <p>TODO: WIRE UP THIS BUTTON TO THE ACTUAL SAVING</p>
        </div>
      )}
    </div>
  );
}