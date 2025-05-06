//Handles the actual response logic for each API call
const express = require('express')
const router = express.Router() //creates an instances of Router to be used in app.js

// POST /generateRoute
router.post('/', (req, res) => {
    const { start, end, distance } = req.body; //only data that we need for now
  
    console.log("Received from frontend:", { start, end, distance }); //debugging
  
    res.json({
      success: true,
      route: [`Start at ${start}`, `Run ${distance}km`, `End at ${end}`]
    }); //placeholder, to be linked to actual routing later
  });

module.exports = router