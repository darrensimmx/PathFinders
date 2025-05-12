import React, { useState } from 'react';
import { geocode } from '../utils/geocode.js';
import RouteForm from './components/RouteForm.jsx';
import RouteMap from './components/RouteMap.jsx';
import './index.css';

export default function App() {
  const [coords, setCoords] = useState(null);
  const [routeDistance, setRouteDistance] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleGenerate({ start, end, distance }) {
    setLoading(true);
    setError(null);

    try {
      // Geocode if inputs are strings
      const startCoords = typeof start === 'string' ? await geocode(start) : start;
      const endCoords   = typeof end   === 'string' ? await geocode(end)   : end;

      const res = await fetch('/api/route', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ start: startCoords, end: endCoords, distance })
      });

      if (!res.ok) throw new Error(`Server returned ${res.status}`);

      const { geojson, distance: actualDist } = await res.json();
      const latLngs = geojson.coordinates.map(([lng, lat]) => [lat, lng]);

      setCoords(latLngs);
      setRouteDistance(actualDist);
    } catch (err) {
      console.error('Fetch failed:', err);
      setError('Could not generate route.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="app-container">
      <aside className="sidebar">
        <h1 className="text-3xl font-extrabold mb-2">PathFinders</h1>
        <p className="text-sm text-gray-300 mb-6">
          By{' '}
          <a href="https://github.com/darrensimmx" target="_blank" rel="noopener noreferrer" className="underline">
            @darrensimmx
          </a>{' '}
          and{' '}
          <a href="https://github.com/RishabhShenoy03" target="_blank" rel="noopener noreferrer" className="underline">
            @RishabhShenoy03
          </a>
        </p>

        <RouteForm onGenerate={handleGenerate} />
        {loading && <p className="mt-4 text-blue-500">Generating route…</p>}
        {error   && <p className="mt-4 text-red-400">{error}</p>}
        {routeDistance !== null && (
          <p className="mt-2 text-gray-700">
            Your route is {Math.round(routeDistance)} meters long.
          </p>
        )}
      </aside>
      <main className="map-wrapper">
        <RouteMap routeCoords={coords} />
      </main>
    </div>
  );
}
