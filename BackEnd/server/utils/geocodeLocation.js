require('dotenv').config();
const fetch = require('node-fetch');

async function geocodeLocation(query) {
  const apiKey = process.env.OPENCAGE_API_KEY;
  // limit=1 restricts to one entry only
  const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(query)}&key=${apiKey}&limit=1`; 

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Geocoding API failed');
  }

  const data = await response.json();
  if (data.results.length === 0) {
    throw new Error('No results found');
  }

  const { lat, lng } = data.results[0].geometry;
  return [lng, lat]; // OpenRouteService uses [lng, lat]
}

module.exports = geocodeLocation;