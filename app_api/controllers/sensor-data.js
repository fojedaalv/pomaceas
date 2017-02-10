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
      tempOut: Number(row[2]),
      hiTemp: Number(row[3]),
      lowTemp: Number(row[4]),
      outHum: Number(row[5]),
      windSpeed: Number(row[6]),
      rain: Number(row[7]),
      solarRad: Number(row[8]),
      et: Number(row[9])
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

module.exports.queryTest = function(req, res){
  console.log("Starting test query.");
  SensorData.aggregate([
    {
      $match: {
        date: {
          $gte: "2016-12-01",
          $lte: "2016-12-31"
        }
      }
    },
    {
      $project: {
        _id: 0,
        date: 1,
        tempOut: 1,
        outHum: 1,
        hr95: {
          $cond: {
            if: {
              $gte: [ "$hr95", 95 ]
            },
            then: 0.25,
            else: 0
          }
        },
        uEstres: {
          $cond: {
            if: {
              $and: [{
                $gte: ["$tempOut", 10]
              },{
                $lte: ["$outHum", 75]
              }]
            },
            then: {
              $multiply: [{
                $multiply: [{
                  $subtract: ["$tempOut",10]
                },{
                  $add: [{
                    $multiply: ["$outHum", -0.2]
                  },15]
                }]
              }, 0.25]
            },
            else: 0
          }
        }
      }
    }
  ], function (err, result) {
    if (err) {
      console.log(err);
      return;
    } else {
      sendJSONresponse(res, 201, result);
    }
  });
}
