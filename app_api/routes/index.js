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
var ctrlSensorData = require('../controllers/sensor-data');

router.post('/register', ctrlAuth.register);
router.post('/login', ctrlAuth.login);

// ================ User Endpoints =================

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

// ================ Stations Endpoints =============

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
router.get('/stations/:stationId',
      auth,
      ctrlStations.readOne);
router.put('/stations/:stationId',
      auth,
      ctrlAuth.roleAuthorization(['administrator']),
      ctrlStations.updateOne);

router.get('/userstations/:userId',
      auth,
      ctrlAuth.roleAuthorization(['administrator', 'user']),
      ctrlStations.getByUser);

router.get('/stations-public',
      ctrlStations.list);

// ============= Sensor Data Endpoints =============
router.post('/sensor-data',
      ctrlSensorData.storeData);
router.get('/check-datacount/:stationId',
      ctrlSensorData.getDataCount);
router.get('/get-report-byday/:stationId',
      ctrlSensorData.getReportByDay);

// ================= Test Endpoints ================
router.get('/querytest',
      ctrlSensorData.queryTest);



// =================================================
module.exports = router;
