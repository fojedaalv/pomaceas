var passport = require('passport');
var mongoose = require('mongoose');
var SensorData = mongoose.model('SensorData');
var Station = mongoose.model('Station');
var moment = require('moment');

var sendJSONresponse = function(res, status, content) {
  res.status(status);
  res.json(content);
};

module.exports.storeData = function(req, res){
  var arr = req.body.data;
  var objects = [];
  arr.forEach(function(row){
    /* Getting variables */
    if(row.length != 10) return;
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
    var date = new Date(Date.UTC(year, month-1, day, hour, minute));
    //console.log("Date:"+year+month+day);
    //console.log(date);
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
    var hrsDPVmay2p5 = (dpv >= 2.5) ?
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
      hrsDPVmay2p5: hrsDPVmay2p5
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
    })
    .sort({date:1})
    .exec(function(err, data){
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

module.exports.getDataCount = function(req, res){
  var stationId = req.params.stationId;
  Station.findById(stationId)
  .exec(
    function(err, station){
      if (!station) {
        sendJSONresponse(res, 404, {
          "message": "Estación no encontrada."
        });
        return;
      } else if (err) {
        sendJSONresponse(res, 400, err);
        return;
      }
      SensorData.aggregate([
        {
          $match: {
            station: stationId
          }
        },{
          $sort: {
            date: -1
          }
        },{
          $group: {
            _id : {
              month: { $month: "$date" },
              day: { $dayOfMonth: "$date" },
              year: { $year: "$date" }
            },
            count: { $sum: 1},
            maxTemp : {$max: "$tempOut"}
          }
        }
      ], function(err, result){
        if (err) {
          console.log(err);
          sendJSONresponse(res, 404, err);
          return;
        } else {
          sendJSONresponse(res, 201, result);
        }
      })
    }
  )
}

module.exports.getReportByDay = function(req, res){
  var date = req.query.date;
  var stationId = req.params.stationId;
  var d = date.split("-");
  if(d.length == 3){
    //La fecha fue bien especificada
    var startDate = new Date(Date.UTC(d[0],d[1]-1,d[2]))
    var endDate = new Date(new Date(Date.UTC(d[0],d[1]-1,d[2])).getTime() + 60 * 60 * 24 * 1000);
    Station.findOne({
      _id: stationId
    }, null, function(err, result){
      if (err) {
        console.log(err);
        sendJSONresponse(res, 404, "Al parecer estás intentando consultar una estación que no existe. Revisa que la dirección sea correcta.");
        return;
      } else {
        SensorData.aggregate([
          {
            $match: {
              station: stationId,
              date: {
                $gte: startDate,
                $lt: endDate
              }
            }
          },{
            $sort: {
              date: -1
            }
          },{
            $group: {
              _id : {
                month: { $month: "$date" },
                day: { $dayOfMonth: "$date" },
                year: { $year: "$date" }
              },
              count: { $sum: 1},
              avgTemp : {$avg: "$tempOut"},
              maxHiTemp : {$max: "$hiTemp"},
              minLowTemp : {$min: "$lowTemp"},
              avgOutHum : {$avg: "$outHum"},
              maxOutHum : {$max: "$outHum"},
              minOutHum : {$min: "$outHum"},
              hrHR95: {$sum: "$hr95"},
              hrHR40: {$sum: "$uEstres"},
              gdh: {$sum: {$divide: ["$gdh", 4]}},
              gdhora: {$sum: "$gd"},
              mineq10: {$sum: "$hr10"},
              mineq7: {$sum: "$hr7"},
              richard: {$sum: {$divide: ["$richard", 4]}},
              richardsonMod: {$sum: {$divide: ["$richardsonMod", 4]}},
              unrath: {$sum: {$divide: ["$unrath", 4]}},
              hrmen0c: {$sum: "$hrmen0c"},
              hrmay27c: {$sum: "$hrmay27c"},
              hrmay29c: {$sum: "$hrmay29c"},
              hrmay32c: {$sum: "$hrmay32c"},
              hrmen6c: {$sum: "$hrmen6c"},
              hrmen12c: {$sum: "$hrmen12c"},
              hrmen18c: {$sum: "$hrmen18c"},
              hrmay15c: {$sum: "$hrmay15c"},
              et0: {$sum: "$et"},
              horasRad12: {$sum: "$hrrad"},
              horasRad300: {$sum: "$hrrad300"},
              maxRadDia: {$max: "$solarRad"},
              energia: {$sum: {$multiply: ["$solarRad", 0.0009]}},
              vmaxViento: {$max: "$windSpeed"},
              hrAbe: {$sum: "$hrabe"},
              pp: {$sum: "$rain"},
              htTOpt: {$sum: "$hropt"},
              dpv: {$avg: "$dpv"},
              dpvMax: {$max: "$dpv"},
              eS: {$avg: "$es"},
              hrsDPVmay2p5: {$sum: "$hrsDPVmay2p5"}
            }
          },{
            $addFields: {
              min105hrs: {
                $cond: [{$gte: ["$mineq10", 5]}, 1, 0]
              },
              diasHel:{
                $cond: [{$gte: ["$hrmen0c", 1]}, 1, 0]
              },
              hrs275: {
                $cond: [{$gte: ["$hrmay27c", 5]}, 1, 0]
              },
              hrs295: {
                $cond: [{$gte: ["$hrmay29c", 5]}, 1, 0]
              },
              hrs325: {
                $cond: [{$gte: ["$hrmay32c", 5]}, 1, 0]
              }
            }
          }
        ], function(err, result){
          if (err) {
            console.log(err);
            sendJSONresponse(res, 404, err);
            return;
          } else {
            // Añade el campo maxymin al resultado obtenido
            // Reemplazar por una etapa $addFields cuando se actualice a MongoDB 3.4
            result[0].maxymin = ((((result[0].maxHiTemp + result[0].minLowTemp) / 2) - 10)>0) ?
              (((result[0].maxHiTemp + result[0].minLowTemp) / 2) - 10) :
              0;
            sendJSONresponse(res, 201, result);
            return
          }
        })
      }
    })
  }else{
    sendJSONresponse(res, 400, "Aparentemente la expresión fue mal formada.");
    return;
  }
}

module.exports.getStationSummary = function(req, res){
  var stationId = req.params.stationId;
  var summary = {
    datesAvailable: [],
    monthsAvailable: []
  }
  Station.findOne({
    _id: stationId
  }, null, function(err, station){
    if (err) {
      console.log(err);
      sendJSONresponse(res, 404, err);
      return;
    }else{
      // Lista de fechas disponibles
      SensorData.aggregate([
        {
          $match:{
            station: stationId
          }
        },{
          $sort: {
            date: -1
          }
        },{
          $group: {
            _id : {
              month: { $month: "$date" },
              day: { $dayOfMonth: "$date" },
              year: { $year: "$date" }
            },
            count: {$sum: 1}
          }
        },{
          $sort: {
            "_id.year": -1,
            "_id.month": -1,
            "_id.day":-1
          }
        }
      ], function(err, result){
        if (err) {
          console.log(err);
          sendJSONresponse(res, 404, err);
          return;
        } else {
          summary.datesAvailable = result;
          SensorData.aggregate([
            {
              $match:{
                station: stationId
              }
            },{
              $sort: {
                date: -1
              }
            },{
              $group: {
                _id : {
                  month: { $month: "$date" },
                  year: { $year: "$date" }
                },
                count: {$sum: 1}
              }
            },{
              $sort: {
                "_id.year": -1,
                "_id.month": -1
              }
            }
          ],function(err, result){
            if (err) {
              console.log(err);
              sendJSONresponse(res, 404, err);
              return;
            } else {
              summary.monthsAvailable = result;
              sendJSONresponse(res, 201, summary);
            }
          })
        }
      })
    }
  });
}

module.exports.getSensorDataByDate = function(req, res){
  var date = req.query.date;
  var stationId = req.params.stationId;
  var d = date.split("-");
  if(d.length == 3){
    //La fecha fue bien especificada
    var startDate = new Date(Date.UTC(d[0],d[1]-1,d[2]))
    var endDate = new Date(new Date(Date.UTC(d[0],d[1]-1,d[2])).getTime() + 60 * 60 * 24 * 1000);
    Station.findOne({
      _id: stationId
    }, null, function(err, result){
      if (err) {
        console.log(err);
        sendJSONresponse(res, 404, "Al parecer estás intentando consultar una estación que no existe. Revisa que la dirección sea correcta.");
        return;
      } else {
        SensorData.aggregate([{
          $match: {
            station: stationId,
            date: {
              $gte: startDate,
              $lt: endDate
            }
          }
        },{
          $sort:{
            date: 1
          }
        }], function(err, result){
          if (err) {
            console.log(err);
            sendJSONresponse(res, 404, err);
            return;
          } else {
            sendJSONresponse(res, 201, result);
          }
        });
      }
    });
  }else{
    sendJSONresponse(res, 400, "Aparentemente la expresión fue mal formada.");
    return;
  }
}

module.exports.getReportByMonth = function(req, res){
  var startDate = req.query.startdate;
  var endDate = req.query.enddate;
  var stationId = req.params.stationId;
  var d;
  var year, month, day;
  // Check startDate
  if(startDate != null){
    d = startDate.split("-");
    if(d.length == 3){
      year = d[0];
      month = d[1]-1;
      day = d[2];
      startDate = new Date(moment.utc([year, month, day]));
    }else{
      sendJSONresponse(res, 400, "Aparentemente la fecha de inicio es una expresión mal formada.");
      return;
    }
  }else{
    sendJSONresponse(res, 400, "Aparentemente la fecha de inicio es una expresión mal formada.");
    return;
  }

  // Check endDate
  if(endDate != null){
    d = endDate.split("-");
    year = d[0];
    month = d[1]-1;
    day = d[2];
    if(d.length == 3){
      endDate = new Date(moment.utc([year, month, day]).add(1, 'month'));
    }else{
      sendJSONresponse(res, 400, "Aparentemente la fecha de término es una expresión mal formada.");
      return;
    }
  }else{
    endDate = new Date(moment.utc([year, month]).add(1, 'month'));
  }

  if(startDate != null && endDate != null){
    console.log("Consultando la fecha:"+startDate+","+endDate);
    Station.findOne({
      _id: stationId
    }, null, function(err, result){
      if (err) {
        console.log(err);
        sendJSONresponse(res, 404, "Al parecer estás intentando consultar una estación que no existe. Revisa que la dirección sea correcta.");
        return;
      } else {
        SensorData.aggregate([
          {
            $match: {
              station: stationId,
              date: {
                $gte: startDate,
                $lt: endDate
              }
            }
          },{
            $sort: {
              date: -1
            }
          },{
            $group: {
              _id : {
                month: { $month: "$date" },
                day: { $dayOfMonth: "$date" },
                year: { $year: "$date" }
              },
              count: { $sum: 1},
              avgTemp : {$avg: "$tempOut"},
              maxHiTemp : {$max: "$hiTemp"},
              minLowTemp : {$min: "$lowTemp"},
              avgOutHum : {$avg: "$outHum"},
              maxOutHum : {$max: "$outHum"},
              minOutHum : {$min: "$outHum"},
              hrHR95: {$sum: "$hr95"},
              hrHR40: {$sum: "$uEstres"},
              gdh: {$sum: {$divide: ["$gdh", 4]}},
              gdhora: {$sum: "$gd"},
              mineq10: {$sum: "$hr10"},
              mineq7: {$sum: "$hr7"},
              richard: {$sum: {$divide: ["$richard", 4]}},
              richardsonMod: {$sum: {$divide: ["$richardsonMod", 4]}},
              unrath: {$sum: {$divide: ["$unrath", 4]}},
              hrmen0c: {$sum: "$hrmen0c"},
              hrmay27c: {$sum: "$hrmay27c"},
              hrmay29c: {$sum: "$hrmay29c"},
              hrmay32c: {$sum: "$hrmay32c"},
              hrmen6c: {$sum: "$hrmen6c"},
              hrmen12c: {$sum: "$hrmen12c"},
              hrmen18c: {$sum: "$hrmen18c"},
              hrmay15c: {$sum: "$hrmay15c"},
              et0: {$sum: "$et"},
              horasRad12: {$sum: "$hrrad"},
              horasRad300: {$sum: "$hrrad300"},
              maxRadDia: {$max: "$solarRad"},
              energia: {$sum: {$multiply: ["$solarRad", 0.0009]}},
              vmaxViento: {$max: "$windSpeed"},
              hrAbe: {$sum: "$hrabe"},
              pp: {$sum: "$rain"},
              htTOpt: {$sum: "$hropt"},
              dpv: {$avg: "$dpv"},
              dpvMax: {$max: "$dpv"},
              eS: {$avg: "$es"},
              hrsDPVmay2p5: {$sum: "$hrsDPVmay2p5"}
            }
          },{
            $addFields: {
              min105hrs: {
                $cond: [{$gte: ["$mineq10", 5]}, 1, 0]
              },
              diasHel:{
                $cond: [{$gte: ["$hrmen0c", 1]}, 1, 0]
              },
              hrs275: {
                $cond: [{$gte: ["$hrmay27c", 5]}, 1, 0]
              },
              hrs295: {
                $cond: [{$gte: ["$hrmay29c", 5]}, 1, 0]
              },
              hrs325: {
                $cond: [{$gte: ["$hrmay32c", 5]}, 1, 0]
              },
              tempMaxYMin: {
                $cond: [
                  {
                    $gt: [
                      {
                        $subtract: [
                          {
                            $divide: [
                              {
                                $add: ["$maxHiTemp", "$minLowTemp"]
                              },
                              2
                            ]
                          },
                          -10
                        ]
                      },
                      0
                    ]
                  },
                  {
                    $subtract: [
                      {
                        $divide: [
                          {
                            $add: ["$maxHiTemp", "$minLowTemp"]
                          },
                          2
                        ]
                      },
                      -10
                    ]
                  },
                  0
                ]
              }
            }
          },{
            $group: {
              _id : {
                month: "$_id.month",
                year: "$_id.year"
              },
              tempMediaDiaria: {
                $avg: "$avgTemp"
              },
              tempMediaMax: {
                $avg: "$maxHiTemp"
              },
              tempMediaMin: {
                $avg: "$minLowTemp"
              },
              tempMaxMax: {
                $max: "$maxHiTemp"
              },
              tempMinMin: {
                $min: "$minLowTemp"
              }
            }
          },{
            $sort: {
              "_id.year": 1,
              "_id.month":1
            }
          }
        ], function(err, result){
          if (err) {
            console.log(err);
            sendJSONresponse(res, 404, err);
            return;
          } else {
            // Reemplazar por una etapa $addFields cuando se actualice a MongoDB 3.4
            for(var i=0; i<result.length;i++){
              result[i].date = new Date(moment.utc([result[i]._id.year, result[i]._id.month-1]));
            }
            sendJSONresponse(res, 201, result);
            return
          }
        })
      }
    })
  }else{
    sendJSONresponse(res, 400, "Aparentemente la expresión fue mal formada.");
    return;
  }
}
