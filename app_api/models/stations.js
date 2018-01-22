var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.ObjectId;

var sectorSchema = new mongoose.Schema({
  cultivar: {
    type: String,
    default: 'gala',
    enum: ['gala', 'fuji', 'cripps_pink']
  },
  name: {
    type: String,
    default: 'Cuartel Nuevo'
  }
},{ _id : true });

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
    sectorSchema
  ]
}, {
  timestamps: true
});

stationSchema.index({ location: '2dsphere' });
mongoose.model('Station', stationSchema);
