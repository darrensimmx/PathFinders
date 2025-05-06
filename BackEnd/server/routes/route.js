//Handles the actual response logic for each API call
const express = require('express')
const router = express.Router() //creates an instances of Router to be used in app.js
const validateRouteInput = require('../utils/validateInput')

// POST /generateRoute
router.post('/', (req, res) => {
    const { start, end, distance } = req.body; //only data that we need for now

    const { valid, message} = validateRouteInput({ start, end, distance })

    if (!valid) {
      return res.status(400).json({ success: false, message })
    }
  
    console.log("Received from frontend:", { start, end, distance }); //debugging
  
    //placeholder, replace with routing logic later 
    const route = [
      `Start at ${start}`,
      `Run for ${distance} km`,
      `End at ${end}`
    ];
  
    res.json({ success: true, route });
  });

module.exports = router