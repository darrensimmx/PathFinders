//Backend/server/controllers/loopRoute.js
// Controller for routeGeneration feature generation

require('dotenv').config();
// might want to include more shapes for better distance accuracy
// Figure 8, triangle, circle
const { snapRectangleLoop } = require('../utils/routeTools')


async function generateLoopRoute(start, distance, options = {}) {
  console.log('[Request Start Location]:', start);

  const totalM = distance * 1000;

  const { route, corners } = await snapRectangleLoop(start, totalM);  

  const [A, B, C, D] = corners || [];
  
   // Defensive check
  if ([A, B, C, D].some(c => !c || isNaN(c.lat) || isNaN(c.lng))) {
    console.warn('[LoopRoute Error] Invalid snapped corner(s):', corners);
    throw new Error('generateLoopRoute failed: Invalid corners returned from snapRectangleLoop');
  }

  if (!route || !route.coords || !route.dist) {
    console.warn('[LoopRoute Error] Invalid route output:', route);
    throw new Error('generateLoopRoute failed: Invalid route returned from snapRectangleLoop');
  }


  return {
    type: 'rect-loop',
    geojson: { type: 'LineString', coordinates: route.coords },
    actualDist: route.dist,
    ...(options?.returnCorners && { 
      corners: { A, B, C, D } 
    })
  };
}



module.exports = generateLoopRoute;

