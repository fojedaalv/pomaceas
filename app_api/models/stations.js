var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.ObjectId;

var stationSchema = new mongoose.Schema({
  name: {
    type: String,
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
  owner: {
    type: ObjectId,
    unique: false
  },
  location: {
    type: { type: String },
    coordinates: []
  },
  sectors: [

  ]
}, {
  timestamps: true
});

stationSchema.index({ location: '2dsphere' });
mongoose.model('Station', stationSchema);
