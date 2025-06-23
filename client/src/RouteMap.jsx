// client/src/components/RouteMap.jsx

import React, { useState } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  Popup,
  useMapEvents
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';  // ensure leaflet styles are applied

export default function RouteMap({ routeCoords }) {
  const center = routeCoords?.[0] || [1.3521, 103.8198];
  const [clickPos, setClickPos] = useState(null);
  const [clickInfo, setClickInfo] = useState(null);

  function ClickHandler() {
    useMapEvents({
      click: async (e) => {
        const { lat, lng } = e.latlng;
        setClickPos([lat, lng]);
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
          );
          const data = await res.json();
          const { postcode, road } = data.address || {};
          setClickInfo({ postcode, road });
        } catch {
          setClickInfo({ postcode: null, road: null });
        }
      }
    });
    return null;
  }

  return (
    <MapContainer
      center={center}
      zoom={13}
      scrollWheelZoom={true}
      style={{
        position: 'absolute',
        top: 0, bottom: 0, left: 0, right: 0
      }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />

      <ClickHandler />

      {clickPos && clickInfo && (
        <Marker position={clickPos}>
          <Popup>
            {clickInfo.road && <div>{clickInfo.road}</div>}
            {clickInfo.postcode && <div>{clickInfo.postcode}</div>}
          </Popup>
        </Marker>
      )}

      {routeCoords && (
        <>
          <Marker position={routeCoords[0]} />
          <Marker position={routeCoords[routeCoords.length - 1]} />
          <Polyline positions={routeCoords} weight={4} />
        </>
      )}
    </MapContainer>
  );
}

