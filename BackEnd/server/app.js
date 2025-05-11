// BackEnd/server/app.js

// Load environment variables from .env
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const axios = require('axios');
// If you have additional route handlers in routes/route.js, uncomment below:
const routeRouter = require('./routes/route');

const app = express();
const PORT = process.env.PORT || 4000;

// Middleware
app.use(cors());
app.use(express.json());

// Health-check endpoint
app.get('/api/health', (_req, res) => {
  res.json({ status: 'OK' });
});

// Route-generation endpoint
app.post('/api/route', async (req, res) => {
  const { start, end, distance } = req.body;
  if (!start || !end || !distance) {
    return res.status(400).json({ error: 'Missing start, end or distance' });
  }

  try {
    const orsRes = await axios.post(
      'https://api.openrouteservice.org/v2/directions/foot-walking/geojson',
      {
        coordinates: [
          [start.lng, start.lat],
          [end.lng,   end.lat  ]
        ]
      },
      {
        headers: {
          Authorization: process.env.ORS_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );

    const feature = orsRes.data.features[0];
    const actualDist = feature.properties.summary.distance;

    return res.json({
      geojson: feature.geometry,
      distance: actualDist
    });
  } catch (err) {
    console.error(err.response?.data || err.message);
    return res.status(500).json({ error: 'Routing failed' });
  }
});

// If you have routers defined in ./routes/route.js, you can mount them:
app.use('/generateRoute', routeRouter);

// Start the server\app.listen(PORT, () => {
app.listen(PORT, () => {
  console.log(`🚀 Server listening on http://localhost:${PORT}`);
});
