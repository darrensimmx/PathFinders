// Backend/server/controllers/directRoute.js

require('dotenv').config();
const axios = require('axios');
const polyline = require('@mapbox/polyline');
const generateLoopRoute = require('./looproute');
const GOOGLE_KEY = process.env.GOOGLE_API_KEY;

// Helper function to get the walking distance between two points using Google Directions
async function getSegmentDistance(from, to) {
  const url = 'https://maps.googleapis.com/maps/api/directions/json';
  const resp = await axios.get(url, {
    params: {
      origin: `${from.lat},${from.lng}`,
      destination: `${to.lat},${to.lng}`,
      mode: 'walking',
      key: GOOGLE_KEY
    }
  });

  if (!resp.data.routes.length) {
    throw new Error('No route found for D → A segment');
  }

  return resp.data.routes[0].legs[0].distance.value; // in meters
}

// Main function to generate a custom-length point-to-point route
// Keep track of attempts and bestRoute seen so far for recusion. Don't need these in calling fn as it is defined here
// method signature of generateDirectRoute :: (start, end, distance)
async function generateDirectRoute(start, end, targetKm, attempts = 1, best = { error: Infinity, route: null }) {
  const baseM = targetKm * 1000;

  //Step 0: Check if distance input is lesser than shortest distance
  const shortestUrl = 'https://maps.googleapis.com/maps/api/directions/json';
  const shortestResp = await axios.get(shortestUrl, {
    params: {
      origin: `${start.lat},${start.lng}`,
      destination: `${end.lat},${end.lng}`,
      mode: 'walking',
      key: GOOGLE_KEY
    }
  });

  if (!shortestResp.data.routes.length) {
    throw new Error('No shortest path found from start to end');
  }

  const shortestDist = shortestResp.data.routes[0].legs[0].distance.value; // in meters

  // Step 0.5: Compare and override if needed
  let warning = null;
  if (baseM < shortestDist) {
    const raw = shortestResp.data.routes[0].overview_polyline.points;
    const latlngs = polyline.decode(raw);
    const coords = latlngs.map(([lat, lng]) => [lng, lat]);

    return {
      type: 'shortest',
      geojson: { type: 'LineString', coordinates: coords },
      distance: shortestDist,
      warning: `Minimum possible walking route is ${(shortestDist / 1000).toFixed(2)} km. Using closest available route instead.`
    };
  }

  // Step 1: Generate a loop route with corners to extract D → A
  const loopData = await generateLoopRoute(start, targetKm, { returnCorners: true });
  const { A, B, C, D } = loopData.corners;

  // Step 2: Measure distance from D → A (final leg of loop)
  const daDistance = await getSegmentDistance(D, A);

  // Step 3: Compensate distance by adding D → A to target
  const adjustedKm = targetKm + daDistance / 1000;

  // Step 4: Regenerate the loop with the longer distance
  const adjustedLoop = await generateLoopRoute(start, adjustedKm, { returnCorners: true });
  const { A: A2, B: B2, C: C2 } = adjustedLoop.corners;

  // Step 5: Build a custom direct route A → B → C → end
  const waypoints = `${B2.lat},${B2.lng}|${C2.lat},${C2.lng}`;
  const url = 'https://maps.googleapis.com/maps/api/directions/json';
  const resp = await axios.get(url, {
    params: {
      origin: `${A2.lat},${A2.lng}`,
      destination: `${end.lat},${end.lng}`,
      waypoints,
      mode: 'walking',
      key: GOOGLE_KEY
    }
  });

  if (!resp.data.routes.length) {
    throw new Error('No route found from A → B → C → end');
  }

  const raw = resp.data.routes[0].overview_polyline.points;
  const latlngs = polyline.decode(raw);
  const coords = latlngs.map(([lat, lng]) => [lng, lat]);

  const dist = resp.data.routes[0].legs.reduce((sum, leg) => sum + leg.distance.value, 0);

  const percentError = Math.abs(dist - baseM) / baseM;

  if (percentError < best.error) {
    best = {
      error: percentError,
      route: {
        type: 'custom-direct',
        geojson: { type: 'LineString', coordinates: coords },
        distance: dist,
        corners: { A: A2, B: B2, C: C2, end }
      }
    };
  }

  if (percentError > 0.2 && attempts < 3) {
    console.warn(`[Retry] Attempt ${attempts}: Distance off by ${(percentError * 100).toFixed(1)}%. Retrying...`);
    return await generateDirectRoute(start, end, targetKm, attempts + 1, best);
  }

  return best.route;
}

module.exports = generateDirectRoute;

/*
require('dotenv').config();
const axios = require('axios');
const polyline = require('@mapbox/polyline');

const GOOGLE_KEY = process.env.GOOGLE_API_KEY;

async function generateDirectRoute(start, end) {
  const originStr = `${start.lat},${start.lng}`;
  const destStr = `${end.lat},${end.lng}`;
  
  const url = 'https://maps.googleapis.com/maps/api/directions/json';

  const resp = await axios.get(url, {
    params: {
      origin: originStr,
      destination: destStr,
      mode: 'walking',
      key: GOOGLE_KEY
    }
  });

  if (!resp.data.routes.length) {
    throw new Error('No walking route found via Google Maps');
  }

  const raw = resp.data.routes[0].overview_polyline.points;
  const latlngs = polyline.decode(raw); // [[lat, lng]]
  const coords = latlngs.map(([lat, lng]) => [lng, lat]); // [lng, lat] for GeoJSON

  const dist = resp.data.routes[0].legs
    .reduce((sum, leg) => sum + leg.distance.value, 0); // in meters

  return {
    type: 'shortest',
    geojson: {
      type: 'LineString',
      coordinates: coords
    },
    distance: dist
  };
}

module.exports = generateDirectRoute;
*/