// server/controllers/generateDirectRoute.js

const axios = require('axios');
require('dotenv').config();
const ORS_KEY = process.env.ORS_API_KEY;

async function generateDirectRoute(start, end) {
  const url = 'https://api.openrouteservice.org/v2/directions/foot-walking/geojson';

  console.log('📦 Sending to ORS:', {
    coordinates: [[start.lng, start.lat], [end.lng, end.lat]]
  });
  const res = await axios.post(
    url,
    { coordinates: [[start.lng, start.lat], [end.lng, end.lat]] },
    { headers: { Authorization: ORS_KEY } }
  );
  const feat = res.data.features[0];
  return {
    type: 'shortest',
    geojson: feat.geometry,
    distance: feat.properties.summary.distance
  };
}

module.exports = generateDirectRoute;
