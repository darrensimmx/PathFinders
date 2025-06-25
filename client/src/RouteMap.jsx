import React, { useState } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  Popup,
  useMapEvents
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import InvalidateMapSizeHandler from '../utils/useInvalidateMapSize';

export default function RouteMap({
  routeCoords,
  samplesEvery2km,
  weatherWarnings,
  sidebarOpen
}) {
  const center = routeCoords?.[0] || [1.3521, 103.8198];
  const [clickPos, setClickPos] = useState(null);
  const [clickInfo, setClickInfo] = useState(null);

  function ClickHandler() {
    useMapEvents({
      click: async e => {
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
        style={{ width: '100%', height: '100%', position: 'relative' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="&copy; OpenStreetMap contributors"
        />

        <InvalidateMapSizeHandler trigger={sidebarOpen} />
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

            {/* Draw each 2 km segment, red if that segment has any badHours */}
            {(() => {
              if (!samplesEvery2km?.length) {
                return (
                  <Polyline
                    positions={routeCoords}
                    pathOptions={{ color: 'blue', weight: 4 }}
                  />
                );
              }

              // Build break indices
              const breakIdx = samplesEvery2km
                .map(pt =>
                  routeCoords.findIndex(
                    ([lat, lng]) => lat === pt.lat && lng === pt.lng
                  )
                )
                .filter(i => i >= 0);

              const cutPoints = [
                0,
                ...breakIdx.map(i => i + 1),
                routeCoords.length
              ];

              const goodCols = [
                '#2ECC71',
                '#3498DB',
                '#F1C40F',
                '#9B59B6',
                '#E67E22'
              ];

              return cutPoints.slice(0, -1).map((start, i) => {
                const end = cutPoints[i + 1];
                const segment = routeCoords.slice(start, end);
                const hasBad =
                  weatherWarnings?.[i]?.badHours?.length > 0;
                const color = hasBad ? 'red' : goodCols[i % goodCols.length];

                return (
                  <Polyline
                    key={i}
                    positions={segment}
                    pathOptions={{ color, weight: 4 }}
                  />
                );
              });
            })()}
          </>
        )}
      </MapContainer>
    </div>
  );
}
