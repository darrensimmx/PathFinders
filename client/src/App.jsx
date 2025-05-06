// client/src/App.jsx

import React, { useState } from 'react';
import RouteForm from './components/RouteForm.jsx';
import RouteMap from './components/RouteMap.jsx';
import './index.css';

export default function App() {
  const [coords, setCoords] = useState(null);

  function handleGenerate({ start, end, distance }) {
    // TODO: wire up to your backend
    setCoords([
      [1.3521, 103.8198],
      [1.3550, 103.8200],
      [1.3580, 103.8250],
    ]);
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
      </aside>
      <main className="map-wrapper">
        <RouteMap routeCoords={coords} />
      </main>
    </div>
  );
}

