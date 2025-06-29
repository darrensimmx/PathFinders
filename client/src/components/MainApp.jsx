// components/MainApp.jsx

import React, { useState, useEffect } from 'react';
import Header from './Layout/Header';
import Sidebar from './Layout/Sidebar';
import RouteMap from '../RouteMap';
import './Layout/Layout.css';
import { geocode } from '../../utils/geocode';
import WeatherAlertPopup from './WeatherAlertPopUp';

export default function MainApp() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeSidebarView, setActiveSidebarView] = useState('navigation');

  // Shared route state
  const [coords, setCoords] = useState(null);
  const [routeDistance, setRouteDistance] = useState(null);
  const [routeMessage, setRouteMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');

  // Save route feature
  const [savedRoutes, setSavedRoutes] = useState([]);
  const [currentGeneratedRoute, setCurrentGeneratedRoute] = useState(null);
  const [user, setUser] = useState(null);
  const accessToken = localStorage.getItem('accessToken');

  // Weather feature
  const [weatherWarnings, setWeatherWarnings] = useState([]);
  const [samplesEvery2km, setSamplesEvery2km] = useState([]);
  const isDev = process.env.NODE_ENV === 'development'; // just to show the weather warning for dev mode


  // Fetch saved routes
  useEffect(() => {
    const fetchSavedRoutes = async () => {
      try {
        const res = await fetch('/api/saved-routes', {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        setSavedRoutes(data.routes);
      } catch (err) {
        console.log('MainApp.jsx => Failed to fetch saved routes:', err);
      }
    };

    if (accessToken) {
      fetchSavedRoutes();
    }
  }, [accessToken]);

  // Fetch user info
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch('/api/me', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        setUser(data);
      } catch (err) {
        console.error('Failed to fetch user:', err);
      }
    };

    if (accessToken) fetchUser();
  }, [accessToken]);

  async function handleSaveRoute(route) {
    try {
      const res = await fetch('/api/saved-routes/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ route }),
      });

      if (!res.ok) throw new Error(await res.text());
      console.log('Route saved successfully');
      setSuccess('Route saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
      const saved = await res.json();

      const newRoute = { ...route, _id: saved._id, createdAt: new Date() };
      setSavedRoutes((prev) => [...prev, newRoute]);
      console.log("Attempting to save route:", route);
      setError('')
    } catch (err) {
      console.error('Failed to save route:', err);

      try {
        const parsed = JSON.parse(err.message);
        if (parsed.message === "Limit of 5 saved routes for free plan.") {
          setError("You’ve reached the free limit of 5 saved routes. Please delete one to save a new route.");
        } else {
          setError(parsed.message || "An unexpected error occurred.");
        }
      } catch {
        setError("An unexpected error occurred.");
      }
    }
  }

  async function handleDeleteRoute(routeId) {
    try {
      const res = await fetch(`/api/saved-routes/${routeId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!res.ok) throw new Error(await res.text());
      console.log('Route deleted');

      setSavedRoutes((prev) => prev.filter((r) => r._id !== routeId));
    } catch (err) {
      console.error('Failed to delete route:', err);
    }
  }

  async function handleClearAllRoutes() {
    try {
      const res = await fetch('/api/saved-routes/clear-all', {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!res.ok) throw new Error(await res.text());
      console.log('All routes cleared');
      setSavedRoutes([]);
    } catch (err) {
      console.error('Failed to clear all routes:', err);
    }
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
        body: JSON.stringify(payload),
      });

      const apiResponse = await res.json();

      if (!res.ok || apiResponse.success === false) {
        throw new Error(await res.text() || 'Request failed.');
      }

      const geoJson = apiResponse.geojson;
      if (!geoJson || !Array.isArray(geoJson.coordinates)) {
        throw new Error('Server returned invalid route coordinates.');
      }

      const { type, warning, actualDist, weatherWarnings: ww, samplesEvery2km: s2k } = apiResponse;
      setWeatherWarnings(ww || []);
      setSamplesEvery2km(s2k || []);

      const latLngs = geoJson.coordinates.map(([lng, lat]) => [lat, lng]);
      setCoords(latLngs);
      setRouteDistance(actualDist);

      const distKm = (actualDist / 1000).toFixed(2);
      if (warning) {
        setRouteMessage(warning);
      } else if (type === 'shortest') {
        setRouteMessage(
          `Shortest route between ${startInput} and ${endInput} is ${distKm} km long`
        );
      } else {
        setRouteMessage(
          routeType === 'loop'
            ? `Generated a ${distKm} km route around ${startInput}`
            : `Generated a ${distKm} km route between ${startInput} and ${endInput}`
        );
      }

      setCurrentGeneratedRoute({
        name:
          routeType === 'loop'
            ? `Loop around ${startInput}`
            : `Route from ${startInput} to ${endInput}`,
        distance: Number(distKm),
        coordinates: geoJson.coordinates,
        startPoint: { type: 'Point', coordinates: [start.lng, start.lat] },
        endPoint: {
          type: 'Point',
          coordinates:
            routeType === 'loop'
              ? [start.lng, start.lat]
              : [end.lng, end.lat],
        },
      });
    } catch (e) {
      setError(`Route generation failed: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  function handleSelectRoute(route) {
    if (!route || !route.coordinates) return;

    const latLngs = route.coordinates.map(([lng, lat]) => [lat, lng]);
    setCoords(latLngs);
    setRouteMessage(`Showing saved route: ${route.name}`);
    setRouteDistance(route.distance);
  }

  const mockWeatherWarnings = [
    {
      lat: 1.3,
      lng: 103.8,
      badHours: [
        {time: '2.00 PM', condition: 'Thunderstorm'},
        {time: '4.00 PM', condition: 'Heavy Rain'}
      ]
    }
  ]

  const mockSamples = [
    {lat: 1.3, lng: 103.8},
    {lat: 1.35, lng: 103.82}
  ]

  useEffect(() => {
    setRouteMessage("Bad weather detected along your route: possible thunderstorm.");
  }, []);


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
          success={success}
          handleSaveRoute={handleSaveRoute}
          routes={savedRoutes}
          onDeleteRoute={handleDeleteRoute}
          onClearAll={handleClearAllRoutes}
          currentGeneratedRoute={currentGeneratedRoute}
          onSelectRoute={handleSelectRoute}
          user={user}
        />

        <main className="map-wrapper">
          <RouteMap sidebarOpen={isSidebarOpen} routeCoords={coords} />
          //For testing and demo
          {isDev && routeMessage?.toLowerCase().includes("weather") && (
            <WeatherAlertPopup
              weatherWarnings={mockWeatherWarnings}
              samplesEvery2km={mockSamples}
              onClose={() => setRouteMessage('')}
              onRegenerate={() => {
                setCoords(null);
                setRouteMessage('');
                setActiveSidebarView('routeGenerator')
              }}
            />
          )}

          //Actual WeatherWarning
          {!isDev && weatherWarnings.length > 0 && (
            <WeatherAlertPopup
              weatherWarnings={weatherWarnings}
              samplesEvery2km={samplesEvery2km}
              onClose={() => setWeatherWarnings([])}
              onRegenerate={() => {
                setCoords(null);
                setWeatherWarnings([]);
                setActiveSidebarView('routeGenerator');
              }}
            />
          )}
        </main>
      </div>
    </>
  );
}
