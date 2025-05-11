// client/src/components/RouteForm.jsx

import React, { useState } from 'react';

export default function RouteForm({ onGenerate }) {
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [distance, setDistance] = useState(5);

  const handleSubmit = e => {
    e.preventDefault();
    onGenerate({ start, end, distance });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Starting point</label>
        <input
          type="text"
          value={start}
          onChange={e => setStart(e.target.value)}
          placeholder="e.g. 123 Main St"
          className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">End Point</label>
        <input
          type="text"
          value={end}
          onChange={e => setEnd(e.target.value)}
          placeholder="e.g. 456 Elm St"
          className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Distance to run</label>
        <input
          type="number"
          value={distance}
          onChange={e => setDistance(+e.target.value)}
          min={1}
          className="w-full bg-gray-700 border border-gray-600 rounded px-2 py-1 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        Generate Route
      </button>
    </form>
  );
}

