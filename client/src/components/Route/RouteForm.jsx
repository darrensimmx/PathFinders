// client/src/components/Route/RouteForm.jsx
import React, { useState, forwardRef } from 'react';
import FormInput from '../Auth/FormInput';
import { geocodePlace } from '../../../utils/geocode';

const RouteForm = forwardRef(function RouteForm({ onGenerate }, ref) {
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [distance, setDistance] = useState('');
  const [routeType, setRouteType] = useState('loop'); // default to loop

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

    onGenerate(formData);
  }


  return (
    <form ref={ref} onSubmit={handleSubmit} className="flex flex-col space-y-4">
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

      {/* Submit button hidden; sidebar renders Generate Route */}
      <button type="submit" className="hidden">Generate Route</button>
    </form>
  );
});

export default RouteForm;
