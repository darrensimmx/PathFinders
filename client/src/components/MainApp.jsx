  // components/MainApp.jsx

  import React, { useState, useEffect } from 'react';
  import Header from './Layout/Header';
  import Sidebar from './Layout/Sidebar';
  import RouteMap from '../RouteMap';
  import WeatherWarning from './WeatherWarning';
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

    //Save route feature
    const [savedRoutes, setSavedRoutes] = useState([]) // default empty arr, to track saved routes
    const [currentGeneratedRoute, setCurrentGeneratedRoute] = useState(null); //To save current route
    const accessToken = localStorage.getItem('accessToken');

    //connect to mongodb
    useEffect(() => {
      const fetchSavedRoutes = async () => {
        try {
          const res = await fetch('/api/saved-routes', {
            headers: {
              Authorization: `Bearer ${accessToken}` 
            }
          });

          if (!res.ok) throw new Error(await res.text());
          const data = await res.json();
          setSavedRoutes(data.routes);
        } catch (err) {
          console.log('MainApp.jsx=> Failed to fetch saved routes: ', err)
        }
      }

      fetchSavedRoutes();
    }, []);

    async function handleSaveRoute(route) {
      try {
        const res = await fetch('/api/saved-routes/save', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}` 
          },
          body: JSON.stringify({ route })
        });

        if (!res.ok) throw new Error(await res.text());
        console.log('Route saved successfully');

        // Optional: re-fetch all or just append
        const newRoute = { ...route, createdAt: new Date() };
        setSavedRoutes((prev) => [...prev, newRoute]);

      } catch (err) {
        console.error('Failed to save route:', err);
      }
    }

    async function handleDeleteRoute(routeId) {
      try {
        const res = await fetch(`/api/saved-routes/${routeId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        });

        if (!res.ok) throw new Error(await res.text());
        console.log('Route deleted');

        // Update local state
        setSavedRoutes(prev => prev.filter(r => r._id !== routeId));

      } catch (err) {
        console.error('Failed to delete route:', err);
      }
    }

    async function handleClearAllRoutes() {
    try {
      const res = await fetch('/api/saved-routes/clear-all', {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
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
        //console.log("Sending payload:", payload);


        const res = await fetch('http://localhost:4000/api/route', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        
        const apiResponse = await res.json();
        //console.log("Full API response:", apiResponse);
        if (!res.ok || apiResponse.success === false)  {
          throw new Error(await res.text() || "Request failed.");
        }

        //console.log("APIResponse.geoJson is: ", apiResponse.geojson)
        const geoJson = apiResponse.geojson
        if (!geoJson || !Array.isArray(geoJson.coordinates)) {
          console.error("Invalid geojson in response:", geoJson);
          throw new Error("Server returned invalid route coordinates.");
        }

        const { type, warning, actualDist } = apiResponse;
        //console.log("Parsed route:", { actualDist, type, warning });

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
        
        
        //To store the route if needed
        setCurrentGeneratedRoute({
          name: routeType === 'loop'
          ? `Loop around ${startInput}`
          : `Route from ${startInput} to ${endInput}`,
          distance: Number(distKm),
          coordinates: geoJson.coordinates,
          startPoint: { type: 'Point', coordinates: [start.lng, start.lat]  },
          endPoint: {type: 'Point', coordinates: routeType === 'loop' 
                                                              ? [start.lng, start.lat]
                                                              : [end.lng, end.lat]
          },
        });
        //console.log("reached here")
        
        
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
            handleSaveRoute={handleSaveRoute}
            routes={savedRoutes}
            onDeleteRoute={handleDeleteRoute}
            onClearAll={handleClearAllRoutes}
            currentGeneratedRoute={currentGeneratedRoute}
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
