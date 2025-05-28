//utils/routeTools.js for common fns to generate route

const axios = require('axios');
const polyline = require('@mapbox/polyline');
const { metreToDeg, rectangleCorners, haversineDistance } = require('./geoUtils');
const { snapToWalkingPath } = require('./googleRequest');
const { isOnLand } = require('./landChecks');
const GOOGLE_KEY = process.env.GOOGLE_API_KEY;

//Rectangle Loop
async function snapAndRouteRectangle(start, end, dh, dw, signH, signW) {
  const rawCorners = rectangleCorners(start, dh, dw, signH, signW);

  const snappedCorners = [];
  for (const corner of rawCorners) {
    const snapped = await snapToWalkingPath(corner.lat, corner.lng);
    if (!snapped) throw new Error(`Corner at (${corner.lat}, ${corner.lng}) not walkable`);

    const dist = haversineDistance(corner, snapped);
    if (dist > 200) throw new Error(`Snapped point too far (${dist.toFixed(0)}m)`);

    if (!isOnLand(snapped.lat, snapped.lng)) {
      throw new Error(`Snapped point (${snapped.lat}, ${snapped.lng}) not on land`);
    }

    snappedCorners.push(snapped);
  }

  const originStr = `${start.lat},${start.lng}`;
  const destStr = `${end.lat},${end.lng}`;
  const waypoints = snappedCorners.slice(1).map(c => `${c.lat},${c.lng}`).join('|');

  const url = 'https://maps.googleapis.com/maps/api/directions/json';
  const resp = await axios.get(url, {
    params: {
      origin: originStr,
      destination: destStr,
      waypoints,
      mode: 'walking',
      key: GOOGLE_KEY,
    }
  });

  if (!resp.data.routes.length) {
    throw new Error('No route from Google');
  }

  const raw = resp.data.routes[0].overview_polyline.points;
  const latlngs = polyline.decode(raw);
  const coords = latlngs.map(([lat, lng]) => [lng, lat]);

  const dist = resp.data.routes[0].legs.reduce((sum, leg) => sum + leg.distance.value, 0);

  return { coords, dist };
}

async function snapRectangleLoop(start, totalM) {
  const h = ((Math.random() + 1) / 2) * (totalM / 4);
  const { dLat: dh, dLng: dw } = metreToDeg(h, start.lat);

  let best = { error: Infinity, route: null };

  for (const signH of [-1, 1]) {
    for (const signW of [-1, 1]) {
      try {
        const corners = rectangleCorners(start, dh, dw, signH, signW);
        console.log(corners)
        const { coords, dist } = await snapAndRouteRectangle(start, start, dh, dw, signH, signW);

        const error = Math.abs(dist - totalM);
        if (error < best.error) {
          best = { error, route: { coords, dist }, corners };
        }
      } catch (e) {
        console.warn(`Orientation (${signH},${signW}) failed:`, e.message);
      }
    }
  }

  if (!best.route) throw new Error('No valid rectangle route found');
  return best;
}

module.exports = {
  snapRectangleLoop
};
