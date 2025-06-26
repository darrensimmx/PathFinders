// For database
// defines MongoDB User schema 
const mongoose = require('mongoose');

//TODO: update with more fields as we progress the features
const userSchema = new mongoose.Schema({
  name: {
    type: String, 
    required: true
  },
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
  savedRoutes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SavedRoute'
  }]
})

const User = mongoose.model('User', userSchema);

module.exports = User;