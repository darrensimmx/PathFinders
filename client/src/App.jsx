import React, { useState } from 'react';
import RouteForm from './components/RouteForm.jsx';
import RouteMap from './components/RouteMap.jsx';

export default function App() {
  const [coords, setCoords] = useState(null);

  function handleGenerate({ start, end, distance }) {
    // TODO: replace this stub with your backend call
    setCoords([
      [1.3521, 103.8198],
      [1.3550, 103.8200],
      [1.3580, 103.8250],
    ]);
  }

  return (
    <div className="app-container">
      <aside className="sidebar">
        <h1 className="text-3xl font-extrabold mb-6">PathFinders</h1>
        <RouteForm onGenerate={handleGenerate} />
      </aside>
      <main className="map-wrapper">
        <RouteMap routeCoords={coords} />
      </main>
    </div>
  );
}

