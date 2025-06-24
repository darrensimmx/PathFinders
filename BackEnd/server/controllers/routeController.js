// controllers/routeController.js
// Controller for Route History Feature
const User = require('../models/userModel');

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

  user.savedRoutes.push(routeData);
  await user.save();
  return user.savedRoutes[user.savedRoutes.length - 1];
}

async function fetchSavedRoutes(userId) {
  const user = await User.findById(userId);
  if (!user) throw new Error('User Not Found!');
  return user.savedRoutes;
}


async function fetchSingleRoute(userId, routeId) {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found!');

  const route = user.savedRoutes.id(routeId);
  if (!route) throw new Error('Route not found!');

  return route;
}

async function removeSavedRoute(userId, routeId) {
  const user = await User.findById(userId);
  
  if (!user) throw new Error('User Not Found!');

  const initialCount = user.savedRoutes.length;

  user.savedRoutes = user.savedRoutes.filter(route => route._id.toString() !== routeId.toString());

  if (user.savedRoutes.length === initialCount) {
    throw new Error('Route not found');
  }

  await user.save();
  return true;

}
module.exports = { addSavedRoute, fetchSavedRoutes, fetchSingleRoute, removeSavedRoute };
