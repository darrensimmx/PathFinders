// client/src/components/MainApp.jsx

import React, { useState, useEffect } from 'react';
import Header from './Layout/Header';
import Sidebar from './Layout/Sidebar';
import RouteMap from '../RouteMap';
import WeatherAlertPopup from './WeatherAlertPopUp';
import './Layout/Layout.css';
import { geocode } from '../../utils/geocode';

export default function MainApp() {
  const [isSidebarOpen, setIsSidebarOpen]         = useState(true);
  const [activeSidebarView, setActiveSidebarView] = useState('navigation');

  // Route state
  const [coords, setCoords]               = useState(null);
  const [routeDistance, setRouteDistance] = useState(null);
  const [routeMessage, setRouteMessage]   = useState('');
  const [loading, setLoading]             = useState(false);
  const [error, setError]                 = useState(null);

  // Save‐route state
  const [savedRoutes, setSavedRoutes]                     = useState([]);
  const [currentGeneratedRoute, setCurrentGeneratedRoute] = useState(null);
  const accessToken                                      = localStorage.getItem('accessToken');

  // Weather state
  const [weatherWarnings, setWeatherWarnings] = useState([]);
  const [samplesEvery2km, setSamplesEvery2km] = useState([]);

  // Remember last generate call
  const [lastGenerateArgs, setLastGenerateArgs] = useState(null);

  // Control popup visibility
  const [popupVisible, setPopupVisible] = useState(false);

  // ... your existing useEffects for fetching saved routes and user ...

  async function handleGenerate(formData, filters) {
    // remember inputs
    setLastGenerateArgs({ formData, filters });

    setLoading(true);
    setError(null);
    setRouteMessage('');
    setCoords(null);
    setRouteDistance(null);
    setWeatherWarnings([]);
    setSamplesEvery2km([]);

    try {
      const start = await geocode(formData.start);
      const end   = formData.routeType !== 'loop'
                    ? await geocode(formData.end)
                    : null;

      const payload = formData.routeType === 'loop'
        ? { start, distance: formData.distance, routeType: formData.routeType, filters }
        : { start, end, distance: formData.distance, routeType: formData.routeType, filters };

      const res = await fetch('http://localhost:4000/api/route', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(payload)
      });
      const apiRes = await res.json();
      if (!res.ok || apiRes.success === false) {
        throw new Error(apiRes.message || 'Route generation failed');
      }

      const {
        geojson,
        type,
        warning,
        actualDist,
        weatherWarnings: ww,
        samplesEvery2km: s2k
      } = apiRes;

      setWeatherWarnings(ww || []);
      setSamplesEvery2km(s2k || []);

      const latLngs = geojson.coordinates.map(([lng, lat]) => [lat, lng]);
      setCoords(latLngs);
      setRouteDistance(actualDist);

      const km = (actualDist / 1000).toFixed(2);
      let msg;
      if (warning)                         msg = warning;
      else if (type === 'shortest')        msg = `Shortest route is ${km} km`;
      else if (formData.routeType === 'loop') msg = `Generated a ${km} km loop`;
      else                                  msg = `Generated a ${km} km route`;
      setRouteMessage(msg);

      setCurrentGeneratedRoute({
        name: formData.routeType === 'loop'
          ? `Loop around ${formData.start}`
          : `Route ${formData.start}→${formData.end}`,
        distance:    actualDist,
        coordinates: geojson.coordinates,
        startPoint:  { type: 'Point', coordinates: [start.lng, start.lat] },
        endPoint:    formData.routeType === 'loop'
          ? { type: 'Point', coordinates: [start.lng, start.lat] }
          : { type: 'Point', coordinates: [end.lng, end.lat] }
      });

      // show popup once generation completes
      setPopupVisible(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Header toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />

      <div className="app-container flex h-screen">
        <Sidebar
          isOpen={isSidebarOpen}
          activeView={activeSidebarView}
          setActiveView={setActiveSidebarView}
          handleGenerate={handleGenerate}
          routeMessage={routeMessage}
          routeDistance={routeDistance}
          loading={loading}
          error={error}
          handleSaveRoute={() => {}}
          routes={savedRoutes}
          onDeleteRoute={() => {}}
          onClearAll={() => {}}
          currentGeneratedRoute={currentGeneratedRoute}
          samplesEvery2km={samplesEvery2km}
          weatherWarnings={weatherWarnings}
        />

        <main className="map-wrapper flex-1 relative">
          <RouteMap sidebarOpen={isSidebarOpen} routeCoords={coords} />

          {popupVisible && (
            <WeatherAlertPopup
              weatherWarnings={weatherWarnings}
              samplesEvery2km={samplesEvery2km}
              onClose={() => setPopupVisible(false)}
              onRegenerate={() => {
                // hide popup immediately
                setPopupVisible(false);
                // re-run the last generate call
                if (lastGenerateArgs) {
                  handleGenerate(
                    lastGenerateArgs.formData,
                    lastGenerateArgs.filters
                  );
                }
              }}
            />
          )}
        </main>
      </div>
    </>
  );
}
