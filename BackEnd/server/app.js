// BackEnd/server/app.js

require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const axios   = require('axios');

const ORS_KEY = process.env.ORS_API_KEY;
if (!ORS_KEY) {
  console.error('ERROR: ORS_API_KEY not set in .env');
  process.exit(1);
}

const app = express();
app.use(cors());
app.use(express.json());

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

// Route endpoint: picks the best-oriented rectangle
app.post('/api/route', async (req, res) => {
  try {
    const { start, end, distance } = req.body;
    const km = Number(distance);
    if (!start || !end || isNaN(km)) {
      return res.status(400).json({ error: 'Missing or invalid start, end, or distance' });
    }

    const totalM = km * 1000;
    // determine h and w once per run
    const p = totalM;
    const rand = (Math.random() + 1) / 2;
    const h = rand * (p / 4);
    const w = p / 2 - h;
    const { dLat: dh, dLng: dw } = metreToDeg(h, start.lat);

    let best = { error: Infinity, route: null };
    // try all four sign combinations
    for (const signH of [-1, 1]) {
      for (const signW of [-1, 1]) {
        const corners = rectangleCorners(start, dh, dw, signH, signW);
        let coordsAccum = [];
        let distAccum = 0;
        // snap each of the four sides
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

    return res.json({
      type: 'rect-loop',
      geojson: { type: 'LineString', coordinates: best.route.coords },
      distance: best.route.dist
    });

  } catch (err) {
    console.error('[/api/route] error:', err.response?.data || err.message);
    const status = err.response?.status || 500;
    const message = err.response?.data?.error || err.message;
    return res.status(status).json({ error: message });
  }
});

// Health check
app.get('/api/health', (_req, res) => res.json({ status: 'OK' }));

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`🚀 Server listening on http://localhost:${PORT}`));
