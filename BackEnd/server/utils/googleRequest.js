require('dotenv').config();
const fetch = require('node-fetch');

async function geocodeLocation(query) {
  const apiKey = process.env.OPENCAGE_API_KEY;
  // limit=1 restricts to one entry only, and country to singapore
  const url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(query)}&key=${apiKey}&limit=1&countrycode=sg`; 

  try {
    const response = await fetch(url);
    if (!response.ok) {
      console.error("Geocoding API failed with status:", response.status);
      return null; // return null to pass forward to frontend to use
    }
  
    const data = await response.json();
    if (data.results.length === 0) {
      console.warn(`No geocoding results found for "${query}"`);
      return null; // return null to pass forward to frontend to use
    }
  
    const { lat, lng } = data.results[0].geometry;
    return [lng, lat]; // OpenRouteService uses [lng, lat]
  } catch (err) {
    console.error("Geocoding exception:", err.message);
    return null; // return null to pass forward to frontend to use
  }
}

module.exports = geocodeLocation;