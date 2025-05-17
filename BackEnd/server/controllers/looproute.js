//Backend/server/controllers/loopRoute.js

require('dotenv').config();
const axios = require('axios');
const polyline = require('@mapbox/polyline');
const GOOGLE_KEY = process.env.GOOGLE_API_KEY;
//const ORS_KEY = process.env.ORS_API_KEY; no longer in use

// Convert metres to degrees latitude/longitude at a given latitude
function metreToDeg(m, lat) {
  const latConv = 111132.92 - 559.82 * Math.cos(2 * lat * Math.PI / 180);
  const lngConv = 111412.84 * Math.cos(lat * Math.PI / 180);
  return { dLat: m / latConv, dLng: m / lngConv };
}

// Build rectangle corners for given h, w, and sign offsets
function rectangleCorners(origin, dh, dw, signH, signW) {
  const A = { ...origin };
  const B = { lat: origin.lat + dh * signH, lng: origin.lng };
  const C = { lat: B.lat,           lng: origin.lng + dw * signW };
  const D = { lat: origin.lat,      lng: origin.lng + dw * signW };
  return [A, B, C, D];
}

async function snapLoop(start, end, dh, dw, signH, signW) {
  const corners = rectangleCorners(start, dh, dw, signH, signW);
  const originStr = `${start.lat},${start.lng}`;
  const destStr   = `${end.lat},${end.lng}`;
  const waypoints = corners.slice(1).map(c => `${c.lat},${c.lng}`).join('|');

  const url = 'https://maps.googleapis.com/maps/api/directions/json';
  const resp = await axios.get(url, {
    params: {
      origin: originStr,
      destination: destStr,
      waypoints,
      mode: 'walking',
      key: GOOGLE_KEY
    }
  });

  if (!resp.data.routes.length) {
    throw new Error('No route from Google');
  }

  const raw = resp.data.routes[0].overview_polyline.points;
  const latlngs = polyline.decode(raw); // [[lat, lng], ...]
  const coords = latlngs.map(([lat, lng]) => [lng, lat]);

  const dist = resp.data.routes[0].legs
    .reduce((sum, leg) => sum + leg.distance.value, 0);

  return { coords, dist };
}

async function generateLoopRoute(start, distance, options = {}) { //added returnCorners for any fn that needs loop to do that
  const totalM = distance * 1000;
  const h = ((Math.random() + 1) / 2) * (totalM / 4);
  const w = totalM / 2 - h;
  const { dLat: dh, dLng: dw } = metreToDeg(h, start.lat);

  let best = { error: Infinity, route: null };

  for (const signH of [-1, 1]) {
    for (const signW of [-1, 1]) {
      try {
        const corners = rectangleCorners(start, dh, dw, signH, signW);
        const { coords, dist } = await snapLoop(start, start, dh, dw, signH, signW);
        const error = Math.abs(dist - totalM);
        if (error < best.error) {
          best = { error, route: { coords, dist }, corners };
        }
      } catch (e) {
        console.warn(`Orientation (${signH},${signW}) failed:`, e.message);
      }
    }
  }

  if (!best.route) {
    throw new Error('No valid rectangle route found');
  }

  const [A, B, C, D] = best.corners || [];
  //console.log("corners are:", A, B, C, D)
  return {
    type: 'rect-loop',
    geojson: { type: 'LineString', coordinates: best.route.coords },
    distance: best.route.dist,
            ...(options?.returnCorners && {corners: {A, B, C, D}})
  };
}

module.exports = generateLoopRoute;


/* this is old API call for openRouteAPI
// Snap a segment via ORS and return { coords, dist }
async function snapSegment(a, b) {
  const url = 'https://api.openrouteservice.org/v2/directions/foot-walking/geojson';
  const resp = await axios.post(
    url,
    { coordinates: [[a.lng, a.lat], [b.lng, b.lat]] },
    { headers: { Authorization: ORS_KEY } }
  );
  const feat = resp.data.features[0];
  return { coords: feat.geometry.coordinates, dist: feat.properties.summary.distance };
}
//This is the exported function to be called in route.js
async function generateLoopRoute(start, distance) {
    const totalM = distance * 1000;
    const r = 0.75;
    const w = totalM / (2 * (r + 1));
    const h = r * w;
    const { dLat: dh, dLng: dw } = metreToDeg(h, start.lat);
  
    let best = { error: Infinity, route: null };
  
    for (const signH of [-1, 1]) {
      for (const signW of [-1, 1]) {
        const corners = rectangleCorners(start, dh, dw, signH, signW);
        let coordsAccum = [];
        let distAccum = 0;
        for (let i = 0; i < 4; i++) {
          const snap = await snapSegment(corners[i], corners[i + 1]);
          coordsAccum = coordsAccum.concat(snap.coords);
          distAccum += snap.dist;
        }
        const error = Math.abs(distAccum - totalM);
        if (error < best.error) {
          best = { error, route: { coords: coordsAccum, dist: distAccum } };
        }
      }
    }
  
    if (!best.route) {
      throw new Error('Failed to generate any valid rectangle route');
    }
  
    return {
      type: 'rect-loop',
      geojson: { type: 'LineString', coordinates: best.route.coords },
      distance: best.route.dist
    };
  }
*/