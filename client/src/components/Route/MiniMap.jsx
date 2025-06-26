import { MapContainer, TileLayer, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export default function MiniMap({ coordinates }) {
  if (!coordinates || coordinates.length === 0) return null;

  const latLngs = coordinates.map(([lng, lat]) => [lat, lng]);

  const bounds = latLngs.reduce(
    ([min, max], [lat, lng]) => [
      [Math.min(min[0], lat), Math.min(min[1], lng)],
      [Math.max(max[0], lat), Math.max(max[1], lng)],
    ],
    [latLngs[0], latLngs[0]]
  );

  return (
    <MapContainer
      bounds={bounds}
      style={{ height: '120px', width: '100%', borderRadius: '8px' }}
      zoomControl={false}
      dragging={false}
      doubleClickZoom={false}
      scrollWheelZoom={false}
      attributionControl={false}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Polyline positions={latLngs} color="#ff6ec7" weight={4} />
    </MapContainer>
  );
}
