// routes/geocodeRoutes.js
const express = require('express');
const router = express.Router();
const fetch = require('node-fetch');

router.get('/geocode', async (req, res) => {
  const placeName = req.query.q;
  if (!placeName) return res.status(400).json({ error: 'Missing query parameter "q"' });

  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(placeName)}`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Pathfinders App - orbitalpathfinders@gmail.com',
        'Referer': 'https://pathfinders-frontend.onrender.com'
      }
    });

    const data = await response.json();
    if (data.length === 0) return res.status(404).json({ error: 'Place not found' });

    return res.json({
      lat: parseFloat(data[0].lat),
      lng: parseFloat(data[0].lon),
    });
  } catch (err) {
    console.error('Geocode error:', err);
    return res.status(500).json({ error: 'Failed to fetch geocode data' });
  }
});


module.exports = router;
