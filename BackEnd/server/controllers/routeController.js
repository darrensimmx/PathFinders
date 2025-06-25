// controllers/routeController.js
// Controller for Route History Feature
const User = require('../models/userModel');
const SavedRoute = require('../models/savedRouteModel');

async function addSavedRoute(userId, routeData) {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  if (user.savedRoutes.length >= 5) {
    throw new Error('Limit of 5 saved routes for free plan');
  }

  console.log("RouteData: ", routeData)
  if (!routeData || typeof routeData !== 'object' || !routeData.name) {
    throw new Error('Invalid route data: missing required fields.');
  }

  const savedRoute = await SavedRoute.create({
    ...routeData,
    user: userId
  });

  user.savedRoutes.push(savedRoute._id);
  await user.save();
  return user.savedRoutes[user.savedRoutes.length - 1];
}

async function fetchSavedRoutes(userId) {
  const user = await User.findById(userId).populate('savedRoutes');
  if (!user) throw new Error('User Not Found!');
  return user.savedRoutes;
}


async function fetchSingleRoute(userId, routeId) {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found!');

  const route = await SavedRoute.findOne({ _id: routeId, user: userId });
  if (!route) throw new Error('Route not found!');

  return route;
}

async function removeSavedRoute(userId, routeId) {
  const deleted = await SavedRoute.findOneAndDelete({ _id: routeId, user: userId });
  if (!deleted) throw new Error('Route not found');

  await User.findByIdAndUpdate(userId, {
    $pull: { savedRoutes: routeId }
  });

  return true;

}
module.exports = { addSavedRoute, fetchSavedRoutes, fetchSingleRoute, removeSavedRoute };
