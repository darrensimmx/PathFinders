//Handles the actual response logic for each API call
const express = require('express')
const router = express.Router() //creates an instances of Router to be used in app.js
const getORSRoute = require('../utils/orsRequest');
const geocodeLocation = require('../utils/geocodeLocation');

// /generateRoute Debugger
router.post('/', (req, res) => {
    const { start, end, distance } = req.body; //only data that we need for now
  
    console.log("Received from frontend:", { start, end, distance }); //debugging
  
    //placeholder, replace with routing logic later 
    const route = [
      `Start at ${start}`,
      `Run for ${distance} km`,
      `End at ${end}`
    ];
  
    res.json({ success: true, route });
  });

  //test the ORSAPI
  router.post('/real', async (req, res) => {
    const { start, end, distance } = req.body;

    // Distance check : undo when done
    if (typeof distance !== 'number' || isNaN(distance) || distance <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid positive number for distance.'
      });
  }
  
    try {
      const startCoords = await geocodeLocation(start);
      const endCoords = await geocodeLocation(end);

      //check validity of user inputs 
      if (!startCoords || startCoords.length != 2) {
        return res.status(400).json({ 
          success: false, 
          message: "We couldn't find the starting location. Please try a more specific address." 
        });
      } // valid start and start has length two, [lng, lat]

      if (!endCoords || endCoords.length != 2) {
        return res.status(400).json({ 
          success: false, 
          message: "We couldn't find the ending location. Please try a more specific address." 
        });
      } // valid start and start has length two, [lng, lat]

      
      const geoData = await getORSRoute(startCoords, endCoords);
      console.log("ORS response received:", geoData); //debug

      res.json({ success: true, geojson: geoData });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Route generation failed' });
    }
  });

module.exports = router;

/*
  //test the ORSAPI and working ORS API already
  router.post('/real', async (req, res) => {
    const { start, end } = req.body;
  
    try {
      // Dummy coordinates for now — replace with real geocoded coords
      const startCoords = [103.9535, 1.3419];  // Simei
      const endCoords = [103.9455, 1.3536];    // Tampines
  
      const geoData = await getORSRoute(startCoords, endCoords);
      console.log("ORS response received:", geoData); //debug

      res.json({ success: true, geojson: geoData });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: 'Route generation failed' });
    }
  });
*/