var mongoose = require('mongoose');
var crypto = require('crypto');

var passwordRequestSchema = new mongoose.Schema({
  email: {
    type: String,
    unique: true,
    lowercase: true,
    required: true
  },
  expirationDate: {
    type: Date,
    required: true
  },
  token: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

mongoose.model('PasswordRequest', passwordRequestSchema);
