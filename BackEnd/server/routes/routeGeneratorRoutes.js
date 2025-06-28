// For routeGeneration feature: handles "/" POST req
// Handles route generation (loop or direct), 2 km sampling, and WeatherAPI warnings.

const express = require('express');
const router = express.Router();

const generateLoopRoute   = require('../controllers/looproute');
const generateDirectRoute = require('../controllers/directRoute');

const {
  sampleEvery2km,
  getWeatherWarnings
} = require('../utils/weatherCheck');

/**
 * Extracts “routeCoords” from the controller’s output.
 * We know now that your controller returns:
 *   {
 *     type: "rect-loop",
 *     geojson: {
 *       type: "LineString",
 *       coordinates: [ [lng, lat], [lng, lat], … ]
 *     },
 *     distance: …
 *   }
 *
 * So we simply map each [lng, lat] to { lat, lng }.
 */
function extractRouteCoords(result) {
  if (
    result &&
    result.geojson &&
    Array.isArray(result.geojson.coordinates)
  ) {
    return result.geojson.coordinates.map(([lng, lat]) => ({
      lat,
      lng
    }));
  }
  throw new Error('Could not extract route coordinates from controller result.');
}

router.post('/', async (req, res) => {
  const { start, end, distance, routeType } = req.body;

  try {
    const startCoords = start;

    //check validity of user inputs 
    if (!start || typeof start.lat !== 'number' || typeof start.lng !== 'number') {
      return res.status(400).json({ 
        success: false, 
        message: "We couldn't find the starting location. Please try a more specific address." 
      });
    } // valid start and start has length two, [lng, lat]

    //validate distance
    const distNum = Number(distance);
    if (isNaN(distNum) || distNum <= 0) {
      return res.status(400).json({
        success: false,
        message: "Distance must be a valid positive number."
      });
    }

    let result;
    console.log('[Route Debug] routeType received:', routeType); //debug
    attempts = 0 // run the algo fresh

    if (routeType == 'loop') {
      result = await generateLoopRoute(startCoords, distNum);
    } else {
      if (!end) return res.status(400).json({ error: "End location is required for direct routes." });
      const endCoords = end;
      if (!end || typeof end.lat !== 'number' || typeof end.lng !== 'number') {
        return res.status(400).json({ 
          success: false, 
          message: "We couldn't find the ending location. Please try a more specific address." 
        });
      } // valid end and end has length two, [lng, lat]
      result = await generateDirectRoute(startCoords, endCoords, distNum);
    }

    
    // 3. DEBUG: Log raw result so you can see its fields if needed
    console.log(
      ' RAW CONTROLLER RESULT:',
      JSON.stringify(result, null, 2)
    );
    

    // 4. Extract normalized routeCoords: [ { lat, lng }, … ]
    let routeCoords;
    try {
      routeCoords = extractRouteCoords(result);
    } catch (e) {
      console.error(
        '[Route Error] could not parse coordinates:',
        e.message
      );
      console.error(
        'Full controller result:',
        JSON.stringify(result, null, 2)
      );
      return res.status(500).json({
        success: false,
        message: 'Route was generated but coordinates could not be parsed.'
      });
    }

    if (!Array.isArray(routeCoords) || routeCoords.length < 2) {
      return res.status(500).json({
        success: false,
        message: 'Route has too few coordinates to sample.'
      });
    }

    // 5. Sample every 2 km
    const sampledPoints = sampleEvery2km(routeCoords);

    // 6. Fetch weather warnings for each sampled point
    let weatherWarnings = [];
    try {
      weatherWarnings = await getWeatherWarnings(sampledPoints);
    } catch (weatherErr) {
      console.warn('Weather check failed:', weatherErr.message);
      // We'll still return the route without warnings
    }

    // 7. Return full response:
    //     Spread `result` so frontend still sees `type`, `geojson`, `distance`, etc.
    //    Add `routeCoords`, `samplesEvery2km`, and `weatherWarnings`.
    return res.json({
      success: true,
      ...result,
      routeCoords,          // [ { lat, lng }, … ]
      samplesEvery2km: sampledPoints,
      weatherWarnings       // [ { lat, lng, badHours:[…] }, … ]
    });
    
  } catch (err) {
    console.error('[Route Error]', err.response?.data || err.message);
    res.status(500).json({
      success: false,
      message: err.message || 'Internal server error'
    });
  }    
});

module.exports = router;
