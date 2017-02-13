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
    /* Getting variables */
    var tempOut = Number(row[2]);
    var hiTemp = Number(row[3]);
    var lowTemp = Number(row[4]);
    var outHum = Number(row[5]);
    var windSpeed = Number(row[6]);
    var rain = Number(row[7]);
    var solarRad = Number(row[8]);
    var et = Number(row[9]);
    /* Formatting date as ISODate */
    var isodate = row[0].slice(6,10)+"-"+row[0].slice(3, 5)+"-"+row[0].slice(0,2)+"T"+row[1]+":00Z";
    var year = row[0].slice(6,10);
    var month = row[0].slice(3, 5);
    var day = row[0].slice(0,2);
    var time = row[1].split(":");
    var hour = time[0];
    var minute = time[1];
    var date = new Date(year, month, day, hour, minute);
    /* Cálculo de Indicadores extra */
    var hr95 = (outHum >= 95) ? 0.25 : 0.0;
    var uEstres = (tempOut >= 10 && outHum <= 75) ?
                  ((tempOut - 10) * ((outHum*-0.2)+15))*0.25 :
                  0.0;
    var gdh = (tempOut > 4) ?
              (
                (tempOut <= 36) ?
                (
                  (tempOut <= 25) ?
                  (
                    (21/2)*(1 + Math.cos(Math.PI + Math.PI*(tempOut-4)/21))
                  ) :
                  (
                    21*(1+Math.cos(Math.PI/2 + Math.PI/2*(tempOut-25)/11))
                  )
                ) :
                0.0
              ) :
              0.0;
    var gd = (tempOut >= 10) ? (tempOut-10)/96 : 0.0;
    var hr10 = (tempOut < 0) ?
               0 :
               (
                 (tempOut <= 10) ?
                 0.25 :
                 0.0
               );
    var hr7 = (tempOut < 0) ?
               0 :
               (
                 (tempOut <= 7) ?
                 0.25 :
                 0.0
               );
    var richard = (tempOut < 1.5) ?
                  0.0 :
                  (
                    (tempOut < 2.5) ?
                    0.5 :
                    (
                      (tempOut < 9.2) ?
                      1 :
                      (
                        (tempOut < 12.5) ?
                        0.5 :
                        (
                          (tempOut < 16) ?
                          0.0 :
                          (
                            (tempOut < 18.1) ?
                            -0.5 :
                            (
                              (tempOut < 19.6) ?
                              -1 :
                              -2
                            )
                          )
                        )
                      )
                    )
                  );
    var richardsonMod = (tempOut < 1.5) ?
                  0.0 :
                  (
                    (tempOut < 2.5) ?
                    0.5 :
                    (
                      (tempOut < 9.2) ?
                      1 :
                      (
                        (tempOut < 12.5) ?
                        0.5 :
                        0.0
                      )
                    )
                  );
    var unrath = (tempOut <= -1.1) ?
                 0.0 :
                 (
                   (tempOut <= 1.6) ?
                   0.5 :
                   (
                     (tempOut <= 7.2) ?
                     1 :
                     (
                       (tempOut <= 13) ?
                       0.5 :
                       (
                         (tempOut <= 16.5) ?
                         0 :
                         (
                           (tempOut <= 19) ?
                           -0.5 :
                           (
                             (tempOut <= 20.7) ?
                             -1 :
                             (
                               (tempOut <= 22.1) ?
                               -1.5 :
                               -2
                             )
                           )
                         )
                       )
                     )
                   )
                 );
    var hrmen0c = (tempOut <= 0) ?
                  0.25 :
                  0.0;
    var hrmay27c = (tempOut >= 27) ?
                  0.25 :
                  0.0;
    var hrmay29c = (tempOut >= 29) ?
                  0.25 :
                  0.0;
    var hrmay32c = (tempOut >= 32) ?
                  0.25 :
                  0.0;
    var hrmen6c = (tempOut <= 6) ?
                  0.25 :
                  0.0;
    var hrmen12c = (tempOut <= 12) ?
                  0.25 :
                  0.0;
    var hrmen18c = (tempOut <= 18) ?
                  0.25 :
                  0.0;
    var hrmay15c = (tempOut >= 15) ?
                  0.25 :
                  0.0;
    var hrrad = (solarRad >= 12) ?
                0.25 :
                0.0;
    var hrrad300 = (solarRad >= 300) ?
                0.25 :
                0.0;
    var hrabe = (tempOut >= 14) ?
                (
                  (solarRad >= 300) ?
                  0.25 :
                  0.0
                ) :
                0.0;
    var hropt = (tempOut >= 20) ?
                (
                  (tempOut <= 25) ?
                  0.25 :
                  0.0
                ) :
                0.0;
    var dpv = Math.exp((16.78*tempOut-116.9)/(tempOut+237.3))*(1-outHum/100);
    var es = Math.exp((16.78*tempOut-116.9)/(tempOut+237.3));
    var hrsdpvm2p5 = (dpv >= 2.5) ?
                     0.25 :
                     0;
    /* Building document */
    objects.push({
      station: req.body.station,
      date: date,
      tempOut: tempOut,
      hiTemp: hiTemp,
      lowTemp: lowTemp,
      outHum: outHum,
      windSpeed: windSpeed,
      rain: rain,
      solarRad: solarRad,
      et: et,
      hr95: hr95,
      uEstres: uEstres,
      gdh : gdh,
      gd : gd,
      hr10: hr10,
      hr7: hr7,
      richard: richard,
      richardsonMod: richardsonMod,
      unrath: unrath,
      hrmen0c: hrmen0c,
      hrmay27c: hrmay27c,
      hrmay29c: hrmay29c,
      hrmay32c: hrmay32c,
      hrmen6c: hrmen6c,
      hrmen12c: hrmen12c,
      hrmen18c: hrmen18c,
      hrmay15c: hrmay15c,
      hrrad: hrrad,
      hrrad300: hrrad300,
      hrabe: hrabe,
      hropt: hropt,
      dpv: dpv,
      es: es,
      hrsdpvm2p5: hrsdpvm2p5
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
  var startDate = new Date(2016, 11, 01);
  var endDate = new Date(2016, 11, 31);
  console.log("Querying dates: "+startDate+","+endDate);
  SensorData.find(
    {
      date: {
        $gte: startDate,
        $lte: endDate
      }
    },
    {},
    function(err, data){
      if(err){
        console.log(err);
        sendJSONresponse(res, 400, err);
      }else{
        sendJSONresponse(res, 201, data);
      }
    });
  /*
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
              $gte: [ "$outHum", 95 ]
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
  */
}
