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
import InvalidateMapSizeHandler from '../utils/useInvalidateMapSize';


export default function RouteMap({ routeCoords, sidebarOpen }) {
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
    <div className="map">
      <MapContainer
      center={center}
      zoom={13}
      scrollWheelZoom={true}
      style={{
        width: '100%',
        height: '100%',
        position: "relative"
      }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />

      <InvalidateMapSizeHandler trigger={sidebarOpen}/>

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
    </div>
  );
}

