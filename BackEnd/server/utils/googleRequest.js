//BackEnd/server/utils/googleRequest.js
require('dotenv').config();
const axios = require('axios')
const GOOGLE_KEY = process.env.GOOGLE_API_KEY
const polyline = require('@mapbox/polyline');

/**
 * Get walking route with optional waypoints from Google Directions API.
 * @param {Object} origin - { lat, lng }
 * @param {Object} destination - { lat, lng }
 * @param {Array} [waypoints=[]] - Optional array of { lat, lng } waypoints
 */
async function getWalkingRoute(origin, destination, waypoints = []) {
  try {
    const params = {
      origin: `${origin.lat},${origin.lng}`,
      destination: `${destination.lat},${destination.lng}`,
      mode: 'walking',
      key: GOOGLE_KEY
    };

    if (waypoints.length) {
      params.waypoints = waypoints.map(p => `${p.lat},${p.lng}`).join('|');
    }

    const resp = await axios.get('https://maps.googleapis.com/maps/api/directions/json', { params });
    //console.log("ans: ",JSON.stringify(resp.data, null, 2)); // Pretty print

    if (!resp.data.routes.length) throw new Error('No route returned from Google');

    const route = resp.data.routes[0];
    const coords = polyline.decode(route.overview_polyline.points).map(([lat, lng]) => [lng, lat]);
    const dist = route.legs.reduce((sum, leg) => sum + leg.distance.value, 0);
    const warnings = route.warnings || [];

    return { coords, dist, warnings };
  } catch (err) {
    console.error('getWalkingRoute error:', err.message);
    return null;
  }
}

// snaps any coordinate to nearest road
async function snapToWalkingPath(lat, lng) {
  const pointStr = `${lat},${lng}`;

  // Sends a GET request to the API to find nearest walking path based on coords
  try {
    const resp = await axios.get('https://maps.googleapis.com/maps/api/directions/json', {
      params: {
        origin: pointStr,
        destination: pointStr,
        mode: 'walking',
        key: GOOGLE_KEY
      }
    });

    //steps is array of walkable directions
    const steps = resp.data.routes?.[0]?.legs?.[0]?.steps;
    //handles failures in case no walkable routes
    if (!steps || steps.length === 0) {
      console.warn(`No walkable segment found for (${lat}, ${lng})`);
      return null;
    }

    // Return the actual start point of the first valid walking step
    const { start_location } = steps[0];
    return { lat: start_location.lat, lng: start_location.lng };
  } catch (err) {
    console.error(`snapToWalkingPath error for (${lat}, ${lng}):`, err.message);
    return null;
  }
}


module.exports = {
  getWalkingRoute,
  snapToWalkingPath
};