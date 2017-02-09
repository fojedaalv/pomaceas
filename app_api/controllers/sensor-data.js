var passport = require('passport');
var mongoose = require('mongoose');
var SensorData = mongoose.model('SensorData');

var sendJSONresponse = function(res, status, content) {
  res.status(status);
  res.json(content);
};

module.exports.storeData = function(req, res){
  var arr = req.body.data;
  var objects = [];
  arr.forEach(function(row){
    var d = row[0].slice(6,10)+"-"+row[0].slice(3, 5)+"-"+row[0].slice(0,2);
    d = d+"T"+row[1]+":00Z";
    objects.push({
      station: req.body.station,
      date: d,
      tempOut: row[2],
      hiTemp: row[3],
      outHum: row[4],
      windSpeed: row[5],
      rain: row[6],
      solarRad: row[7],
      et: row[8]
    });
  });
  SensorData.collection.insert(objects, function(err, docs){
    if (err) {
      sendJSONresponse(res, 400, {
        "message": "Se ha producido un error en la inserción de los datos. Detalles: "+ err
      });
      return;
    } else {
      console.info(docs.result.n + ' objects were successfully inserted.');
      sendJSONresponse(res, 201, "DatosInsertados");
    }
  })
};
