// client/src/components/Route/RouteForm.jsx
import React, { useState } from 'react';
import FormInput from '../Auth/FormInput';
import { geocodePlace } from '../../../utils/geocode';

export default function RouteForm({ onGenerate }) {
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [distance, setDistance] = useState('');
  const [routeType, setRouteType] = useState('loop'); // default to loop
  const [waypoints, setWaypoints] = useState([]);
  const [waypointInput, setWaypointInput] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    console.log("Form submitted with:", { start, end, distance, routeType });

    if (!start || !distance) {
      alert("Start and distance are required.");
      return;
    }
    const resolvedStart = await geocodePlace(start);
    if (!resolvedStart) {
        alert("We couldn't find the starting location. Please try another.");
        return;
    }

    let resolvedEnd = null;
    if (routeType === 'direct') {
        if (!end) {
          alert("End point is required for direct routes.");
          return;
        }

        resolvedEnd = await geocodePlace(end);
        if (!resolvedEnd) {
          alert("We couldn't find the end location. Please try another.");
          return;
        }
      }


    // If routeType is 'loop', ignore end field
    const formData = {
      start,
      distance,
      routeType,
    };

    if (routeType === 'direct') {
      formData.end = end;
    }
    if (waypoints.length) {
      formData.waypoints = waypoints;
    }

    onGenerate(formData);
  }

  function handleAddWaypoint() {
    if (waypointInput.trim()) {
      setWaypoints(prev => [...prev, waypointInput.trim()]);
      setWaypointInput('');
    }
  }
  function handleRemoveWaypoint(idx) {
    setWaypoints(prev => prev.filter((_, i) => i !== idx));
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
      <FormInput
        label="Starting Point"
        id="start"
        value={start}
        onChange={(e) => setStart(e.target.value)}
        placeholder="Enter address or postal code"
        required
      />

      <FormInput
        label="End Point"
        id="end"
        value={end}
        onChange={(e) => setEnd(e.target.value)}
        placeholder="Enter address or postal code"
        disabled={routeType === 'loop'}
        required={routeType === 'direct'}
      />

      <FormInput
        label="Distance to Run (km)"
        id="distance"
        type="number"
        step="any"
        value={distance}
        onChange={(e) => setDistance(e.target.value)}
        placeholder="e.g. 5.2"
        required
      />

      {/* Route Type Toggle */}
      <div>
        <label className="block text-sm font-medium text-white mb-1">
          Route Type
        </label>
        <div className="flex w-full rounded-md bg-gray-700 overflow-hidden text-white text-sm font-medium">
          <button
            type="button"
            onClick={() => setRouteType('loop')}
            className={`w-1/2 px-4 py-2 transition-colors duration-200 ${
              routeType === 'loop'
                ? 'bg-green-500 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Loop
          </button>
          <button
            type="button"
            onClick={() => setRouteType('direct')}
            className={`w-1/2 px-4 py-2 transition-colors duration-200 ${
              routeType === 'direct'
                ? 'bg-green-500 text-white'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Point-to-point
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-white mb-1">
          Waypoints (optional)
        </label>
        <div className="flex space-x-2 mb-2">
          <input
            type="text"
            value={waypointInput}
            onChange={e => setWaypointInput(e.target.value)}
            placeholder="Enter waypoint address"
            className="w-full px-3 py-2 rounded-md bg-gray-700 text-white placeholder-gray-400"
          />
          <button
            type="button"
            onClick={handleAddWaypoint}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 rounded-md text-white"
          >
            Add
          </button>
        </div>
        {waypoints.length > 0 && (
          <ul className="list-disc list-inside text-sm text-white max-h-32 overflow-auto">
            {waypoints.map((wp, idx) => (
              <li key={idx} className="flex justify-between items-center">
                <span>{wp}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveWaypoint(idx)}
                  className="text-red-400 hover:text-red-600 ml-2"
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
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
