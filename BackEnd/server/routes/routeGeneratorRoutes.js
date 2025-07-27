const express = require('express');
const router = express.Router();

const generateLoopRoute = require('../controllers/looproute');
const generateDirectRoute = require('../controllers/directRoute');
const { geocodePlace, haversineDistance } = require('../utils/geoUtils');

const { sampleEvery2km, getWeatherWarnings } = require('../utils/weatherCheck');
const { getWalkingRoute } = require('../utils/googleRequest'); // for waypoint routes

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
  const { start, end, distance, routeType, waypoints } = req.body;

  // Validate provided waypoints if any
  let validWaypoints = [];
  const sgBounds = { minLat: 1.13, maxLat: 1.45, minLng: 103.6, maxLng: 104.1 };
  if (Array.isArray(waypoints) && waypoints.length > 0) {
    for (let idx = 0; idx < waypoints.length; idx++) {
      const pt = waypoints[idx];
      if (!pt || typeof pt.lat !== 'number' || typeof pt.lng !== 'number') {
        return res.status(400).json({ success: false, error: 'InvalidWaypoint', message: `Waypoint at index ${idx} is invalid.` });
      }
      if (pt.lat < -90 || pt.lat > 90 || pt.lng < -180 || pt.lng > 180) {
        return res.status(400).json({ success: false, error: 'InvalidWaypoint', message: `Waypoint at index ${idx} has out-of-range coordinates.` });
      }
      if (pt.lat < sgBounds.minLat || pt.lat > sgBounds.maxLat || pt.lng < sgBounds.minLng || pt.lng > sgBounds.maxLng) {
        return res.status(400).json({ success: false, error: 'OutsideBoundary', message: `Waypoint at index ${idx} is outside Singapore boundary.` });
      }
    }
    validWaypoints = waypoints;

  }
  
  const isFallbackCBD = coords =>
    coords.lat === 1.3521 && coords.lng === 103.8198;

  try {
    // Parse Start
    let startCoords;
    if (typeof start === 'string') {
      // Geocode start (including postal codes handled in geocodePlace)
      startCoords = await geocodePlace(start);
    } else if (typeof start === 'object' && start !== null) {
      startCoords = start;
    }
    // ensure start within Singapore
    if (startCoords && (startCoords.lat < sgBounds.minLat || startCoords.lat > sgBounds.maxLat || startCoords.lng < sgBounds.minLng || startCoords.lng > sgBounds.maxLng)) {
      return res.status(400).json({ success: false, error: 'OutsideBoundary', message: 'Start location outside Singapore boundary.' });
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

    // Parse End for non-loop routes
    let endCoords;
    if (routeType !== 'loop') {
      // check end given stays in Singapore
      if (!end) {
        return res.status(400).json({
          success: false,
          error: "MissingEndLocation",
          message: "End location is required for direct routes."
        });
      }
      if (typeof end === 'string') {
        // Geocode end (including postal codes handled in geocodePlace)
        endCoords = await geocodePlace(end);
      } else if (typeof end === 'object' && end !== null) {
        endCoords = end;
      }
      if (endCoords && (endCoords.lat < sgBounds.minLat || endCoords.lat > sgBounds.maxLat || endCoords.lng < sgBounds.minLng || endCoords.lng > sgBounds.maxLng)) {
        return res.status(400).json({ success: false, error: 'OutsideBoundary', message: 'End location outside Singapore boundary.' });
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
    }

    console.log('[Route Debug] routeType received:', routeType);
    let result;
    if (routeType !== 'loop') {
      // Build stops: start -> waypoints (if any) -> end
      const stops = [startCoords, ...(validWaypoints || []), endCoords];
      let allCoords = [];
      let totalDist = 0;
      // Chain shortest segments between each stop
      for (let i = 0; i < stops.length - 1; i++) {
        const seg = await getWalkingRoute(stops[i], stops[i + 1]);
        if (!seg || !seg.coords) throw new Error(`Failed routing segment ${i + 1}`);
        if (i === 0) allCoords = [...seg.coords];
        else allCoords.push(...seg.coords.slice(1));
        totalDist += seg.dist;
      }
      const targetM = distNum * 1000;
      // If under target, extend with loop at final stop; if over, keep full route to ensure waypoints are covered
      if (totalDist < targetM) {
        const remKm = (targetM - totalDist) / 1000;
        const loopExt = await generateLoopRoute(stops[stops.length - 1], remKm);
        if (!loopExt || !loopExt.geojson?.coordinates) throw new Error('Failed loop extension');
        allCoords.push(...loopExt.geojson.coordinates.slice(1));
        totalDist += loopExt.actualDist;
      }
      result = {
        type: 'direct-with-loop',
        geojson: { type: 'LineString', coordinates: allCoords },
        actualDist: totalDist
      };
    } else {
      // Loop route with optional waypoints: start -> waypoints -> start
      if (validWaypoints.length > 0) {
        const loopStops = [startCoords, ...validWaypoints, startCoords];
        let allCoords = [];
        let totalDistLoop = 0;
        for (let i = 0; i < loopStops.length - 1; i++) {
          const seg = await getWalkingRoute(loopStops[i], loopStops[i + 1]);
          if (!seg || !seg.coords) throw new Error(`Failed loop segment ${i + 1}`);
          if (i === 0) allCoords = [...seg.coords];
          else allCoords.push(...seg.coords.slice(1));
          totalDistLoop += seg.dist;
        }
        // Extend loop if under target distance
        const targetM = distNum * 1000;
        if (totalDistLoop < targetM) {
          const remKm = (targetM - totalDistLoop) / 1000;
          const ext = await generateLoopRoute(startCoords, remKm);
          if (!ext || !ext.geojson?.coordinates) throw new Error('Failed loop extension');
          allCoords.push(...ext.geojson.coordinates.slice(1));
          totalDistLoop += ext.actualDist;
        }
        result = {
          type: 'loop-with-waypoints',
          geojson: { type: 'LineString', coordinates: allCoords },
          actualDist: totalDistLoop
        };
      } else {
        // Loop-only route
        result = await generateLoopRoute(startCoords, distNum);
      }
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

    // Enforce Singapore boundary
    if (Array.isArray(routeCoords)) {
      const bounds = { minLat: 1.13, maxLat: 1.45, minLng: 103.6, maxLng: 104.1 };
      const outside = routeCoords.some(pt =>
        pt.lat < bounds.minLat || pt.lat > bounds.maxLat ||
        pt.lng < bounds.minLng || pt.lng > bounds.maxLng
      );
      if (outside) {
        return res.status(400).json({
          success: false,
          error: 'OutsideBoundary',
          message: 'Route leaves Singapore boundary.'
        });
      }
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
