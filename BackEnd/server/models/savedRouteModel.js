// models/savedRouteModel.js
const mongoose = require('mongoose');

const savedRouteSchema = new mongoose.Schema({
  name: { type: String, required: true },
  distance: { type: Number, required: true },
  coordinates: { type: Array, required: true },
  startPoint: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true }
  },
  endPoint: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true }
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = savedRouteSchema;
