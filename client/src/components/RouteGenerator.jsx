//Page for RouteGenerator

import React, { useState } from 'react';
import { geocode } from '../../utils/geocode.js';
import RouteForm from './RouteForm.jsx';
import RouteMap from './RouteMap.jsx';
import '../index.css';

export default function RouteGenerator() {
  const [coords, setCoords]               = useState(null);
  const [routeDistance, setRouteDistance] = useState(null);
  const [routeMessage, setRouteMessage]   = useState('');
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState(null);

  async function handleGenerate({ start: startInput, end: endInput, distance, routeType }) {
    // Reset UI
    setLoading(true);
    setError(null);
    setRouteMessage('');
    setCoords(null);
    setRouteDistance(null);

    // 1) Geocode start
    let start;
    try {
      if (startInput && typeof startInput === 'object' &&
        typeof startInput.lat === 'number' &&
        typeof startInput.lng === 'number') {
          start = startInput
        } else if (typeof startInput == 'string') {
        start = await geocode(startInput);  
      } else {
        throw new Error('invalid start input: ${JSON.stringify(startInput)}')
      }
    } catch (e) {
      setError(`Invalid starting location: ${e.message}`);
      setLoading(false);
      return;
    }

    // 2) Geocode end
    let end;
    if (routeType !== 'loop') {
      try {
        if (endInput && typeof endInput === 'object' &&
          typeof endInput.lat === 'number' &&
          typeof endInput.lng === 'number') {
            end = endInput
          } else if (typeof endInput == 'string') {
          end = await geocode(endInput);
        } else {
          throw new Error('invalid end input: ${JSON.stringify(endInput)}')
        }
      } catch (e) {
        setError(`Invalid ending location: ${e.message}`);
        setLoading(false);
        return;
      }
    }

    // 3) Choose backend based on routeType
    const isLoop = routeType == 'loop'
    const url = 'http://localhost:4000/api/route'
    const payLoad = isLoop
                  ? {start, distance, routeType}
                  : {start, end, distance, routeType};

    // 4) Request route from backend
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payLoad)
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`${res.status}: ${text}`);
      }

      const { type, geojson, distance: actualDist, warning } = await res.json();

      // Convert [lng, lat] to [lat, lng] for Leaflet
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
          isLoop 
          ? `Generated a ${(actualDist / 1000).toFixed(2)} km route around ${startInput}`
          : `Generated a ${(actualDist / 1000).toFixed(2)} km route between ${startInput} and ${endInput}`
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
