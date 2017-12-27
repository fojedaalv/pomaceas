var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.ObjectId;

var nutritionalDataSchema = new mongoose.Schema({
  station: {
    type: ObjectId,
    required: true,
    ref: 'Station'
  },
  sectorId : {
    type: ObjectId,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  stage: {
    type: String,
    required: true,
    enum: ['small', 'mature'],
    default: 'small'
  },
  N: {
    type: Number,
    required: true
  },
  P: {
    type: Number,
    required: true
  },
  K: {
    type: Number,
    required: true
  },
  Ca: {
    type: Number,
    required: true
  },
  Mg: {
    type: Number,
    required: true
  },
  Ms: {
    type: Number,
    required: true
  },
  N_Frutos: {
    type: Number,
    required: true
  },
  Peso_Total: {
    type: Number,
    required: true
  }
}, {
  timestamps: true
});

nutritionalDataSchema.index({ station: 1, sectorId: 1, date: 1, stage: 1 }, {unique: true});
nutritionalDataSchema.index({ date: 1 });
mongoose.model('NutritionalData', nutritionalDataSchema, 'nutritionaldata');
