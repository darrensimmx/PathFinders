// client/src/components/MainApp.jsx

import React, { useState, useEffect } from 'react';
import Header from './Layout/Header';
import Sidebar from './Layout/Sidebar';
import RouteMap from '../RouteMap';
import WeatherAlertPopup from './WeatherAlertPopUp';
import './Layout/Layout.css';
import { geocodePlace } from '../../utils/geocode';

export default function MainApp() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeSidebarView, setActiveSidebarView] = useState('navigation');

  const [coords, setCoords] = useState(null);
  const [routeDistance, setRouteDistance] = useState(null);
  const [routeMessage, setRouteMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');

  const [savedRoutes, setSavedRoutes] = useState([]);
  const [currentGeneratedRoute, setCurrentGeneratedRoute] = useState(null);
  const [user, setUser] = useState(null);
  const [weatherWarnings, setWeatherWarnings] = useState([]);
  const [samplesEvery2km, setSamplesEvery2km] = useState([]);
  const [waypointMarkers, setWaypointMarkers] = useState([]);

  const [lastGenerateArgs, setLastGenerateArgs] = useState(null);
  const [popupVisible, setPopupVisible] = useState(false);

  const accessToken = localStorage.getItem('accessToken');

  // Fetch saved routes
  useEffect(() => {
    const fetchSavedRoutes = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/saved-routes`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!res.ok) throw new Error(await res.text());
        const data = await res.json();
        setSavedRoutes(data.routes);
      } catch (err) {
        console.log('Failed to fetch saved routes:', err);
      }
    };
    if (accessToken) fetchSavedRoutes();
  }, [accessToken]);

  // Fetch user info
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/me`, {
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
      const res = await fetch(`${import.meta.env.VITE_API_URL}/saved-routes/save`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ route }),
      });

      if (!res.ok) throw new Error(await res.text());
      const saved = await res.json();
      const newRoute = { ...route, _id: saved._id, createdAt: new Date() };
      setSavedRoutes((prev) => [...prev, newRoute]);
      setSuccess('Route saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
      setError('');
    } catch (err) {
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
      const res = await fetch(`${import.meta.env.VITE_API_URL}/saved-routes/${routeId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) throw new Error(await res.text());
      setSavedRoutes((prev) => prev.filter((r) => r._id !== routeId));
    } catch (err) {
      console.error('Failed to delete route:', err);
    }
  }

  async function handleClearAllRoutes() {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/saved-routes/clear-all`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      if (!res.ok) throw new Error(await res.text());
      setSavedRoutes([]);
    } catch (err) {
      console.error('Failed to clear all routes:', err);
    }
  }

  async function handleGenerate(formData, filters) {
    setLastGenerateArgs({ formData, filters });

    setLoading(true);
    setError(null);
    setRouteMessage('');
    setCoords(null);
    setRouteDistance(null);
    setWeatherWarnings([]);
    setSamplesEvery2km([]);
    setPopupVisible(false);
    setWaypointMarkers([]);

    try {
      const start = await geocodePlace(formData.start);
      const end = formData.routeType !== 'loop' ? await geocodePlace(formData.end) : null;
      let waypointCoords = [];
      if (formData.waypoints && Array.isArray(formData.waypoints)) {
        // Geocode each waypoint address (postal codes included if geocoding supports)
        const rawCoords = await Promise.all(
          formData.waypoints.map(addr => geocodePlace(addr))
        );
        const validCoords = rawCoords.filter(c => c && typeof c.lat === 'number' && typeof c.lng === 'number');
        if (validCoords.length < rawCoords.length) {
          // notify user some waypoints failed to geocode
          alert('Some waypoints could not be found and will be ignored.');
        }
        waypointCoords = validCoords;
        setWaypointMarkers(validCoords.map(pt => [pt.lat, pt.lng]));
      }

      const payload = {
        start,
        ...(end && { end }),
        distance: formData.distance,
        routeType: formData.routeType,
        ...(waypointCoords.length > 0 && { waypoints: waypointCoords }),
        filters,
      };

      const res = await fetch(`${import.meta.env.VITE_API_URL}/route`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
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
        samplesEvery2km: s2k,
      } = apiRes;

      setWeatherWarnings(ww || []);
      setSamplesEvery2km(s2k || []);
      setPopupVisible(true); // show weather popup after generation

      const latLngs = geojson.coordinates.map(([lng, lat]) => [lat, lng]);
      setCoords(latLngs);
      setRouteDistance(actualDist);

      const km = (actualDist / 1000).toFixed(2);
      let msg;
      if (warning) msg = warning;
      else if (type === 'shortest') msg = `Shortest route is ${km} km`;
      else if (formData.routeType === 'loop') msg = `Generated a ${km} km loop`;
      else msg = `Generated a ${km} km route`;
      setRouteMessage(msg);

      setCurrentGeneratedRoute({
        name: formData.routeType === 'loop'
          ? `Loop around ${formData.start}`
          : `Route from ${formData.start} to ${formData.end}`,
        distance: actualDist,
        coordinates: geojson.coordinates,
        startPoint: { type: 'Point', coordinates: [start.lng, start.lat] },
        endPoint: formData.routeType === 'loop'
          ? { type: 'Point', coordinates: [start.lng, start.lat] }
          : { type: 'Point', coordinates: [end.lng, end.lat] },
      });
    } catch (e) {
      setError(`Route generation failed: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  function handleSelectRoute(route) {
    if (!route?.coordinates) return;
    setCoords(route.coordinates.map(([lng, lat]) => [lat, lng]));
    setRouteMessage(`Showing saved route: ${route.name}`);
    setRouteDistance(route.distance);
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
          success={success}
          handleSaveRoute={handleSaveRoute}
          routes={savedRoutes}
          onDeleteRoute={handleDeleteRoute}
          onClearAll={handleClearAllRoutes}
          currentGeneratedRoute={currentGeneratedRoute}
          onSelectRoute={handleSelectRoute}
          user={user}
        />

        <main className="map-wrapper flex-1 relative">
          <RouteMap
            sidebarOpen={isSidebarOpen}
            routeCoords={coords}
            samplesEvery2km={samplesEvery2km}
            weatherWarnings={weatherWarnings}
            waypoints={waypointMarkers}
          />

          {popupVisible && (
            <div className="absolute bottom-4 left-0 right-0 flex justify-center z-[9999] px-4">
              <WeatherAlertPopup
                weatherWarnings={weatherWarnings}
                samplesEvery2km={samplesEvery2km}
                onClose={() => setPopupVisible(false)}
                onRegenerate={() => {
                  setPopupVisible(false);
                  if (lastGenerateArgs) {
                    handleGenerate(lastGenerateArgs.formData, lastGenerateArgs.filters);
                  }
                }}
              />
            </div>
          )}
        </main>
      </div>
    </>
  );
}
