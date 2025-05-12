// BackEnd/server/app.js

require('dotenv').config();
const express = require('express');
const cors    = require('cors');
const axios   = require('axios');

// Helper: haversine distance (m) between two {lat,lng}
function haversine(a, b) {
  const toRad = x => x * Math.PI / 180;
  const R = 6371000; // earth radius in m
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const φ1 = toRad(a.lat), φ2 = toRad(b.lat);
  const h = Math.sin(dLat/2)**2
          + Math.cos(φ1)*Math.cos(φ2)*Math.sin(dLng/2)**2;
  return 2*R*Math.asin(Math.sqrt(h));
}

// Bearing a→b in radians
function bearing(a, b) {
  const dLng = b.lng - a.lng, dLat = b.lat - a.lat;
  return Math.atan2(dLng, dLat);
}

const ORS_KEY = process.env.ORS_API_KEY;
if (!ORS_KEY) {
  console.error('⚠️ ORS_API_KEY missing in .env');
  process.exit(1);
}

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'OK' });
});

app.post('/api/route', async (req, res) => {
  const { start, end, distance } = req.body;
  const desiredKm = Number(distance);
  if (!start || !end || isNaN(desiredKm)) {
    return res.status(400).json({ error: 'Missing or invalid start, end or distance' });
  }

  // ORS options to avoid ferries
  const ORS_OPTS = { avoid_features: ['ferries'] };

  try {
    // 1) Direct shortest A→B
    const direct = await axios.post(
      'https://api.openrouteservice.org/v2/directions/foot-walking/geojson',
      {
        coordinates: [
          [start.lng, start.lat],
          [end.lng,   end.lat]
        ],
        options: ORS_OPTS
      },
      { headers: { Authorization: ORS_KEY } }
    );
    const directFeat = direct.data.features[0];
    const directDist = directFeat.properties.summary.distance; // meters

    // 2) If the straight-line path is already too long, return it
    if (directDist >= desiredKm * 1000) {
      return res.json({
        type:     'shortest',
        geojson:  directFeat.geometry,
        distance: directDist
      });
    }

    // 3) Compute total detour needed
    const totalDetour = desiredKm * 1000 - directDist;
    if (totalDetour > 6_000_000) {
      // ORS isochrone hard limit
      return res.json({
        type:     'shortest',
        geojson:  directFeat.geometry,
        distance: directDist,
        warning:  'Desired distance exceeds server limit; showing shortest route instead'
      });
    }

    // 4) Split into two halves
    const halfDetour = totalDetour / 2;

    // 5) Fetch two isochrone rings
    const [isoStartRes, isoEndRes] = await Promise.all([
      axios.post(
        'https://api.openrouteservice.org/v2/isochrones/foot-walking/geojson',
        { locations: [[start.lng, start.lat]], range: [Math.round(halfDetour)], range_type: 'distance' },
        { headers: { Authorization: ORS_KEY } }
      ),
      axios.post(
        'https://api.openrouteservice.org/v2/isochrones/foot-walking/geojson',
        { locations: [[end.lng,   end.lat  ]], range: [Math.round(halfDetour)], range_type: 'distance' },
        { headers: { Authorization: ORS_KEY } }
      )
    ]);

    const ringStart = isoStartRes.data.features[0].geometry.coordinates[0];
    const ringEnd   = isoEndRes.data.features[0].geometry.coordinates[0];

    // 6) Sample up to N points on each ring
    const N = 32;
    const stepS = Math.floor(ringStart.length / N) || 1;
    const stepE = Math.floor(ringEnd.length   / N) || 1;

    // 7) Find the pair (s,e) minimizing haversine(s,e)
    let bestPair = { s: null, e: null, dist: Infinity };
    for (let i = 0; i < ringStart.length; i += stepS) {
      const [lngS, latS] = ringStart[i];
      const pS = { lng: lngS, lat: latS };
      for (let j = 0; j < ringEnd.length; j += stepE) {
        const [lngE, latE] = ringEnd[j];
        const pE = { lng: lngE, lat: latE };
        const d = haversine(pS, pE);
        if (d < bestPair.dist) {
          bestPair = { s: pS, e: pE, dist: d };
        }
      }
    }

    // 8) Request a 4-point route A → viaStart → viaEnd → B
    const loop = await axios.post(
      'https://api.openrouteservice.org/v2/directions/foot-walking/geojson',
      {
        coordinates: [
          [start.lng, start.lat],
          [bestPair.s.lng, bestPair.s.lat],
          [bestPair.e.lng, bestPair.e.lat],
          [end.lng,   end.lat]
        ],
        options: ORS_OPTS
      },
      { headers: { Authorization: ORS_KEY } }
    );
    const loopFeat = loop.data.features[0];

    // 9) Return the custom route
    return res.json({
      type:     'custom',
      geojson:  loopFeat.geometry,
      distance: loopFeat.properties.summary.distance
    });

  } catch (err) {
    console.error('[/api/route] Error:', err.response?.data || err.message);
    const status  = err.response?.status || 500;
    const message = err.response?.data?.error || err.message;
    return res.status(status).json({ error: message });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server listening on http://localhost:${PORT}`);
});
