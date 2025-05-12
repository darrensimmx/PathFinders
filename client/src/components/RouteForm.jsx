import React, { useState } from 'react';

export default function RouteForm({ onGenerate }) {
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [distance, setDistance] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    onGenerate({ start, end, distance });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
      <div>
        <label htmlFor="start" className="block text-sm font-medium text-white">
          Starting point
        </label>
        <input
          id="start"
          type="text"
          value={start}
          onChange={e => setStart(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 bg-gray-700 text-white"
          placeholder="Enter address or postal code"
          required
        />
      </div>

      <div>
        <label htmlFor="end" className="block text-sm font-medium text-white">
          End Point
        </label>
        <input
          id="end"
          type="text"
          value={end}
          onChange={e => setEnd(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 bg-gray-700 text-white"
          placeholder="Enter address or postal code"
          required
        />
      </div>

      <div>
        <label htmlFor="distance" className="block text-sm font-medium text-white">
          Distance to run (km)
        </label>
        <input
          id="distance"
          type="number"
          step="any"
          value={distance}
          onChange={e => setDistance(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 bg-gray-700 text-white"
          placeholder="e.g. 5.2"
          required
        />
      </div>

      <button
        type="submit"
        className="
          mt-4
          inline-flex
          justify-center
          py-2 px-4
          border border-transparent
          rounded-md
          shadow-sm
          text-base font-medium
          text-white
          bg-blue-600 hover:bg-blue-700
        "
      >
        Generate Route
      </button>
    </form>
  );
}
