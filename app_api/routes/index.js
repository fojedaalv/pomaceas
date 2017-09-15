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
var ctrlReports = require('../controllers/reports');
var ctrlSummaries = require('../controllers/summaries');

// ========== Authentication Endpoints =============

router.post('/register', ctrlAuth.register);
router.post('/login', ctrlAuth.login);
router.post('/request-password-reset', ctrlAuth.requestPasswordReset);
router.post('/reset-password', ctrlAuth.resetPassword);

// ================ User Endpoints =================
router.get('/users',
  auth,
  ctrlAuth.roleAuthorization(['administrator']),
  ctrlUsers.list);
router.get('/users/:userId',
  auth,
  ctrlUsers.readOne);
router.put('/users/:userId',
  auth,
  ctrlAuth.roleAuthorization(['administrator']),
  ctrlUsers.updateOne);
router.delete('/users/:userId',
  auth,
  ctrlAuth.roleAuthorization(['administrator']),
  ctrlUsers.deleteOne);
router.put('/user-update/:userId',
  auth,
  ctrlUsers.updateSelf);

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
  ctrlStations.readOne);
router.put('/stations/:stationId',
  auth,
  ctrlAuth.roleAuthorization(['administrator']),
  ctrlStations.updateOne);
router.patch('/stations_sectors/:stationId',
  auth,
  ctrlStations.updateSectors);

router.get('/userstations/:userId',
  auth,
  ctrlAuth.roleAuthorization(['administrator', 'user']),
  ctrlStations.getByUser);

router.get('/stations-public',
  ctrlStations.list);

// ============= Sensor Data Endpoints =============
// Uploads Sensor Data
router.post('/sensor-data',
  ctrlSensorData.storeData);
// Counts data per day
router.get('/check-datacount/:stationId',
  ctrlSensorData.getDataCount);
// Get available dates in sensordata per station id
router.get('/get-station-summary/:stationId',
  ctrlSensorData.getStationSummary);
// Get the sensor data organized by date
router.get('/get-sensordata-bydate/:stationId',
  ctrlSensorData.getSensorDataByDate);
router.get('/daily-avg-bymonth/:stationId',
  ctrlSensorData.getDailySensorDataByMonth);
// Queries indicators by station id and date range
// If endDate not set, only one day
// get-report-byday/XXXXX?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
router.get('/get-report-byday/:stationId',
  ctrlSensorData.getReportByDay);
// Get indicators calculated by month
router.get('/get-report-bymonth/:stationId',
  ctrlSensorData.getReportByMonth);

router.get('/get-variable/',
  ctrlSensorData.getVariable);

router.delete('/sensordata/:stationId',
  auth,
  ctrlSensorData.deleteDataByDate);

// ============== Prediction Endpoints =============
router.get('/pred-color-gala/:stationId',
  ctrlSensorData.getColorPrediction);
router.get('/pred-size-gala/:stationId',
  ctrlSensorData.getSizePrediction);
router.get('/pred-harvest-gala/:stationId',
  ctrlSensorData.getHarvestPrediction);

// ======== Variables Summaries Endpoints ==========
router.get('/summaries',
  ctrlSummaries.listSummaries);
router.post('/summaries',
  auth,
  ctrlAuth.roleAuthorization(['administrator']),
  ctrlSummaries.createSummary);
router.delete('/summaries/:summaryId',
  auth,
  ctrlAuth.roleAuthorization(['administrator']),
  ctrlSummaries.deleteSummary);


// ================= Test Endpoints ================
router.get('/querytest',
  ctrlSensorData.queryTest);
router.get('/testreport',
  ctrlReports.generatePDF);

router.post('/uploadsensordata/:stationId', ctrlSensorData.dataUpload);

// =================================================
module.exports = router;
