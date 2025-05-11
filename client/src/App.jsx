// client/src/App.jsx

import React, { useState } from 'react';
import { geocode } from '../utils/geocode.js';
import RouteForm from './components/RouteForm.jsx';
import RouteMap from './components/RouteMap.jsx';
import './index.css';

export default function App() {
  const [coords, setCoords] = useState(null);

  function handleGenerate({ start, end, distance }) { // omitted distance for now
    // TODO: wire up to your backend
    console.log("sent request to backend")
    console.log("⬆Sending payload:", { start, end, distance });


    fetch("http://localhost:4000/generateRoute/real", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: 
        JSON.stringify({ start, end })
      })
            .then(res => res.json())
            .then(data => {
              if (data.success) {
                console.log("Received goecodejson response from backend: ", data.geojson)
                
                //routing logic
                if ( !data.geojson ||
                  !data.geojson.features ||
                  !data.geojson.features[0] ||
                  !data.geojson.features[0].geometry ||
                  !data.geojson.features[0].geometry.coordinates) {
                  console.error("geojson or coordinates missing in response:", data);
                  return;
                }                
                const coordinates = data.geojson.features[0].geometry.coordinates;

                // debugging: to make sure it is actual route with many intermediate points (if not straight line)
                if (coordinates.length < 3) {
                  console.warn("⚠️ Possibly unrunnable route: too few points");
                }
                

                const coords = coordinates.map( // extract relevant part from geojson response
                  ([lng, lat]) => [lat, lng] // change to Leaflet format
                );
                setCoords(coords);

              } else {
                console.log("Backend rejected input: ", data.message)
              }
            })
            .catch(err => {
              console.error("Fetch failed: ", err)
            })
    console.log("handleGenerate() called") //debug
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

