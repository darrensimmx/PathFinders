//Backend/server/routes/route.js
//Handles the actual response logic for each API call
const express = require('express')
const router = express.Router() //creates an instances of Router to be used in app.js
//const getORSRoute = require('../utils/orsRequest');
//const geocodeLocation = require('../utils/geocodeLocation');
const generateLoopRoute = require('../controllers/looproute')
const generateDirectRoute = require('../controllers/directRoute');

router.post('/', async (req, res) => {
  const { start, end, distance, routeType } = req.body;

  // Distance check : undo when done
  // if (typeof distance !== 'number' || isNaN(distance) || distance <= 0) {
  //   return res.status(400).json({
  //     success: false,
  //     message: 'Please enter a valid positive number for distance.'
  //   });
//}

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

    res.json({ success: true, ...result });
    console.log("ORS response received:", result); //debug
  } catch (err) {
    console.error('[Route Error]', err.response?.data || err.message);
    res.status(500).json({
      success: false,
      message: err.message || 'Internal server error'
    });
  }    
});

module.exports = router;
