const express = require('express');
const router = express.Router();

const generateLoopRoute = require('../controllers/looproute');
const generateDirectRoute = require('../controllers/directRoute');
const { geocodePlace } = require('../utils/geoUtils');

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

// Utility: Calculate distance between two [lng, lat] coordinates
function calculateSegmentDistance(coord1, coord2) {
  const { haversineDistance } = require('../utils/geoUtils');
  return haversineDistance(
    { lat: coord1[1], lng: coord1[0] }, 
    { lat: coord2[1], lng: coord2[0] }
  );
}

// Utility: Truncate coordinates array to meet target distance
function truncateCoordinates(coords, targetDistance) {
  if (!Array.isArray(coords) || coords.length < 2) return coords;
  
  let totalDistance = 0;
  let truncatedCoords = [coords[0]]; // Always include first coordinate
  
  for (let i = 1; i < coords.length; i++) {
    const segmentDist = calculateSegmentDistance(coords[i-1], coords[i]);
    
    if (totalDistance + segmentDist <= targetDistance) {
      // Include this coordinate completely
      truncatedCoords.push(coords[i]);
      totalDistance += segmentDist;
    } else {
      // Partially include this segment to reach exact target distance
      const remainingDist = targetDistance - totalDistance;
      const ratio = remainingDist / segmentDist;
      
      // Interpolate coordinates
      const prevCoord = coords[i-1];
      const currCoord = coords[i];
      const interpolatedCoord = [
        prevCoord[0] + (currCoord[0] - prevCoord[0]) * ratio,
        prevCoord[1] + (currCoord[1] - prevCoord[1]) * ratio
      ];
      
      truncatedCoords.push(interpolatedCoord);
      break;
    }
  }
  
  return truncatedCoords;
}

// POST /api/route
router.post('/', async (req, res) => {
  const { start, end, distance, routeType, waypoints } = req.body;

  const isFallbackCBD = coords =>
    coords.lat === 1.3521 && coords.lng === 103.8198;

  // Validate and geocode waypoints if any
  let validWaypoints = [];
  if (Array.isArray(waypoints) && waypoints.length > 0) {
    for (let idx = 0; idx < waypoints.length; idx++) {
      const pt = waypoints[idx];
      let waypointCoords;
      
      // Handle string addresses by geocoding
      if (typeof pt === 'string') {
        try {
          waypointCoords = await geocodePlace(pt);
        } catch (err) {
          return res.status(400).json({
            success: false,
            error: 'InvalidWaypoint',
            message: `Could not geocode waypoint "${pt}" at index ${idx}.`
          });
        }
      } 
      // Handle coordinate objects
      else if (typeof pt === 'object' && pt !== null) {
        waypointCoords = pt;
      } else {
        return res.status(400).json({
          success: false,
          error: 'InvalidWaypoint',
          message: `Waypoint at index ${idx} must be either a string address or coordinate object.`
        });
      }
      
      // Validate coordinates
      if (!waypointCoords || typeof waypointCoords.lat !== 'number' || typeof waypointCoords.lng !== 'number') {
        const rawInput = typeof pt === 'string' ? pt : JSON.stringify(pt);
        return res.status(400).json({
          success: false,
          error: 'InvalidWaypoint',
          message: `Could not resolve waypoint "${rawInput}" at index ${idx}.`
        });
      }
      
      // Check coordinate range
      if (waypointCoords.lat < -90 || waypointCoords.lat > 90 || waypointCoords.lng < -180 || waypointCoords.lng > 180) {
        return res.status(400).json({
          success: false,
          error: 'InvalidWaypoint',
          message: `Waypoint at index ${idx} has out-of-range coordinates.`
        });
      }
      
      // Check if it's the fallback CBD coordinates
      if (isFallbackCBD(waypointCoords)) {
        const rawInput = typeof pt === 'string' ? pt : JSON.stringify(pt);
        return res.status(400).json({
          success: false,
          error: 'InvalidWaypoint',
          message: `Could not locate waypoint "${rawInput}" at index ${idx}. Please try again.`
        });
      }
      
      validWaypoints.push(waypointCoords);
    }
  }

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

    // Parse End for non-loop routes
    let endCoords;
    if (routeType !== 'loop') {
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
    }

    console.log('[Route Debug] routeType received:', routeType);
    let result;
    if (routeType !== 'loop') {
      // Build stops: start -> waypoints (if any) -> end
      const stops = [startCoords, ...(validWaypoints || []), endCoords];
      let allCoords = [];
      let totalDist = 0;
      const targetM = distNum * 1000;
      
      // Chain shortest segments between each stop
      for (let i = 0; i < stops.length - 1; i++) {
        const seg = await getWalkingRoute(stops[i], stops[i + 1]);
        if (!seg || !seg.coords) throw new Error(`Failed routing segment ${i + 1}`);
        
        // Check if adding this segment would overshoot target distance
        if (totalDist + seg.dist > targetM) {
          // Truncate this segment to exactly meet target distance
          const remainingDist = targetM - totalDist;
          const truncatedCoords = truncateCoordinates(seg.coords, remainingDist);
          
          if (i === 0) {
            allCoords = [...truncatedCoords];
          } else {
            allCoords.push(...truncatedCoords.slice(1));
          }
          totalDist = targetM; // Exact target reached
          break;
        } else {
          // Include this segment completely
          if (i === 0) {
            allCoords = [...seg.coords];
          } else {
            allCoords.push(...seg.coords.slice(1));
          }
          totalDist += seg.dist;
        }
      }
      
      // If total distance is less than target, extend with loop at final stop
      if (totalDist < targetM) {
        const remKm = (targetM - totalDist) / 1000;
        const finalStop = stops[stops.length - 1];
        const loopExt = await generateLoopRoute(finalStop, remKm);
        if (!loopExt || !loopExt.geojson?.coordinates) throw new Error('Failed loop extension');
        // LoopExt coords is [lng,lat] array
        allCoords.push(...loopExt.geojson.coordinates.slice(1));
        totalDist += loopExt.actualDist; // actualDist is already in meters
      }
      
      result = {
        type: 'direct-with-waypoints',
        geojson: { type: 'LineString', coordinates: allCoords },
        actualDist: totalDist
      };
    } else {
      // Loop-only route
      result = await generateLoopRoute(startCoords, distNum);
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
