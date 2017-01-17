var express = require('express');
var router = express.Router();

var ctrlWebApp = require('../controllers/webapp');

router.get('/', ctrlWebApp.angularWebApp);

module.exports = router;
