import React from 'react';
import { MapContainer, TileLayer, Marker, Polyline } from 'react-leaflet';

export default function RouteMap({ routeCoords }) {
  const center = routeCoords?.[0] || [1.3521, 103.8198];

  return (
    <MapContainer
      center={center}
      zoom={13}
      scrollWheelZoom={true}
      /* absolutely fill the parent .map-wrapper */
      style={{
        position: 'absolute',
        top: 0, bottom: 0, left: 0, right: 0
      }}
    >
      {/* Use free OSM tiles so you don’t need an API key */}
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />

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

