var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.ObjectId;

var sensorDataSchema = new mongoose.Schema({
  station: {
    type: ObjectId,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  tempOut: {
    type: Number,
    required: true
  },
  hiTemp: {
    type: Number,
    required: true
  },
  lowTemp: {
    type: Number,
    required: true
  },
  outHum: {
    type: Number,
    required: true
  },
  windSpeed: {
    type: Number,
    required: true
  },
  rain: {
    type: Number,
    required: true
  },
  solarRad: {
    type: Number,
    required: true
  },
  et: {
    type: Number,
    required: true
  },
  hr95: {
    type: Number,
    required: true
  },
  uEstres: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

sensorDataSchema.index({ station: 1, date: 1 }, {unique: true});
mongoose.model('SensorData', sensorDataSchema, 'sensordata');
