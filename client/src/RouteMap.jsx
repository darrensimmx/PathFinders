import React, { useState } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  Popup,
  Tooltip,
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
        // slow zoom increments: half-step for controls, double px needed per wheel level
        zoomDelta={0.5}
        wheelPxPerZoomLevel={120}
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
                  <Polyline positions={routeCoords} pathOptions={{ color: 'blue', weight: 4 }}>
                    <Tooltip sticky direction="auto">Section 1</Tooltip>
                  </Polyline>
                );
              }

              // 10 distinct non-warm colors for normal segments
              const goodCols = [
                '#2ECC71', // green
                '#3498DB', // light blue
                '#9B59B6', // purple
                '#1ABC9C', // turquoise
                '#34495E', // dark slate
                '#27AE60', // dark green
                '#8E44AD', // dark purple
                '#2980B9', // dark blue
                '#16A085', // teal
                '#7F8C8D'  // gray
              ];
              // 10 much darker red shades for clear visibility
              const redShades = ['#CC0000','#B30000','#990000','#800000','#660000','#4D0000','#330000','#1A0000','#110000','#080000'];
               // Build break indices by nearest-match to avoid precision mismatches
              const breakIdx = samplesEvery2km.map(pt => {
                let bestIdx = 0;
                let bestDist = Infinity;
                routeCoords.forEach(([lat, lng], idx) => {
                  const d = Math.hypot(lat - pt.lat, lng - pt.lng);
                  if (d < bestDist) { bestDist = d; bestIdx = idx; }
                });
                return bestIdx;
              });
              // Remove duplicates and sort
              const uniqueIdx = [...new Set(breakIdx)].sort((a, b) => a - b);
              // Define segment boundaries (include last point index)
              const cutPoints = [0, ...uniqueIdx, routeCoords.length - 1];

              return cutPoints.map((start, i) => {
                const end = cutPoints[i + 1];
                if (end == null) return null;
                const segment = routeCoords.slice(start, end + 1);
                const hasBad = weatherWarnings?.[i]?.badHours?.length > 0;
                // alternate red shades from ends inward: 1->0, 2->9, 3->1, 4->8, etc.
                let color;
                if (hasBad) {
                  const idx = i;
                  // alternate shades: 1st(light), 2nd(dark), 3rd(2nd light), 4th(2nd dark), etc., then wrap
                  const half = redShades.length / 2;
                  let shadeIndex;
                  if (idx % 2 === 0) shadeIndex = idx / 2;
                  else shadeIndex = half + Math.floor((idx - 1) / 2);
                  // wrap index if exceeds available shades
                  shadeIndex = shadeIndex % redShades.length;
                  color = redShades[shadeIndex];
                } else {
                  color = goodCols[i % goodCols.length];
                }
                return (
                  <Polyline key={i} positions={segment} pathOptions={{ color, weight: 4 }}>
                    <Tooltip sticky direction="auto">Section {i + 1}</Tooltip>
                  </Polyline>
                );
              }).filter(Boolean);
            })()}
          </>
        )}
      </MapContainer>
    </div>
  );
}