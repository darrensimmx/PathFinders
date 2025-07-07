const express = require('express');
const router = express.Router();

const generateLoopRoute = require('../controllers/looproute');
const generateDirectRoute = require('../controllers/directRoute');
const { geocodePlace } = require('../utils/geoUtils');

const {
  sampleEvery2km,
  getWeatherWarnings
} = require('../utils/weatherCheck');

// Utility: Normalize coordinates to [{ lat, lng }, …]
function extractRouteCoords(result) {
  if (
    result &&
    result.geojson &&
    Array.isArray(result.geojson.coordinates)
  ) {
    return result.geojson.coordinates.map(([lng, lat]) => ({ lat, lng }));
  }
  throw new Error('Could not extract route coordinates from controller result.');
}

// POST /api/route
router.post('/', async (req, res) => {
  const { start, end, distance, routeType } = req.body;

  const isFallbackCBD = coords =>
    coords.lat === 1.3521 && coords.lng === 103.8198;

  try {
    // Parse Start
    let startCoords;
    if (typeof start === 'string') {
      startCoords = await geocodePlace(start);
    } else if (typeof start === 'object' && start !== null) {
      startCoords = start;
    }

    if (
      !startCoords ||
      typeof startCoords.lat !== 'number' ||
      typeof startCoords.lng !== 'number' ||
      isFallbackCBD(startCoords)
    ) {
      const rawInput = typeof start === 'string'
        ? start
        : (start?.lat || start?.lng ? JSON.stringify(start) : 'an unknown location');

      return res.status(400).json({
        success: false,
        error: "InvalidStartLocation",
        message: `We couldn't find the starting location: "${rawInput}". Please try again.`
      });
    }

    // Validate Distance
    const distNum = Number(distance);
    if (isNaN(distNum) || distNum <= 0) {
      return res.status(400).json({
        success: false,
        error: "InvalidDistance",
        message: "Distance must be a valid positive number."
      });
    }

    console.log('[Route Debug] routeType received:', routeType);
    let result;
    let endCoords;

    // Generate Route
    if (routeType === 'loop') {
      result = await generateLoopRoute(startCoords, distNum);
    } else {
      if (!end) {
        return res.status(400).json({
          success: false,
          error: "MissingEndLocation",
          message: "End location is required for direct routes."
        });
      }

      if (typeof end === 'string') {
        endCoords = await geocodePlace(end);
      } else if (typeof end === 'object' && end !== null) {
        endCoords = end;
      }

      if (
        !endCoords ||
        typeof endCoords.lat !== 'number' ||
        typeof endCoords.lng !== 'number' ||
        isFallbackCBD(endCoords)
      ) {
        const rawInput = typeof end === 'string'
          ? end
          : (end?.lat || end?.lng ? JSON.stringify(end) : 'an unknown location');

        return res.status(400).json({
          success: false,
          error: "InvalidEndLocation",
          message: `We couldn't locate the end location: "${rawInput}". Please try again.`
        });
      }

      result = await generateDirectRoute(startCoords, endCoords, distNum);
    }

    console.log('RAW CONTROLLER RESULT:', JSON.stringify(result, null, 2));

    //Extract Coordinates
    let routeCoords;
    try {
      routeCoords = extractRouteCoords(result);
    } catch (e) {
      console.error('[Route Error] could not parse coordinates:', e.message);
      return res.status(500).json({
        success: false,
        error: "RouteParseError",
        message: 'Route was generated but coordinates could not be parsed.'
      });
    }

    if (!Array.isArray(routeCoords) || routeCoords.length < 2) {
      return res.status(500).json({
        success: false,
        error: "InsufficientCoords",
        message: 'Route has too few coordinates to sample.'
      });
    }

    //Sample & Weather 
    const sampledPoints = sampleEvery2km(routeCoords);
    let weatherWarnings = [];

    try {
      weatherWarnings = await getWeatherWarnings(sampledPoints);
    } catch (weatherErr) {
      console.warn('Weather check failed:', weatherErr.message);
    }

    // Final Response 
    return res.json({
      success: true,
      ...result,
      routeCoords,
      samplesEvery2km: sampledPoints,
      weatherWarnings
    });

  } catch (err) {
    console.error('[Route Error]', err.response?.data || err.message);
    res.status(500).json({
      success: false,
      error: "InternalServerError",
      message: err.message || 'Internal server error'
    });
  }
});

module.exports = router;
