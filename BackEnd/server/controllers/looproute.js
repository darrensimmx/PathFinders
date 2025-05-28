//Backend/server/controllers/loopRoute.js

require('dotenv').config();
// might want to include more shapes for better distance accuracy
// Figure 8, triangle, circle
const { snapRectangleLoop } = require('../utils/routeTools')


async function generateLoopRoute(start, distance, options = {}) {
  const totalM = distance * 1000;

  const { route, corners } = await snapRectangleLoop(start, totalM);  // simplified!

  const [A, B, C, D] = corners || [];
  return {
    type: 'rect-loop',
    geojson: { type: 'LineString', coordinates: route.coords },
    distance: route.dist,
    ...(options?.returnCorners && { corners: { A, B, C, D } })
  };
}



module.exports = generateLoopRoute;

