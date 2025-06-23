// components/MainApp.jsx

import React, { useState } from 'react';
import Header from './Layout/Header';
import Sidebar from './Layout/Sidebar';
import RouteMap from '../RouteMap';
import './Layout/Layout.css'
import { geocode } from '../../utils/geocode'
// import WeatherWarning if needed

export default function MainApp() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeSidebarView, setActiveSidebarView] = useState('navigation');

  // Shared route state
  const [coords, setCoords] = useState(null);
  const [routeDistance, setRouteDistance] = useState(null);
  const [routeMessage, setRouteMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  function handleSaveRoute() {
  console.log('Saving route...');
  // TODO: add actual save logic (e.g., POST to /api/saveRoute)
  }
  
   async function handleGenerate({ start: startInput, end: endInput, distance, routeType }, filters) {
    setLoading(true);
    setError(null);
    setRouteMessage('');
    setCoords(null);
    setRouteDistance(null);

    try {
      const start = await geocode(startInput);
      let end = null;

      if (routeType !== 'loop') {
        end = await geocode(endInput);
      }

      const payload = routeType === 'loop'
        ? { start, distance, routeType, filters }
        : { start, end, distance, routeType, filters };

      const res = await fetch('http://localhost:4000/api/route', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error(await res.text());

      const { geojson, warning, distance: actualDist, type } = await res.json();
      const latLngs = geojson.coordinates.map(([lng, lat]) => [lat, lng]);
      setCoords(latLngs);

      if (warning) {
        setRouteMessage(warning);
      } else if (type === 'shortest') {
        setRouteMessage(
          `Shortest route between ${startInput} and ${endInput} is ${(actualDist / 1000).toFixed(2)} km long`
        );
      } else {
        setRouteMessage(
          routeType === 'loop'
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
    <>
      <Header toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      <div className="app-container">
        <Sidebar 
          isOpen={isSidebarOpen}
          activeView={activeSidebarView}
          setActiveView={setActiveSidebarView}
          handleGenerate={handleGenerate}
          routeMessage={routeMessage}
          routeDistance={routeDistance}
          loading={loading}
          error={error}
          onSave={handleSaveRoute}
        />

        <main className="map-wrapper">
          <RouteMap 
            sidebarOpen={isSidebarOpen}
            routeCoords={coords} 
          />
        </main>

        {/*<WeatherWarning/>*/}        
      </div>
    </>
  );
}
