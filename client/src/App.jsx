import React, { useState } from 'react';
import { geocode } from '../utils/geocode.js';
import RouteForm from './components/RouteForm.jsx';
import RouteMap from './components/RouteMap.jsx';
import './index.css';

export default function App() {
  const [coords, setCoords]               = useState(null);
  const [routeDistance, setRouteDistance] = useState(null);
  const [routeMessage, setRouteMessage]   = useState('');
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState(null);

  async function handleGenerate({ start: startInput, end: endInput, distance }) {
    // Reset UI
    setLoading(true);
    setError(null);
    setRouteMessage('');
    setCoords(null);
    setRouteDistance(null);

    // 1) Geocode start
    let start;
    try {
      start = await geocode(startInput);
    } catch (e) {
      setError(`Invalid starting location: ${e.message}`);
      setLoading(false);
      return;
    }

    // 2) Geocode end
    let end;
    try {
      end = await geocode(endInput);
    } catch (e) {
      setError(`Invalid ending location: ${e.message}`);
      setLoading(false);
      return;
    }

    // 3) Request route from backend
    try {
      const res = await fetch('http://localhost:4000/api/route', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ start, end, distance })
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`${res.status}: ${text}`);
      }

      const { type, geojson, distance: actualDist, warning } = await res.json();

      // Convert [lng, lat] → [lat, lng] for Leaflet
      const latLngs = geojson.coordinates.map(
        ([lng, lat]) => [lat, lng]
      );
      setCoords(latLngs);
      setRouteDistance(actualDist);

      // 4) Build message
      if (warning) {
        setRouteMessage(warning);
      } else if (type === 'shortest') {
        setRouteMessage(
          `Shortest route between ${startInput} and ${endInput} is ${(actualDist / 1000).toFixed(2)} km long`
        );
      } else {
        setRouteMessage(
          `Generated a ${(actualDist / 1000).toFixed(2)} km route between ${startInput} and ${endInput}`
        );
      }
    } catch (e) {
      setError(`Route generation failed: ${e.message}`);
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
          <a
            href="https://github.com/darrensimmx"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            @darrensimmx
          </a>{' '}
          and{' '}
          <a
            href="https://github.com/RishabhShenoy03"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            @RishabhShenoy03
          </a>
        </p>

        <RouteForm onGenerate={handleGenerate} />

        {loading && <p className="mt-4 text-blue-500">Generating route…</p>}
        {error   && <p className="mt-4 text-red-500">{error}</p>}
        {routeMessage && (
          <p className="mt-2 text-white">{routeMessage}</p>
        )}
      </aside>

      <main className="map-wrapper">
        <RouteMap routeCoords={coords} />
      </main>
    </div>
  );
}
