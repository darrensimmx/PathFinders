const express = require('express')
const router = express.Router()
const {addSavedRoute, fetchSavedRoutes, fetchSingleRoute, removeSavedRoute } = require('../controllers/routeController');
const authenticateToken = require('../middleware/authMiddleware')
const User = require('../models/userModel');
const SavedRoute = require('../models/savedRouteModel'); 

//delete all routes
router.delete('/saved-routes/clear-all', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Delete the actual saved route documents
    await SavedRoute.deleteMany({ _id: { $in: user.savedRoutes } });

    // Clear user's reference array
    user.savedRoutes = [];
    await user.save();

    return res.status(200).json({ message: 'All saved routes cleared' });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Failed to clear saved routes', error: err.message });
  }
});

// POST /api/routes/save
router.post('/saved-routes/save', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const route = req.body.route;
    console.log("Request UsedID: ", req.user.id)
    console.log("Request route: ", req.body.route)
    await addSavedRoute(userId, route);
    res.json({message: 'Route saved successfully'})
  } catch (err) {
    res.status(400).json({message: err.message})
  }
})

/**NOTE: Since GET is not as secure as POST, we pass in auth token instead of user ID ******/
// GET /api/routes?userId=..
router.get('/saved-routes', authenticateToken, async (req, res) => {
  try{
    const routes = await fetchSavedRoutes(req.user.id);
    res.json({routes})
  } catch (err) {
    res.status(400).json({message: err.message})
  }
})

// GET /api/routes?:routeId?userId=..
router.get('/saved-routes/:routeId', authenticateToken, async (req, res) => {
  try{
    const route = await fetchSingleRoute(req.user.id, req.params.routeId);
    res.json(route);
  } catch (err) {
    res.status(400).json({message: err.message})
  }
})

// DELETE /api/route/delete
router.delete('/saved-routes/:routeId', authenticateToken, async (req, res) =>{
  try {
    const userId = req.user.id;
    const routeId = req.params.routeId;
    await removeSavedRoute(userId, routeId)
    res.json({message: 'Route Deleted'})
  } catch (err) {
    res.status(400).json({message: err.message})
  }
})



module.exports = router;