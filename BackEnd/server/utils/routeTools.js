// routeGeneration Feature
//utils/routeTools.js for common fns to generate route

const { metreToDeg, rectangleCorners, haversineDistance } = require('./geoUtils');
const { snapToWalkingPath, getWalkingRoute } = require('./googleRequest');
const { isOnLand } = require('./landChecks');
const { isRouteInRestrictedArea } = require('./restrictionChecks');


//Rectangle Loop
async function snapAndRouteRectangle(start, end, dh, dw, signH, signW) {
  const rawCorners = rectangleCorners(start, dh, dw, signH, signW);
  const snappedCorners = [];

  for (const corner of rawCorners) {
    const snapped = await snapToWalkingPath(corner.lat, corner.lng);
    if (!snapped) throw new Error(`Corner at (${corner.lat}, ${corner.lng}) not walkable`);

    const dist = haversineDistance(corner, snapped);
    if (!isOnLand(snapped.lat, snapped.lng)) {
      throw new Error(`Snapped point (${snapped.lat}, ${snapped.lng}) not on land`);
    }

    snappedCorners.push(snapped);
  }

  const { coords, dist } = await getWalkingRoute(snappedCorners[0], snappedCorners[2]);

  if (isRouteInRestrictedArea(coords)) {
    throw new Error('Route enters a restricted area');
  }

  const routeGeoJSON = {
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: {
          type: 'LineString',
          coordinates: coords,
        },
      },
    ],
  };

  const actualDist = dist;
  const warningMessage = '';
  const weatherWarnings = [];
  const samplesEvery2km = [];

  return {
    geojson: routeGeoJSON,
    actualDist,
    warning: warningMessage,
    type: 'rectangle',
    weatherWarnings,
    samplesEvery2km,
    rectangleCorners: snappedCorners,
    snappedCorners,
    coords,
    dist
  };
}

async function snapRectangleLoop(start, totalM) {
  //console.log("start: ", start) //debug
  //random number btw 0.5 and 1, to get half height
  const h = ((Math.random() + 1) / 2) * (totalM / 4);
  const { dLat: dh, dLng: dw } = metreToDeg(h, start.lat);
  //console.log('Converted metres to degrees:', { h, dh, dw }); //debug


  let best = { error: Infinity, route: null };

  //double for-loop to try all 4 orientations
  for (const signH of [-1, 1]) {
    for (const signW of [-1, 1]) {
      try {
        const corners = rectangleCorners(start, dh, dw, signH, signW);
        //console.log(corners)
        const { coords, dist, snappedCorners } = await snapAndRouteRectangle(start, start, dh, dw, signH, signW);

        const error = Math.abs(dist - totalM);
        if (error < best.error) {
          //always keep track of best route seen so far
          best = { error, route: { coords, dist }, corners: snappedCorners };
        }
      } catch (e) {
        console.warn(`Orientation (${signH},${signW}) failed:`, e.message);
      }
    }
  }

  if (!best.route) throw new Error('No valid rectangle route found');
  return {
    route: best.route,
    corners: best.corners
  };
}

module.exports = {
  snapRectangleLoop
};
