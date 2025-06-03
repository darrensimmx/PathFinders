//BackEnd/server/utils/googleRequest.js
require('dotenv').config();
const axios = require('axios')
const GOOGLE_KEY = process.env.GOOGLE_API_KEY
const polyline = require('@mapbox/polyline');

// Get walking route with optional waypoints from API
// rtype origin: {lat, lng}
// rtype destination: {lat, lng}
// rtype waypoints: [{lat, lng}], array containing {lat, lng}
async function getWalkingRoute(origin, destination, waypoints = []) {
  try {
    const params = {
      origin: `${origin.lat},${origin.lng}`,
      destination: `${destination.lat},${destination.lng}`,
      mode: 'walking',
      key: GOOGLE_KEY
    };

    //if there are waypoints, change the waypoints to usable form of lat and lng
    //console.log(waypoints.length)
    if (waypoints.length) {
      params.waypoints = waypoints.map(p => `${p.lat},${p.lng}`).join('|');
    }

    const response = await axios.get('https://maps.googleapis.com/maps/api/directions/json', { params });

    // if no routes, then throw error to show API error
    //console.log(response.data.routes.length)
    if (!response.data.routes.length) {
      throw new Error('No route returned from Google');
    }
      

    const route = response.data.routes[0];
    //console.log(route)
    const coords = polyline.decode(route.overview_polyline.points).map(([lat, lng]) => [lng, lat]); //change coords order to make it work, not sure why lat and lng swapped in the first place
    const dist = route.legs.reduce((sum, leg) => sum + leg.distance.value, 0); //accumulate distances over an array

    return { coords, dist };
  } catch (err) {
    console.error('getWalkingRoute error:', err.message); //debug
    return null;
  }
}

// snaps any coordinate to nearest road => for corners and waypoints that are calculated and might land on non walking areas
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

    //steps is the array of walkable directions
    const steps = resp.data.routes?.[0]?.legs?.[0]?.steps;
    //handles failures in case no walkable routes, steps undefined or defined but size 0
    //console.log(steps.length)
    if (!steps || steps.length === 0) {
      console.warn(`No walkable segment found for (${lat}, ${lng})`); //debug
      return null;
    }

    // Return the actual start point of the first valid walking step
    const { start_location } = steps[0];
    return { lat: start_location.lat, lng: start_location.lng };
  } catch (err) {
    console.error(`snapToWalkingPath error for (${lat}, ${lng}):`, err.message); //debug
    return null;
  }
}


module.exports = {
  getWalkingRoute,
  snapToWalkingPath
};