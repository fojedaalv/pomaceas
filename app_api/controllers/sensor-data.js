var passport = require('passport');
var mongoose = require('mongoose');
var SensorData = mongoose.model('SensorData');
var Station = mongoose.model('Station');
var moment = require('moment');

var sendJSONresponse = function(res, status, content) {
  res.status(status);
  res.json(content);
};

var sumArray = function(arr){
  var sum = 0;
  for(var i=0;i<arr.length;i++){
    sum+=arr[i];
  }
  return sum;
}

function getMaxOfArray(arr) {
  return Math.max.apply(null, arr);
}

function getMinOfArray(arr) {
  return Math.min.apply(null, arr);
}

var avgArray = function(arr){
  var sum = 0;
  for(var i=0;i<arr.length;i++){
    sum+=arr[i];
  }
  return sum/arr.length;
}

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
      endDate = new Date(moment.utc([year, month, day]).add(1, 'day'));
    }else{
      sendJSONresponse(res, 400, "Aparentemente la fecha de término es una expresión mal formada.");
      return;
    }
  }else{
    endDate = new Date(moment.utc([year, month, day]).add(1, 'day'));
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
              hrTOpt: {$sum: "$hropt"},
              dpv: {$avg: "$dpv"},
              dpvMax: {$max: "$dpv"},
              eS: {$avg: "$es"},
              hrsDPVmay2p5: {$sum: "$hrsDPVmay2p5"}
            }
          },{
            $sort: {
              "_id.year": 1,
              "_id.month": 1,
              "_id.day":1
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
              //Eliminar las siguientes operaciones al usar la etapa $addFields
              result[i].tempMaxYMin = ((((result[i].maxHiTemp + result[i].minLowTemp) / 2) - 10)>0) ?
                (((result[i].maxHiTemp + result[i].minLowTemp) / 2) - 10) :
                0;
              result[i].min105hrs = (result[i].mineq10 >= 5) ? 1 : 0;
              result[i].diasHel = (result[i].hrmen0c >= 1) ? 1 : 0;
              result[i].hrs275 = (result[i].hrmay27c >= 5) ? 1 : 0;
              result[i].hrs295 = (result[i].hrmay29c >= 5) ? 1 : 0;
              result[0].hrs325 = (result[0].hrmay32c >= 5) ? 1 : 0;
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
  var stationId = req.params.stationId;

  var startDate = req.query.startdate;
  var endDate = req.query.enddate;
  var d;
  var year, month, day

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
      endDate = new Date(moment.utc([year, month, day]).add(1, 'day'));
    }else{
      sendJSONresponse(res, 400, "Aparentemente la fecha de término es una expresión mal formada.");
      return;
    }
  }else{
    endDate = new Date(moment.utc([year, month, day]).add(1, 'day'));
  }

  if(startDate != null && endDate != null){
    console.log("Consultando la fecha:"+startDate+","+endDate);
    //La fecha fue bien especificada
    Station.findOne({
      _id: stationId
    },
    null,
    function(err, result){
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
          $project: {
            _id: 1,
            date: 1,
            tempOut: 1,
            hiTemp: 1,
            lowTemp: 1,
            outHum: 1,
            windSpeed: 1,
            rain: 1,
            solarRad: 1,
            et: 1
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

module.exports.getDailySensorDataByMonth = function(req, res){
  var date = req.query.date;
  var stationId = req.params.stationId;
  var d = date.split("-");
  if(d.length == 2){
    //La fecha fue bien especificada
    var year = d[0];
    var month = d[1]-1;
    var startDate = new Date(moment.utc([year, month, 1]));
    var endDate = new Date(moment.utc([year, month, 1]).add(1, 'month'));
    console.log(startDate+"-"+endDate);
    //new Date(new Date(Date.UTC(d[0],d[1]-1,d[2])).getTime() + 60 * 60 * 24 * 1000);
    Station.findOne({
      _id: stationId
    },
    null,
    function(err, result){
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
          $project: {
            _id: 1,
            date: 1,
            tempOut: 1,
            hiTemp: 1,
            lowTemp: 1,
            outHum: 1,
            windSpeed: 1,
            rain: 1,
            solarRad: 1,
            et: 1
          }
        },{
          $sort:{
            date: 1
          }
        },{
          $group:{
            _id: {
              year: {$year: "$date"},
              month: {$month: "$date"},
              day: {$dayOfMonth: "$date"}
            },
            tempOut: {$avg: "$tempOut"},
            hiTemp: {$avg: "$hiTemp"},
            lowTemp: {$avg: "$lowTemp"},
            outHum: {$avg: "$outHum"},
            windSpeed: {$avg: "$windSpeed"},
            rain: {$avg: "$rain"},
            solarRad: {$avg: "$solarRad"},
            et: {$avg: "$et"}
          }
        },{
          $sort:{
            "_id.year": 1,
            "_id.month": 1,
            "_id.day":1
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
              hrTOpt: {$sum: "$hropt"},
              dpv: {$avg: "$dpv"},
              dpvMax: {$max: "$dpv"},
              eS: {$avg: "$es"},
              hrsDPVmay2p5: {$sum: "$hrsDPVmay2p5"}
            }
          },{
            $sort: {
              "_id.year": 1,
              "_id.month": 1,
              "_id.day":1
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
              // Eliminar las siguientes instrucciones al usar una etapa $addFields
              result[i].tempMaxYMin = ((((result[i].maxHiTemp + result[i].minLowTemp) / 2) - 10)>0) ?
                (((result[i].maxHiTemp + result[i].minLowTemp) / 2) - 10) :
                0;
              result[i].min105hrs = (result[i].mineq10 >= 5) ? 1 : 0;
              result[i].diasHel = (result[i].hrmen0c >= 1) ? 1 : 0;
              result[i].hrs275 = (result[i].hrmay27c >= 5) ? 1 : 0;
              result[i].hrs295 = (result[i].hrmay29c >= 5) ? 1 : 0;
              result[i].hrs325 = (result[i].hrmay32c >= 5) ? 1 : 0;
            }

            // Emular la función Group By de la agregación de MongoDB
            // Se asume que las fechas vienen en orden creciente
            // Ahora hay que agrupar por result[i]._id.year, result[i]._id.month
            var groupedResult = [];
            var tempMonth = {
              _id: {}
            };
            for(var i=0; i<result.length+1;i++){
              var item = {};
              if(i == result.length){
                item = {
                  _id: {}
                };
              }else{
                item = result[i];
              }
              if( tempMonth._id.year == item._id.year &&
                  tempMonth._id.month == item._id.month){
                // Extender el objeto existente
                //tempMonth.count += 1;
                tempMonth.tempMediaDiaria.push(item.avgTemp);
                tempMonth.tempMediaMax.push(item.maxHiTemp);
                tempMonth.tempMediaMin.push(item.minLowTemp);
                tempMonth.tempMaxMax.push(item.maxHiTemp);
                tempMonth.tempMinMin.push(item.minLowTemp);
                tempMonth.hrMedia.push(item.avgOutHum);
                tempMonth.hrMaxima.push(item.maxOutHum);
                tempMonth.hrMinima.push(item.minOutHum);
                tempMonth.horas95.push(item.hrHR95);
                tempMonth.estres.push(item.hrHR40);
                tempMonth.gdMaxYMin.push(item.tempMaxYMin);
                tempMonth.gdh.push(item.gdh);
                tempMonth.gd.push(item.gdhora);
                tempMonth.mineq10.push(item.mineq10);
                tempMonth.min105hrs.push(item.min105hrs);
                tempMonth.mineq7.push(item.mineq7);
                tempMonth.richardson.push(item.richard);
                tempMonth.unrath.push(item.unrath);
                tempMonth.diasHel.push(item.diasHel);
                tempMonth.hrmen0c.push(item.hrmen0c);
                tempMonth.hrmay27c.push(item.hrmay27c);
                tempMonth.hrmay29c.push(item.hrmay29c);
                tempMonth.hrmay32c.push(item.hrmay32c);
                tempMonth.dias5hrsmay27.push(item.hrs275);
                tempMonth.dias5hrsmay29.push(item.hrs295);
                tempMonth.dias5hrsmay32.push(item.hrs325);
                tempMonth.hrmen6c.push(item.hrmen6c);
                tempMonth.hrmen12c.push(item.hrmen12c);
                tempMonth.hrmen18c.push(item.hrmen18c);
                tempMonth.hrmay15c.push(item.hrmay15c);
                tempMonth.et0.push(item.et0);
                tempMonth.horasRad12.push(item.horasRad12);
                tempMonth.horasRad300.push(item.horasRad300);
                tempMonth.maxRad.push(item.maxRadDia);
                tempMonth.energia.push(item.energia);
                tempMonth.vmaxViento.push(item.vmaxViento);
                tempMonth.hrAbe.push(item.hrAbe);
                tempMonth.pp.push(item.pp);
                tempMonth.hrTOpt.push(item.hrTOpt);
                tempMonth.dpv.push(item.dpv);
                tempMonth.hrsDPVmay2p5.push(item.hrsDPVmay2p5);
              }else{
                // Guardar el objeto anterior
                if(tempMonth._id.year != null){
                  console.log("tempMonth:"+tempMonth);
                  groupedResult.push(tempMonth);
                  tempMonth = {
                    _id: {}
                  };
                }
                // Crear el objeto con las propiedades nuevas
                tempMonth._id.year = item._id.year;
                tempMonth._id.month = item._id.month;
                //tempMonth.count = 1;
                tempMonth.tempMediaDiaria = [item.avgTemp];
                tempMonth.tempMediaMax = [item.maxHiTemp];
                tempMonth.tempMediaMin = [item.minLowTemp];
                tempMonth.tempMaxMax = [item.maxHiTemp];
                tempMonth.tempMinMin = [item.minLowTemp];
                tempMonth.hrMedia = [item.avgOutHum];
                tempMonth.hrMaxima = [item.maxOutHum];
                tempMonth.hrMinima = [item.minOutHum];
                tempMonth.horas95 = [item.hrHR95];
                tempMonth.estres = [item.hrHR40];
                tempMonth.gdMaxYMin = [item.tempMaxYMin];
                tempMonth.gdh = [item.gdh];
                tempMonth.gd = [item.gdhora];
                tempMonth.mineq10 = [item.mineq10];
                tempMonth.min105hrs = [item.min105hrs];
                tempMonth.mineq7 = [item.mineq7];
                tempMonth.richardson = [item.richard];
                tempMonth.unrath = [item.unrath];
                tempMonth.diasHel = [item.diasHel];
                tempMonth.hrmen0c = [item.hrmen0c];
                tempMonth.hrmay27c = [item.hrmay27c];
                tempMonth.hrmay29c = [item.hrmay29c];
                tempMonth.hrmay32c = [item.hrmay32c];
                tempMonth.dias5hrsmay27 = [item.hrs275];
                tempMonth.dias5hrsmay29 = [item.hrs295];
                tempMonth.dias5hrsmay32 = [item.hrs325];
                tempMonth.hrmen6c = [item.hrmen6c];
                tempMonth.hrmen12c = [item.hrmen12c];
                tempMonth.hrmen18c = [item.hrmen18c];
                tempMonth.hrmay15c = [item.hrmay15c];
                tempMonth.et0 = [item.et0];
                tempMonth.horasRad12 = [item.horasRad12];
                tempMonth.horasRad300 = [item.horasRad300];
                tempMonth.maxRad = [item.maxRadDia];
                tempMonth.energia = [item.energia];
                tempMonth.vmaxViento = [item.vmaxViento];
                tempMonth.hrAbe = [item.hrAbe];
                tempMonth.pp = [item.pp];
                tempMonth.hrTOpt = [item.hrTOpt];
                tempMonth.dpv = [item.dpv];
                tempMonth.hrsDPVmay2p5 = [item.hrsDPVmay2p5];
                tempMonth.date = [item.date];
              }
            }
            for(var i=0; i<groupedResult.length; i++){
              groupedResult[i].tempMediaDiaria = avgArray(groupedResult[i].tempMediaDiaria);
              groupedResult[i].tempMediaMax = avgArray(groupedResult[i].tempMediaMax);
              groupedResult[i].tempMediaMin = avgArray(groupedResult[i].tempMediaMin);
              groupedResult[i].tempMaxMax = getMaxOfArray(groupedResult[i].tempMaxMax);
              groupedResult[i].tempMinMin = getMinOfArray(groupedResult[i].tempMinMin);
              groupedResult[i].hrMedia = avgArray(groupedResult[i].hrMedia);
              groupedResult[i].hrMaxima = avgArray(groupedResult[i].hrMaxima);
              groupedResult[i].hrMinima = avgArray(groupedResult[i].hrMinima);
              groupedResult[i].horas95 = sumArray(groupedResult[i].horas95);
              groupedResult[i].estres = sumArray(groupedResult[i].estres);
              groupedResult[i].gdMaxYMin = sumArray(groupedResult[i].gdMaxYMin);
              groupedResult[i].gdh = sumArray(groupedResult[i].gdh);
              groupedResult[i].gd = sumArray(groupedResult[i].gd);
              groupedResult[i].mineq10 = sumArray(groupedResult[i].mineq10);
              groupedResult[i].min105hrs = sumArray(groupedResult[i].min105hrs);
              groupedResult[i].mineq7 = sumArray(groupedResult[i].mineq7);
              groupedResult[i].richardson = sumArray(groupedResult[i].richardson);
              groupedResult[i].unrath = sumArray(groupedResult[i].unrath);
              groupedResult[i].diasHel = sumArray(groupedResult[i].diasHel);
              groupedResult[i].hrmen0c = sumArray(groupedResult[i].hrmen0c);
              groupedResult[i].hrmay27c = sumArray(groupedResult[i].hrmay27c);
              groupedResult[i].hrmay29c = sumArray(groupedResult[i].hrmay29c);
              groupedResult[i].hrmay32c = sumArray(groupedResult[i].hrmay32c);
              groupedResult[i].dias5hrsmay27 = sumArray(groupedResult[i].dias5hrsmay27);
              groupedResult[i].dias5hrsmay29 = sumArray(groupedResult[i].dias5hrsmay29);
              groupedResult[i].dias5hrsmay32 = sumArray(groupedResult[i].dias5hrsmay32);
              groupedResult[i].hrmen6c = sumArray(groupedResult[i].hrmen6c);
              groupedResult[i].hrmen12c = sumArray(groupedResult[i].hrmen12c);
              groupedResult[i].hrmen18c = sumArray(groupedResult[i].hrmen18c);
              groupedResult[i].hrmay15c = sumArray(groupedResult[i].hrmay15c);
              groupedResult[i].et0 = sumArray(groupedResult[i].et0);
              groupedResult[i].horasRad12 = avgArray(groupedResult[i].horasRad12);
              groupedResult[i].horasRad300 = sumArray(groupedResult[i].horasRad300);
              groupedResult[i].maxRad = avgArray(groupedResult[i].maxRad);
              groupedResult[i].energia = sumArray(groupedResult[i].energia);
              groupedResult[i].vmaxViento = avgArray(groupedResult[i].vmaxViento);
              groupedResult[i].hrAbe = sumArray(groupedResult[i].hrAbe);
              groupedResult[i].pp = sumArray(groupedResult[i].pp);
              groupedResult[i].hrTOpt = sumArray(groupedResult[i].hrTOpt);
              groupedResult[i].dpv = sumArray(groupedResult[i].dpv);
              groupedResult[i].hrsDPVmay2p5 = sumArray(groupedResult[i].hrsDPVmay2p5);
            }
            sendJSONresponse(res, 201, groupedResult);
            return;
          }
        })
      }
    })
  }else{
    sendJSONresponse(res, 400, "Aparentemente la expresión fue mal formada.");
    return;
  }
}

