var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.ObjectId;

var summarySchema = new mongoose.Schema({
  name: {
    type: String,
    unique: true,
    required: true
  },
  variables: [

  ]
}, {
  timestamps: true
});

mongoose.model('Summary', summarySchema);
