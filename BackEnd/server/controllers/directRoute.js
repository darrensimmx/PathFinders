// Backend/server/controllers/directRoute.js
// Controller for routeGeneration feature generation

require('dotenv').config();
const generateLoopRoute = require('./looproute');
const { getWalkingRoute } = require('../utils/googleRequest');


// Main function to generate a custom-length point-to-point route
// Keep track of attempts and bestRoute seen so far for recusion. Don't need these in calling fn as it is defined here
// method signature of generateDirectRoute :: (start, end, distance)
async function generateDirectRoute(start, end, targetKm, attempts = 1, best = { error: Infinity, route: null }) {
  const baseM = targetKm * 1000;

  //Step 0: Check if distance input is lesser than shortest distance
  const shortest = await getWalkingRoute(start, end);
  if (!shortest || shortest.error || !shortest.coords) {
    throw new Error('Google API failed to return a valid shortest route');
  }

  const { dist: shortestDist, coords: shortestCoords } = shortest;

  // Step 0.5: Compare and override if needed
  let warning = null;
  if (baseM < shortestDist) {
    return {
      type: 'shortest',
      geojson: { type: 'LineString', coordinates: shortestCoords },
      distance: shortestDist,
      warning: `Minimum possible walking route is ${(shortestDist / 1000).toFixed(2)} km. Using closest available route instead.`
    };
  }

  // Step 1: Generate a loop route with corners to extract D - A
  const loopData = await generateLoopRoute(start, targetKm, { returnCorners: true });
  const { A, B, C, D } = loopData.corners;

  // Step 2: Measure distance from D - A (final leg of loop)
  const daSegment = await getWalkingRoute(D, A);
  if (!daSegment || daSegment.error || !daSegment.dist) {
    throw new Error('Failed to calculate D - A distance');
  }

  // Step 3: Compensate distance by adding D - A to target
  const adjustedKm = targetKm + daSegment.dist / 1000;

  // Step 4: Regenerate the loop with the longer distance
  const adjustedLoop = await generateLoopRoute(start, adjustedKm, { returnCorners: true });
  console.log("adjusted loop: ", adjustedLoop)
  const { A: A2, B: B2, C: C2 } = adjustedLoop.corners;

  // Step 5: Build a custom direct route A - B - C - end
  const custom = await getWalkingRoute(A2, end, [B2, C2]);
  if (!custom || custom.error || !custom.coords) {
    throw new Error('Failed to generate adjusted A - B - C - End route');
  }


  //Step 6: Compare how close this route is to desired distance
  const percentError = Math.abs(custom.dist - baseM) / baseM;

  if (percentError < best.error) {
    best = {
      error: percentError,
      route: {
        type: 'custom-direct',
        geojson: { type: 'LineString', coordinates: custom.coords },
        distance: custom.dist,
        corners: { A: A2, B: B2, C: C2, end }
      }
    };
  }

  //Retry if still significantly off
  if (percentError > 0.2 && attempts < 3) {
    console.warn(`[Retry] Attempt ${attempts}: Distance off by ${(percentError * 100).toFixed(1)}%. Retrying...`);
    return await generateDirectRoute(start, end, targetKm, attempts + 1, best);
  }

  return best.route;
}

module.exports = generateDirectRoute;
