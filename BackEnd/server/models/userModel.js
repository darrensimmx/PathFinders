// For database
// defines MongoDB User schema 
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String, 
    required: true
  },
  username: {
    type: String,
    unique: true,
    sparse: true
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
  bio: {
    type: String,
    default: ''
  },
  profileImage: {
    type: String, 
    default: ''
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