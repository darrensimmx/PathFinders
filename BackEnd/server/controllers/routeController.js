// controllers/routeController.js

const User = require('../models/userModel');

async function addSavedRoute(userId, routeData) {
  const user = await User.findById(userId);
  if (!user) throw new Error('User not found');

  if (user.savedRoutes.length >= 5) {
    throw new Error('Limit of 5 saved routes for free plan');
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

async function removeSavedRoute(userId, routeName) {
  const user = await User.findById(userId);
  
  if (!user) throw new Error('User Not Found!');

  const initialCount = user.savedRoutes.length;

  user.savedRoutes = user.savedRoutes.filter(route => route.name !== routeName);

  if (user.savedRoutes.length === initialCount) {
    throw new Error('Route not found');
  }

  await user.save();
  return true;

}
module.exports = { addSavedRoute, fetchSavedRoutes, removeSavedRoute };