/* Etapa $addFields de getReportByDay */
/*
{
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
                10
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
            10
          ]
        },
        0
      ]
    }
  }
}
*/


/* Etapas para agrupar por mes después del $addFields
{
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
    },
    hrMedia: {
      $avg: "$avgOutHum"
    },
    hrMaxima: {
      $avg: "$maxOutHum"
    },
    hrMinima: {
      $avg: "$minOutHum"
    },
    horas95: {
      $sum: "$hrHR95"
    },
    estres: {
      $sum: "$hrHR40"
    },
    gdMaxYMin: {
      $sum: "$tempMaxYMin"
    },
    gdh: {
      $sum: "$gdh"
    },
    gd: {
      $sum: "$gdhora"
    },
    mineq10: {
      $sum: "$mineq10"
    },
    min105hrs: {
      $sum: "$min105hrs"
    },
    mineq7: {
      $sum: "$mineq7"
    },
    richardson: {
      $sum: "$richard"
    },
    unrath: {
      $sum: "$unrath"
    },
    diasHel: {
      $sum: "$diasHel"
    },
    hrmen0c: {
      $sum: "$hrmen0c"
    },
    hrmay27c: {
      $sum: "$hrmay27c"
    },
    hrmay29c: {
      $sum: "$hrmay29c"
    },
    hrmay32c: {
      $sum: "$hrmay32c"
    },
    dias5hrsmay27: {
      $sum: "$hrs275"
    },
    dias5hrsmay29: {
      $sum: "$hrs295"
    },
    dias5hrsmay32: {
      $sum: "$hrs325"
    },
    hrmen6c: {
      $sum: "$hrmen6c"
    },
    hrmen12c: {
      $sum: "$hrmen12c"
    },
    hrmen18c: {
      $sum: "$hrmen18c"
    },
    hrmay15c: {
      $sum: "$hrmay15c"
    },
    et0: {
      $sum: "$et0"
    },
    horasRad12: {
      $avg: "$horasRad12"
    },
    horasRad300: {
      $sum: "$horasRad300"
    },
    maxRad: {
      $avg: "$maxRadDia"
    },
    energia: {
      $sum: "$energia"
    },
    vmaxViento: {
      $avg: "$vmaxViento"
    },
    hrAbe: {
      $sum: "$hrAbe"
    },
    pp: {
      $sum: "$pp"
    },
    hrTOpt: {
      $sum: "$hrTOpt"
    },
    dpv: {
      $sum: "$dpv"
    },
    hrsDPVmay2p5: {
      $sum: "$hrsDPVmay2p5"
    }
  }
},{
  $sort: {
    "_id.year": 1,
    "_id.month":1
  }
}
*/
