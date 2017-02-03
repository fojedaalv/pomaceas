var express = require('express');
var router = express.Router();
var jwt = require('express-jwt');
var auth = jwt({
  secret: process.env.JWT_SECRET,
  userProperty: 'payload'
});

var ctrlAuth = require('../controllers/authentication');
var ctrlUsers = require('../controllers/users');
var ctrlStations = require('../controllers/stations');

router.post('/register', ctrlAuth.register);
router.post('/login', ctrlAuth.login);

router.get('/users',
      auth,
      ctrlAuth.roleAuthorization(['administrator']),
      ctrlUsers.list);
router.get('/users/:userId',
      auth,
      ctrlAuth.roleAuthorization(['administrator']),
      ctrlUsers.readOne);
router.put('/users/:userId',
      auth,
      ctrlAuth.roleAuthorization(['administrator']),
      ctrlUsers.updateOne);
router.delete('/users/:userId',
      auth,
      ctrlAuth.roleAuthorization(['administrator']),
      ctrlUsers.deleteOne);

router.get('/stations',
      auth,
      ctrlAuth.roleAuthorization(['administrator']),
      ctrlStations.list);
router.post('/stations',
      auth,
      ctrlAuth.roleAuthorization(['administrator']),
      ctrlStations.create);
router.delete('/stations/:stationId',
      auth,
      ctrlAuth.roleAuthorization(['administrator']),
      ctrlStations.deleteOne);

router.get('/stations-public',
      ctrlStations.list);
module.exports = router;
