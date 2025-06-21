// For database
// defines MongoDB User schema 
const mongoose = require('mongoose');
const savedRouteSchema = require('./savedRouteModel');

//TODO: update with more fields as we progress the features
const userSchema = new mongoose.Schema({
  email: {
    type: String, 
    required: true,
    unique: true,
    match: [/.+@.+\..+/, 'Invalid email format']
  },
  password: {
    type: String,
    required: true
  },
  resetPasswordToken: String, 
  resetPasswordExpires: Date,
  savedRoutes: {
    type: [savedRouteSchema],
    default: []
  }
})

const User = mongoose.model('User', userSchema);

module.exports = User;