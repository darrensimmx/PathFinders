import React, { useState } from 'react';
import FormInput from './FormInput'

export default function RouteForm({ onGenerate }) {
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [distance, setDistance] = useState('');
  const [routeType, setRouteType] = useState('loop') //default set to loop

  function handleSubmit(e) {
    e.preventDefault();
    onGenerate({ start, end, distance, routeType });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
      <FormInput
        label="Starting Point"
        id="start"
        value={start}
        onChange={e => setStart(e.target.value)}
        placeholder="Enter address or postal code"
      />

      <FormInput
        label="End Point"
        id="end"
        value={end}
        onChange={e => setEnd(e.target.value)}
        placeholder="Enter address or postal code"
        disabled={routeType == 'loop'}
        required={routeType == 'direct'}
      />

      <FormInput
        label="Distance to Run (km)"
        id="distance"
        type="number"
        step="any" //check what this is for
        value={distance}
        onChange={e => setDistance(e.target.value)}
        placeholder="e.g. 5.2"
      />

      {/* Route Type Toggle */}
      
      <div>
        <label className="block text-sm font-medium text-white mb-1">
          Route type
        </label>
        <div className="flex w-full rounded-md bg-gray-700 overflow-hidden text-white text-sm font-medium">
          <button
            type="button"
            onClick={() => setRouteType('loop')}
            className={`w-1/2 px-4 py-2 transition-colors duration-200 ${
              routeType === 'loop' ? 'bg-green-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Loop
          </button>
          <button
            type="button"
            onClick={() => setRouteType('direct')}
            className={`w-1/2 px-4 py-2 transition-colors duration-200 ${
              routeType === 'direct' ? 'bg-green-500 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Point-to-point
          </button>
  </div>
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

