var mongoose = require('mongoose');

var stationSchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  region: {
    type: String,
    required: true
  },
  location: {
    type: { type: String },
    coordinates: []
  },
}, {
  timestamps: true
});

stationSchema.index({ location: '2dsphere' });
mongoose.model('Station', stationSchema);
