
const mongoose = require('mongoose');
const pointSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['Point'],
    required: true,
    default: 'Point'
  },
  coordinates: {
    type: [Number],
    required: true
  }
}, { _id: false }); 

const savedRouteSchema = new mongoose.Schema({
  name: { type: String, required: true },
  distance: { type: Number, required: true },
  coordinates: { type: Array, required: true },
  startPoint: pointSchema,  
  endPoint: pointSchema,    
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('SavedRoute', savedRouteSchema);
