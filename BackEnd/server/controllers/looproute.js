//Backend/server/controllers/loopRoute.js

const axios = require('axios')
require('dotenv').config();
const ORS_KEY = process.env.ORS_API_KEY;

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
  return [A, B, C, D, A];
}

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
  
module.exports = generateLoopRoute;