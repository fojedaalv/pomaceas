var mongoose = require('mongoose');
var ObjectId = mongoose.Schema.ObjectId;

var commentSchema = new mongoose.Schema({
  comment: {
    type: String,
    required: true
  },
  stationId: {
    type: ObjectId,
    required: true
  },
  summaryId: {
    type: ObjectId,
    required: true
  }
}, {
  timestamps: true
});
commentSchema.index({stationId: 1, summaryId: 1}, {unique: true});
mongoose.model('Comment', commentSchema);
