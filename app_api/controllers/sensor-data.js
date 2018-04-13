var passport = require('passport');
var mongoose = require('mongoose');
var SensorData = mongoose.model('SensorData');
var NutritionalData = mongoose.model('NutritionalData');
var Station = mongoose.model('Station');
var moment = require('moment');

var isObjectIdValid = mongoose.Types.ObjectId.isValid;

var sendJSONresponse = function(res, status, content) {
  res.status(status);
  res.json(content);
};

var multer = require('multer');
var upload = multer({
  storage: multer.memoryStorage()
}).single('csvfile');

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

function variableIsInArray(variable, array){
  var isInArray = -1;
  var index = 0;
  for(arrVar of array){
    if (variable == arrVar) {
      isInArray = index;
      break;
    }
    index+=1;
  }
  return isInArray;
}

module.exports.dataUpload = function (req, res) {
  upload(req,res,function(err){
    if(err){
      sendJSONresponse(res, 422, {
        message: "Ocurrió un error en la subida del archivo."
      })
      return;
    }

    if(false){
      // Code to save uploaded data as CSV
      var fs = require('fs');
      var file = fs.createWriteStream('uploadedData.csv');
      file.on('error', function(err) {
        console.log(err);
      });
      req.body.data.forEach(
        function(v) {
          var a = [
            v['0'],
            v['1'],
            v['2'],
            v['3'],
            v['4'],
            v['5'],
            v['6'],
            v['7'],
            v['8'],
            v['9']
          ]
          file.write(a.join(', ') + '\n');
        }
      );
      file.end();
    }
    var objects = [];
    req.body.data.forEach(function(row){
      /* Getting variables */
      if(row.length < 10) return;
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
      // Los datos vienen en formato DD-MM-YY
      // La hora viene en formato HH-mm
      let tempDate = row[0].split("-");
      let tempTime = row[1].split("-");
      let year   = "20"+tempDate[2];
      let month  = tempDate[1];
      let day    = tempDate[0];
      let hour   = tempTime[0];
      let minute = tempTime[1];
      var date   = new Date(Date.UTC(year, month-1, day, hour, minute));
      //console.log("Date:"+year+month+day);
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
        station: req.params.stationId,
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
    SensorData.collection.insertMany(objects, {ordered: true}, function(err, docs){
      if (err) {
        console.log(JSON.stringify(err, null, "\t"));
        sendJSONresponse(res, 400, {
          message: "Se ha producido un error en la inserción de los datos. Probablemente se hayan subido datos que ya estaban en el sistema."
        });
        return;
      }else{
        sendJSONresponse(res, 201, {
          message: "Inserción exitosa de datos.",
          nInserted: docs.result.n
        });
        return;
      }
    })
  })
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
  SensorData.collection.insert(objects, {ordered: false}, function(err, docs){
    if (err) {
      //console.log(JSON.stringify(err, null, "\t"));
      sendJSONresponse(res, 400, {
        message: "Se ha producido un error en la inserción de los datos. Probablemente se hayan subido datos que ya estaban en el sistema.",
        error: err
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
              tempOut : {$avg: "$tempOut"},
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
              result[i].date = new Date(moment.utc([result[i]._id.year, result[i]._id.month-1, result[i]._id.day]));
              //Eliminar las siguientes operaciones al usar la etapa $addFields
              result[i].tempMaxYMin = ((((result[i].maxHiTemp + result[i].minLowTemp) / 2) - 10)>0) ?
                (((result[i].maxHiTemp + result[i].minLowTemp) / 2) - 10) :
                0;
              result[i].min105hrs = (result[i].mineq10 >= 5) ? 1 : 0;
              result[i].diasHel = (result[i].hrmen0c >= 1) ? 1 : 0;
              result[i].hrs275 = (result[i].hrmay27c >= 5) ? 1 : 0;
              result[i].hrs295 = (result[i].hrmay29c >= 5) ? 1 : 0;
              result[i].hrs325 = (result[i].hrmay32c >= 5) ? 1 : 0;
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
    monthsAvailable: [],
    yearsAvailable: [],
    lastReading: null
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
                  summary.yearsAvailable = result;
                  SensorData.aggregate([
                    {
                      $match:{
                        station: stationId
                      }
                    },
                    {
                      $group: {
                        _id: null,
                        maxDate: {$max: "$date"}
                      }
                    }
                  ],function(err, result){
                    if (err) {
                      console.log(err);
                      sendJSONresponse(res, 404, err);
                      return;
                    }else{
                      if(result.length!=0){
                        summary.lastReading = result[0].maxDate;
                      }
                      sendJSONresponse(res, 201, summary);
                    }
                  })
                }
              })
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
                  //console.log("tempMonth:"+JSON.stringify(tempMonth));
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
                tempMonth.date = item.date;
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

module.exports.getColorPrediction = (req, res) => {
  var stationId = req.params.stationId;
  var year = req.query.year;
  if( isObjectIdValid(stationId) && year ){
    SensorData.aggregate([{
      $match: {
        station: stationId,
        date: {
          $gte: new Date(Date.UTC(year, 0, 0, 0, 0, 0)),
          $lt: new Date(Date.UTC(year, 1, 0, 0, 0, 0))
        }
      }
    }, {
      $project: {
        _id: 1,
        date: 1,
        hr10: 1
      }
    }, {
      $group: {
        _id : {
          month: { $month: "$date" }
        },
        hr10: {$sum: "$hr10"}
      }
    }], function(err, result){
      if (err) {
        console.log(err);
        sendJSONresponse(res, 404, err);
        return;
      } else {
        if(result.length==0){
          sendJSONresponse(res, 201, {
            stationId: stationId,
            year: year,
            hr10: hr10,
            potential: 'no-data'
          });
          return;
        }else{
          var potential = null;
          console.log(result);
          var hr10 = result[0].hr10;
          if(hr10 <= 10){
            potential = 'low-potential';
          }else if(hr10 <= 20){
            potential = 'mid-potential';
          }else{
            potential = 'high-potential';
          }
          sendJSONresponse(res, 201, {
            stationId: stationId,
            year: year,
            hr10: hr10,
            potential: potential
          });
          return;
        }
      }
    });
  }else{
    sendJSONresponse(res, 400, {
      error: "La expresión fue mal formada. Revise si los parámetros están completos."
    });
    return;
  }
}

module.exports.getSizePrediction = (req, res) => {
  var stationId = req.params.stationId;
  var year = req.query.year;
  if( isObjectIdValid(stationId) && year != 'undefined' ){
    var tempArray = [10,10.1,10.2,10.3,10.4,10.5,10.6,10.7,10.8,10.9,11,11.1,11.2,11.3,11.4,11.5,11.6,11.7,11.8,11.9,12,12.1,12.2,12.3,12.4,12.5,12.6,12.7,12.8,12.9,13,13.1,13.2,13.3,13.4,13.5,13.6,13.7,13.8,13.9,14,14.1,14.2,14.3,14.4,14.5,14.6,14.7,14.8,14.9,15,15.1,15.2,15.3,15.4,15.5,15.6,15.7,15.8,15.9,16,16.1,16.2,16.3,16.4,16.5,16.6,16.7,16.8,16.9,17,17.1,17.2,17.3,17.4,17.5,17.6,17.7,17.8,17.9,18];
    var bigSizePercent = [10.1142,10.1142,10.1142,10.1142,10.1142,10.1142,10.1142,10.1142,10.1142,10.1142,10.1142,10.1142,10.1142,10.1142,10.1142,10.1142,10.1142,10.1142,10.1142003,10.1142014,10.1142068,10.1142306,10.1143272,10.1146896,10.115944,10.1199521,10.1317664,10.1638711,10.2442431,10.4294356,10.8217335,11.584557,12.9433925,15.1546138,18.428656,22.8130812,28.0723273,33.6278796,38.6207142,42.1128459,43.3711987,42.1177734,38.6294944,33.6387439,28.0833913,22.8228617,18.4363411,15.1600495,12.9468798,11.586596,10.8228238,10.42997,10.2444836,10.1639706,10.1318043,10.1199654,10.1159483,10.1146908,10.1143276,10.1142307,10.1142068,10.1142014,10.1142003,10.1142,10.1142,10.1142,10.1142,10.1142,10.1142,10.1142,10.1142,10.1142,10.1142,10.1142,10.1142,10.1142,10.1142,10.1142,10.1142,10.1142,10.1142];
    var avgWeight = [154.1412,154.1412,154.1412,154.1412,154.1412,154.1412,154.1412,154.1412,154.1412,154.1412,154.1412,154.141201,154.141203,154.141209,154.14123,154.141291,154.141464,154.141931,154.143133,154.146075,154.152933,154.16814,154.200221,154.264567,154.387227,154.609322,154.991018,155.613121,156.573595,157.976285,159.910286,162.421199,165.479416,168.95445,172.60611,176.101348,179.059276,181.117661,182.005403,181.601134,179.960446,177.303348,173.96584,170.33031,166.754591,163.51751,160.791224,158.64113,157.046423,155.930752,155.192921,154.730923,154.45669,154.302233,154.219622,154.177638,154.157353,154.148032,154.143957,154.142261,154.14159,154.141337,154.141246,154.141215,154.141204,154.141201,154.1412,154.1412,154.1412,154.1412,154.1412,154.1412,154.1412,154.1412,154.1412,154.1412,154.1412,154.1412,154.1412,154.1412,154.1412];
    SensorData.aggregate([{
      $match: {
        station: stationId,
        date: {
          $gte: new Date(Date.UTC(year, 9, 0, 0, 0, 0)),
          $lt: new Date(Date.UTC(year, 10, 0, 0, 0, 0))
        }
      }
    }, {
      $group: {
        _id : null,
        tempOut: {$avg: "$tempOut"}
      }
    }], function(err, result){
      if (err) {
        console.log(err);
        sendJSONresponse(res, 404, err);
        return;
      } else {
        if(result.length==0){
          sendJSONresponse(res, 201, {
            error: 'no-data'
          });
          return;
        }else{
          var temp = Math.round(result[0].tempOut*10)/10;
          if(temp < 10) temp = 10;
          if(temp > 18) temp = 18;
          var index = tempArray.findIndex((element)=>{return element==temp});
          sendJSONresponse(res, 201, {
            stationId: stationId,
            year: year,
            temp: temp,
            bigSizePercent: bigSizePercent[index],
            avgWeight: avgWeight[index],
            errorMargin: 5
          });
          return;
        }
      }
    });
  }else{
    sendJSONresponse(res, 400, {
      error: "La expresión fue mal formada. Revise si los parámetros están completos."
    });
    return;
  }
}

module.exports.getHarvestPrediction = (req, res) => {
  var stationId = req.params.stationId;
  var year = req.query.year;
  var month = req.query.month;
  var day = req.query.day;
  if( isObjectIdValid(stationId) && year != 'undefined' && month != 'undefined' && day != 'undefined' ){
    var startDate = new Date(Date.UTC(year, month-1, day, 0, 0, 0));
    var endDate = moment(startDate).add(30, 'days').toDate();
    SensorData.aggregate([{
      $match: {
        station: stationId,
        date: {
          $gte: startDate,
          $lt: endDate
        }
      }
    }, {
      $project: {
        _id: 1,
        date: 1,
        gdh: 1,
        gd: 1
      }
    }, {
      $group: {
        _id : null,
        gdh: {$sum: "$gdh"},
        gd: {$sum: "$gd"}
      }
    }], function(err, result){
      if (err) {
        console.log(err);
        sendJSONresponse(res, 404, err);
        return;
      } else {
        if(result.length==0){
          sendJSONresponse(res, 201, {
            error: 'no-data'
          });
          return;
        }else{
          var gd = result[0].gd;
          var gdh = result[0].gdh / 4;
          sendJSONresponse(res, 200, {
            daysToStartHarvest: Math.round(185.9-0.009*gdh),
            gd: gd,
            gdh: gdh
          });
          return;
        }
      }
    });
  }else{
    sendJSONresponse(res, 400, {
      error: "La expresión fue mal formada. Revise si los parámetros están completos."
    });
    return;
  }
}

module.exports.getVariable = (req, res) => {
  console.log(req.query);
  var splitDate = req.query.startDate.split("-");
  var startDate = startDate = new Date(moment.utc([splitDate[0], splitDate[1]-1, splitDate[2]]));
      splitDate = req.query.endDate.split("-");
  var endDate = new Date(moment.utc([splitDate[0], splitDate[1]-1, splitDate[2]]).add(1, 'day'));
  var stationId = req.query.station;
  var variableToQuery = req.query.variable;
  var operation = req.query.operation;

  if(!isObjectIdValid(stationId)){
    sendJSONresponse(res, 400, {
      error: "La expresión fue mal formada. Revise si los parámetros están completos."
    });
    return;
  }

  // Aggregation Stages
  var matchStage = {
    $match: {
      station: stationId,
      date: {
        $gte: startDate,
        $lt: endDate
      }
    }
  };

  // Variables que se consultan por días
  var variablesByDay = ['5hrsmay27C', '5hrsmay29C', '5hrsmay32C', 'diasHel', '5hrsmin10C'];
  var variablesToGroup = ['hrmay27c', 'hrmay29c', 'hrmay32c', 'hrmen0c', 'hr10'];

  var inArray = variableIsInArray(variableToQuery, variablesByDay);
  if(inArray>=0){
    // La variable se agrupa por día
    var variableToGroup = variablesToGroup[inArray];

    // Se definen las variables a consultar
    var projectionQuery = {
      _id: 1,
      date: 1
    }
    projectionQuery[variableToGroup]=1;
    var projectionStage = {
      $project: projectionQuery
    };

    // Se agrupan por día
    var groupStage = {
      $group: {
        _id : {
          month: { $month: "$date" },
          day: { $dayOfMonth: "$date" },
          year: { $year: "$date" }
        },
        count: { $sum: 1}
      }
    }
    groupStage['$group'][variableToGroup] = {$sum: '$' + variableToGroup};

    SensorData.aggregate([
      matchStage,
      projectionStage,
      groupStage
    ], (err, result) => {
      var daysCount = 0;
      for(row of result){
        // Revisa qué variable se está consultando para ejecutar la
        // condición correspondiente para contar los días
        if(variableIsInArray(variableToQuery, ['5hrsmay27C', '5hrsmay29C', '5hrsmay32C', '5hrsmin10C']) >= 0){
          if(row[variableToGroup] >= 5) { daysCount += 1 }
        }
        if(variableIsInArray(variableToQuery, ['diasHel']) >= 0){
          if(row[variableToGroup] >= 1) { daysCount += 1 }
        }
      }
      if (err) {
        console.log(err);
        sendJSONresponse(res, 404, err);
        return;
      }else{
        sendJSONresponse(res, 200, {
          variable:variableToQuery,
          value: daysCount
        });
        return;
      }
    })
  }else{
    // La variable se consulta individualmente

    // Operaciones Específicas:
    // Si la variable es humedad relativa, usar promedio
    if(variableToQuery == 'tempOut') operation = 'avg';
    if(variableToQuery == 'hiTemp') operation = 'avg';
    if(variableToQuery == 'lowTemp') operation = 'avg';
    if(variableToQuery == 'outHum') operation = 'avg';
    if(variableToQuery == 'windSpeed') operation = 'avg';
    if(variableToQuery == 'rain') operation = 'avg';
    if(variableToQuery == 'solarRad') operation = 'avg';
    if(variableToQuery == 'maxRadDia') {
      operation = 'max';
      variableToQuery = 'solarRad';
    }
    var factor = 1;
    if(variableToQuery == 'energia') {
      variableToQuery = 'solarRad';
      factor = 0.0009;
    }
    if(variableToQuery == 'maxWindSpeed') {
      operation = 'max';
      variableToQuery = 'windSpeed';
    }
    if(variableToQuery == 'totalRain') {
      operation = 'sum';
      variableToQuery = 'rain';
    }
    if(variableToQuery == 'dpv') operation = 'avg';
    // La et se devuelve en mm
    //if(variableToQuery == 'et') operation = 'avg';

    var projectionQuery = {
      _id: 1,
      date: 1
    }
    projectionQuery[variableToQuery]=1;

    var variableOperation = {};
        variableOperation['$' + operation] = '$'+variableToQuery;

    var groupingQuery = {
      _id: null,
      count: { $sum: 1},
      variable: variableOperation
    }

    SensorData.aggregate([
      matchStage, {
        $project: projectionQuery
      }, {
        $group: groupingQuery
      }
    ], (err, result) => {
      if (err) {
        console.log(err);
        sendJSONresponse(res, 404, err);
        return;
      }else{
        if(!result[0]){
          sendJSONresponse(res, 404, {
            variable : variableToQuery,
            value    : null
          });
          return;
        }
        console.log(result[0]);
        // Los GDH se aplican divididos por 4
        if(variableToQuery == 'gdh' || variableToQuery == 'richard' || variableToQuery == 'richardsonMod' || variableToQuery == 'unrath'){
          result[0].variable = result[0].variable / 4;
        }
        result[0].variable*=factor;
        sendJSONresponse(res, 200, {
          variable:variableToQuery,
          value: result[0].variable
        });
        return;
      }
    })
  }

  //Días con T° > 29°C
  //result[i].hrs295 = (result[i].hrmay29c >= 5) ? 1 : 0;
}

module.exports.deleteDataByDate = function(req, res){
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
    }, null, function(err, station){
      if (err || station == null) {
        console.log(err);
        sendJSONresponse(res, 404, err);
        return;
      }else{
        if(req.payload._id == station.owner || req.payload.role == 'administrator'){
          SensorData.remove({
            station: stationId,
            date: {
              $gte: startDate,
              $lt: endDate
            }
          }, function(err) {
            if (!err) {
              sendJSONresponse(res, 204, null);
              return;
            }
            else {
              sendJSONresponse(res, 500, "Ocurrió un error al eliminar los datos.");
              return;
            }
          });
        }else{
          sendJSONresponse(res, 401, "No se tiene autorización para eliminar los datos.");
          return;
        }
      }
    });
  }else{
    sendJSONresponse(res, 400, "Aparentemente la expresión fue mal formada.");
    return;
  }
}

module.exports.getFujiSunDamage = (req, res) => {
  var stationId = req.params.stationId;
  var year = req.query.year;
  if( isObjectIdValid(stationId) && year != 'undefined' ){
    SensorData.aggregate([{
      $match: {
        station: stationId,
        date: {
          $gte: new Date(Date.UTC(year, 0, 1, 0, 0, 0)),
          $lt: new Date(Date.UTC(year, 1, 1, 0, 0, 0))
        }
      }
    }, {
      $group: {
        _id : {
          $dayOfMonth : "$date"
        },
        hrmay29c: {$sum: "$hrmay29c"}
      }
    }], function(err, result){
      if (err) {
        console.log(err);
        sendJSONresponse(res, 404, err);
        return;
      } else {
        if(result.length==0){
          sendJSONresponse(res, 200, {
            error: 'no-data'
          });
          return;
        }else{
          let riskDays = 0;
          result.forEach((item) => {
            if(item.hrmay29c >= 5){
              riskDays += 1;
            }
          })
          let incidence = Math.exp(0.144*riskDays);
          sendJSONresponse(res, 200, {
            incidence  : incidence,
            riskDays   : riskDays
          });
          return;
        }
      }
    });
  }else{
    sendJSONresponse(res, 400, {
      error: "La expresión fue mal formada. Revise si los parámetros están completos."
    });
    return;
  }
}

module.exports.getFujiRusset = (req, res) => {
  var stationId = req.params.stationId;
  var year = req.query.year;
  if( isObjectIdValid(stationId) && year != 'undefined' ){
    SensorData.aggregate([{
      $match: {
        station: stationId,
        date: {
          $gte: new Date(Date.UTC(year, 9, 1, 0, 0, 0)),
          $lt: new Date(Date.UTC(year, 10, 1, 0, 0, 0))
        }
      }
    }, {
      $group: {
        _id : null,
        hr7: {$sum: "$hr7"}
      }
    }], function(err, result){
      if (err) {
        console.log(err);
        sendJSONresponse(res, 404, err);
        return;
      } else {
        if(result.length==0){
          sendJSONresponse(res, 200, {
            error: 'no-data'
          });
          return;
        }else{
          let hours  = result[0].hr7;
          let incidence = Math.exp(0.0344*hours);
          sendJSONresponse(res, 200, {
            incidence  : incidence,
            hours      : hours
          });
          return;
        }
      }
    });
  }else{
    sendJSONresponse(res, 400, {
      error: "La expresión fue mal formada. Revise si los parámetros están completos."
    });
    return;
  }
}

module.exports.getColorPredictionFujiPink = (req, res) => {
  var stationId = req.params.stationId;
  var year = req.query.year;
  if( isObjectIdValid(stationId) && year ){
    SensorData.aggregate([{
      $match: {
        station: stationId,
        date: {
          $gte: new Date(Date.UTC(year, 2, 0, 1, 0, 0)),
          $lt: new Date(Date.UTC(year, 3, 1, 0, 0, 0))
        }
      }
    }, {
      $project: {
        _id: 1,
        date: 1,
        hr10: 1
      }
    }, {
      $group: {
        _id : {
          day: { $dayOfMonth: "$date" }
        },
        hr10: {$sum: "$hr10"}
      }
    }], function(err, result){
      if (err) {
        console.log(err);
        sendJSONresponse(res, 404, err);
        return;
      } else {
        if(result.length==0){
          sendJSONresponse(res, 201, {
            stationId: stationId,
            year: year,
            potential: 'no-data'
          });
          return;
        }else{
          var potential = null;
          let count = 0;
          result.forEach((item) => {
            if (item.hr10 >= 5) count++;
          });
          if(count < 5){
            potential = 'low-potential';
          }else if(count > 5){
            potential = 'high-potential';
          }else{
            potential = 'mid-potential';
          }
          sendJSONresponse(res, 201, {
            stationId: stationId,
            year: year,
            days: count,
            potential: potential
          });
          return;
        }
      }
    });
  }else{
    sendJSONresponse(res, 400, {
      error: "La expresión fue mal formada. Revise si los parámetros están completos."
    });
    return;
  }
}

module.exports.getPinkSunDamage = (req, res) => {
  var stationId = req.params.stationId;
  var year = req.query.year;
  if( isObjectIdValid(stationId) && year != 'undefined' ){
    SensorData.aggregate([{
      $match: {
        station: stationId,
        date: {
          $gte: new Date(Date.UTC(year, 0, 1, 0, 0, 0)),
          $lt: new Date(Date.UTC(year, 1, 1, 0, 0, 0))
        }
      }
    }, {
      $group: {
        _id : {
          $dayOfMonth : "$date"
        },
        hrmay29c: {$sum: "$hrmay29c"}
      }
    }], function(err, result){
      if (err) {
        console.log(err);
        sendJSONresponse(res, 404, err);
        return;
      } else {
        if(result.length==0){
          sendJSONresponse(res, 200, {
            error: 'no-data'
          });
          return;
        }else{
          let riskDays = 0;
          result.forEach((item) => {
            if(item.hrmay29c >= 5){
              riskDays += 1;
            }
          })
          let incidence = Math.exp(0.126*riskDays);
          sendJSONresponse(res, 200, {
            incidence  : incidence,
            riskDays   : riskDays
          });
          return;
        }
      }
    });
  }else{
    sendJSONresponse(res, 400, {
      error: "La expresión fue mal formada. Revise si los parámetros están completos."
    });
    return;
  }
}
/*
 * Función para calcular indicadores nutricionales y de riesgo
 */

let calculateNutritionalIndicators = (data) => {
  data.NdivCa   = data.N / data.Ca;
  data.KdivCa   = data.K / data.Ca;
  data.MgdivCa  = data.Mg / data.Ca;
  data.NdivK    = data.N / data.K;
  data.KdivP    = data.K / data.P;
  data.PdivCa   = data.P / data.Ca;
  data.KMgdivCa = (data.K + data.Mg) / data.Ca;
  if(data.stage=='small'){
    data.risk1 = (data.Ca < 5.5) ? 1 : 0;
    data.risk2 = (data.N  > 112) ? 1 : 0;
    data.risk3 = (data.K  > 195) ? 1 : 0;
    data.risk4 = (data.NdivCa > 7.5) ? 1 : 0;
    data.risk5 = (data.KdivCa > 19.5) ? 1 : 0;
  }
  if(data.stage=='mature'){
    data.risk1 = (data.Ca < 15)  ? 1 : 0;
    data.risk2 = (data.N  > 45)  ? 1 : 0;
    data.risk3 = (data.K  > 150) ? 1 : 0;
    data.risk4 = (data.NdivCa > 10) ? 1 : 0;
    data.risk5 = (data.KdivCa > 30) ? 1 : 0;
  }
  data.riskIndex = data.risk1 + data.risk2 + data.risk3 + data.risk4 + data.risk5;
  data.avgWeight = data.Peso_Total / data.N_Frutos;
  return data;
}

module.exports.getFujiBitterPit = (req, res) => {
  let stationId = req.params.stationId;
  let year      = +req.query.year;
  let sectorId  = req.query.sectorId;
  if( isObjectIdValid(stationId) && year != 'undefined' ){
    SensorData.aggregate([{
      $match: {
        station: stationId,
        date: {
          $gte: new Date(Date.UTC(year-1, 11, 1, 0, 0, 0)),
          $lt: new Date(Date.UTC(year, 3, 1, 0, 0, 0))
        }
      }
    }, {
      $group: {
        _id : {
          day : {
            $dayOfMonth : "$date"
          },
          month: {
            $month : "$date"
          },
          year: {
            $year : "$date"
          }
        },
        hrmay29c : {$sum: "$hrmay29c"},
        estres   : {$sum: "$uEstres"}
      }
    }], function(err, result){
      if (err) {
        console.log(err);
        sendJSONresponse(res, 404, err);
        return;
      } else {
        if(result.length==0){
          sendJSONresponse(res, 200, {
            error: 'no-data'
          });
          return;
        }
        NutritionalData.findOne(
          {
            sectorId : sectorId,
            stage    : 'mature',
            date     : {
              $gte: new Date(Date.UTC(year, 0, 1, 0, 0, 0)),
              $lt: new Date(Date.UTC(year+1, 0, 1, 0, 0, 0))
            }
          },
          (err, nutData) => {
            if(err || !nutData){
              console.log("Error al consultar Datos Nutricionales:"+JSON.stringify(err));
              sendJSONresponse(res, 200, {
                error: 'no-data'
              });
              return;
            }
            let stress     = 0;
            let tempOver29 = 0;
            result.forEach((item) => {
              stress += item.estres;
              tempOver29 += (item.hrmay29c >= 5) ? 1 : 0;
            })
            nutData = JSON.parse(JSON.stringify(nutData));
            nutData = calculateNutritionalIndicators(nutData);
            let ponderation = 0;
            if(stress > 150000){
              ponderation += 0.5;
            }
            if(tempOver29 > 40){
              ponderation += 0.5;
            }
            if(nutData.riskIndex >= 3){
              ponderation += 2;
            }else if(nutData.riskIndex == 2){
              ponderation += 1;
            }
            let risk = '';
            if(ponderation <= 1){
              risk = 'low';
            }else if(ponderation <= 3){
              risk = 'mid';
            }else{
              risk = 'high';
            }
            sendJSONresponse(res, 200, {
              risk       : risk,
              riskIndex  : nutData.riskIndex,
              stress     : stress,
              tempOver29 : tempOver29,
              ponderation: ponderation
            });
            return;
          }
        )
      }
    })
  }else{
    sendJSONresponse(res, 400, {
      error: "La expresión fue mal formada. Revise si los parámetros están completos."
    });
    return;
  }
}

module.exports.getGalaLenticelosis = (req, res) => {
  let stationId = req.params.stationId;
  let year      = +req.query.year;
  let sectorId  = req.query.sectorId;
  if( isObjectIdValid(stationId) && year != 'undefined' ){
    SensorData.aggregate([{
      $match: {
        station: stationId,
        date: {
          $gte: new Date(Date.UTC(year-1, 11, 1, 0, 0, 0)),
          $lt: new Date(Date.UTC(year, 2, 1, 0, 0, 0))
        }
      }
    }, {
      $group: {
        _id : {
          day : {
            $dayOfMonth : "$date"
          },
          month: {
            $month : "$date"
          },
          year: {
            $year : "$date"
          }
        },
        hrmay29c : {$sum: "$hrmay29c"},
        estres   : {$sum: "$uEstres"}
      }
    }], function(err, result){
      if (err) {
        console.log(err);
        sendJSONresponse(res, 404, err);
        return;
      } else {
        if(result.length==0){
          sendJSONresponse(res, 200, {
            error: 'no-data'
          });
          return;
        }
        NutritionalData.findOne(
          {
            sectorId : sectorId,
            stage    : 'mature',
            date     : {
              $gte: new Date(Date.UTC(year, 0, 1, 0, 0, 0)),
              $lt: new Date(Date.UTC(year+1, 0, 1, 0, 0, 0))
            }
          },
          (err, nutData) => {
            if(err || !nutData){
              console.log("Error al consultar Datos Nutricionales:"+JSON.stringify(err));
              sendJSONresponse(res, 200, {
                error: 'no-data'
              });
              return;
            }
            let stress     = 0;
            let tempOver29 = 0;
            result.forEach((item) => {
              stress += item.estres;
              tempOver29 += (item.hrmay29c >= 5) ? 1 : 0;
            })
            nutData = JSON.parse(JSON.stringify(nutData));
            nutData = calculateNutritionalIndicators(nutData);
            let ponderation = 0;
            if(stress > 90000){
              ponderation += 0.5;
            }
            if(tempOver29 > 25){
              ponderation += 0.5;
            }
            if(nutData.riskIndex >= 3){
              ponderation += 2;
            }
            let risk = '';
            if(ponderation <= 1){
              risk = 'low';
            }else if(ponderation <= 3){
              risk = 'mid';
            }else{
              risk = 'high';
            }
            sendJSONresponse(res, 200, {
              risk       : risk,
              riskIndex  : nutData.riskIndex,
              stress     : stress,
              tempOver29 : tempOver29,
              ponderation: ponderation
            });
            return;
          }
        )
      }
    })
  }else{
    sendJSONresponse(res, 400, {
      error: "La expresión fue mal formada. Revise si los parámetros están completos."
    });
    return;
  }
}

module.exports.getEarlyStoragePotentialGala = (req, res) => {
  let stationId = req.params.stationId;
  let year      = +req.query.year;
  let sectorId  = req.query.sectorId;
  if( isObjectIdValid(stationId) && year != 'undefined' ){
    SensorData.aggregate([{
      $match: {
        station: stationId,
        date: {
          $gte: new Date(Date.UTC(year, 9, 1, 0, 0, 0)),
          $lt: new Date(Date.UTC(year, 10, 1, 0, 0, 0))
        }
      }
    }, {
      $group: {
        _id : {
          day : {
            $dayOfMonth : "$date"
          },
          month: {
            $month : "$date"
          },
          year: {
            $year : "$date"
          }
        },
        dailyAvgTemp : {$avg: "$tempOut"}
      }
    }], function(err, result){
      if(err){
        console.log(err);
        sendJSONresponse(res, 404, err);
        return;
      }
      if(result.length==0){
        sendJSONresponse(res, 200, {
          error: 'no-data'
        });
        return;
      }
      let tempSum = 0;
      result.forEach((item) => {
        tempSum += item.dailyAvgTemp;
      })
      let monthAvgTemp = tempSum / result.length;
      NutritionalData.findOne(
        {
          sectorId : sectorId,
          stage    : 'mature',
          date     : {
            $gte: new Date(Date.UTC(year, 0, 1, 0, 0, 0)),
            $lt: new Date(Date.UTC(year+1, 0, 1, 0, 0, 0))
          }
        },
        (err, nutData) => {
          if(err || !nutData){
            console.log("Error al consultar Datos Nutricionales:"+JSON.stringify(err));
            sendJSONresponse(res, 200, {
              error: 'no-data'
            });
            return;
          }
          nutData = JSON.parse(JSON.stringify(nutData));
          nutData = calculateNutritionalIndicators(nutData);
          let ponderation = 0;
          if(monthAvgTemp<=14.5){
            ponderation += 0.5;
          }
          if(nutData.riskIndex<=2){
            ponderation += 2;
          }
          let potential = '';
          if(ponderation <= 1){
            potential = 'low';
          }else if(ponderation <= 3){
            potential = 'mid';
          }else{
            potential = 'high';
          }
          sendJSONresponse(res, 200, {
            monthAvgTemp : monthAvgTemp,
            riskIndex    : nutData.riskIndex,
            potential    : potential
          });
          return;
        }
      )
    })
  }else{
    sendJSONresponse(res, 400, {
      error: "La expresión fue mal formada. Revise si los parámetros están completos."
    });
    return;
  }
}

module.exports.getEarlyStoragePotentialFuji = (req, res) => {
  let stationId = req.params.stationId;
  let year      = +req.query.year;
  let sectorId  = req.query.sectorId;
  if( isObjectIdValid(stationId) && year != 'undefined' ){
    SensorData.aggregate([{
      $match: {
        station: stationId,
        date: {
          $gte: new Date(Date.UTC(year, 9, 1, 0, 0, 0)),
          $lt: new Date(Date.UTC(year, 10, 1, 0, 0, 0))
        }
      }
    }, {
      $group: {
        _id : {
          day : {
            $dayOfMonth : "$date"
          },
          month: {
            $month : "$date"
          },
          year: {
            $year : "$date"
          }
        },
        dailyAvgTemp : {$avg: "$tempOut"}
      }
    }], function(err, result){
      if(err){
        console.log(err);
        sendJSONresponse(res, 404, err);
        return;
      }
      if(result.length==0){
        sendJSONresponse(res, 200, {
          error: 'no-data'
        });
        return;
      }
      let tempSum = 0;
      result.forEach((item) => {
        tempSum += item.dailyAvgTemp;
      })
      let monthAvgTemp = tempSum / result.length;
      NutritionalData.findOne(
        {
          sectorId : sectorId,
          stage    : 'mature',
          date     : {
            $gte: new Date(Date.UTC(year, 0, 1, 0, 0, 0)),
            $lt: new Date(Date.UTC(year+1, 0, 1, 0, 0, 0))
          }
        },
        (err, nutData) => {
          if(err || !nutData){
            console.log("Error al consultar Datos Nutricionales:"+JSON.stringify(err));
            sendJSONresponse(res, 200, {
              error: 'no-data'
            });
            return;
          }
          nutData = JSON.parse(JSON.stringify(nutData));
          nutData = calculateNutritionalIndicators(nutData);
          let ponderation = 0;
          if(monthAvgTemp<=14.5){
            ponderation += 0.5;
          }
          if(nutData.riskIndex<=1){
            ponderation += 2;
          }else if(nutData.riskIndex==2){
            ponderation += 1;
          }
          let potential = '';
          if(ponderation <= 1){
            potential = 'low';
          }else if(ponderation <= 3){
            potential = 'mid';
          }else{
            potential = 'high';
          }
          sendJSONresponse(res, 200, {
            monthAvgTemp : monthAvgTemp,
            riskIndex    : nutData.riskIndex,
            potential    : potential
          });
          return;
        }
      )
    })
  }else{
    sendJSONresponse(res, 400, {
      error: "La expresión fue mal formada. Revise si los parámetros están completos."
    });
    return;
  }
}

module.exports.getEarlyStoragePotentialCrippsPink = (req, res) => {
  let stationId = req.params.stationId;
  let year      = +req.query.year;
  let sectorId  = req.query.sectorId;
  if( isObjectIdValid(stationId) && year != 'undefined' ){
    SensorData.aggregate([{
      $match: {
        station: stationId,
        date: {
          $gte: new Date(Date.UTC(year, 9, 1, 0, 0, 0)),
          $lt: new Date(Date.UTC(year, 10, 1, 0, 0, 0))
        }
      }
    }, {
      $group: {
        _id : {
          day : {
            $dayOfMonth : "$date"
          },
          month: {
            $month : "$date"
          },
          year: {
            $year : "$date"
          }
        },
        dailyAvgTemp : {$avg: "$tempOut"}
      }
    }], function(err, result){
      if(err){
        console.log(err);
        sendJSONresponse(res, 404, err);
        return;
      }
      if(result.length==0){
        sendJSONresponse(res, 200, {
          error: 'no-data'
        });
        return;
      }
      let tempSum = 0;
      result.forEach((item) => {
        tempSum += item.dailyAvgTemp;
      })
      let monthAvgTemp = tempSum / result.length;
      NutritionalData.findOne(
        {
          sectorId : sectorId,
          stage    : 'mature',
          date     : {
            $gte: new Date(Date.UTC(year, 0, 1, 0, 0, 0)),
            $lt: new Date(Date.UTC(year+1, 0, 1, 0, 0, 0))
          }
        },
        (err, nutData) => {
          if(err || !nutData){
            console.log("Error al consultar Datos Nutricionales:"+JSON.stringify(err));
            sendJSONresponse(res, 200, {
              error: 'no-data'
            });
            return;
          }
          nutData = JSON.parse(JSON.stringify(nutData));
          nutData = calculateNutritionalIndicators(nutData);
          let ponderation = 0;
          if(monthAvgTemp<=14.5){
            ponderation += 0.5;
          }
          if(nutData.riskIndex<=2){
            ponderation += 2;
          }
          let potential = '';
          if(ponderation <= 1){
            potential = 'low';
          }else if(ponderation <= 3){
            potential = 'mid';
          }else{
            potential = 'high';
          }
          sendJSONresponse(res, 200, {
            monthAvgTemp : monthAvgTemp,
            riskIndex    : nutData.riskIndex,
            potential    : potential
          });
          return;
        }
      )
    })
  }else{
    sendJSONresponse(res, 400, {
      error: "La expresión fue mal formada. Revise si los parámetros están completos."
    });
    return;
  }
}

module.exports.getHarvestStoragePotentialGala = (req, res) => {
  let stationId = req.params.stationId;
  let year      = +req.query.year;
  let sectorId  = req.query.sectorId;
  if( isObjectIdValid(stationId) && year != 'undefined' ){
    SensorData.aggregate([{
      $match: {
        station: stationId,
        date: {
          $gte: new Date(Date.UTC(year-1, 9, 1, 0, 0, 0)),
          $lt: new Date(Date.UTC(year-1, 10, 1, 0, 0, 0))
        }
      }
    }, {
      $group: {
        _id : {
          day : {
            $dayOfMonth : "$date"
          },
          month: {
            $month : "$date"
          },
          year: {
            $year : "$date"
          }
        },
        dailyAvgTemp : {$avg: "$tempOut"}
      }
    }], function(err, result){
      if(err){
        console.log(err);
        sendJSONresponse(res, 404, err);
        return;
      }
      if(result.length==0){
        sendJSONresponse(res, 200, {
          error: 'no-data'
        });
        return;
      }
      let tempSum = 0;
      result.forEach((item) => {
        tempSum += item.dailyAvgTemp;
      })
      let monthAvgTemp = tempSum / result.length;
      SensorData.aggregate([{
        $match: {
          station: stationId,
          date: {
            $gte: new Date(Date.UTC(year-1, 11, 1, 0, 0, 0)),
            $lt: new Date(Date.UTC(year, 1, 1, 0, 0, 0))
          }
        }
      }, {
        $group: {
          _id : {
            day : {
              $dayOfMonth : "$date"
            },
            month: {
              $month : "$date"
            },
            year: {
              $year : "$date"
            }
          },
          stress : {$avg: "$uEstres"}
        }
      }], function(err, result2){
        if(err){
          console.log(err);
          sendJSONresponse(res, 404, err);
          return;
        }
        if(result2.length==0){
          sendJSONresponse(res, 200, {
            error: 'no-data'
          });
          return;
        }
        let totalStress = 0;
        result2.forEach((item) => {
          totalStress += item.stress;
        })
        NutritionalData.findOne(
          {
            sectorId : sectorId,
            stage    : 'mature',
            date     : {
              $gte: new Date(Date.UTC(year, 0, 1, 0, 0, 0)),
              $lt: new Date(Date.UTC(year+1, 0, 1, 0, 0, 0))
            }
          },
          (err, nutData) => {
            if(err || !nutData){
              console.log("Error al consultar Datos Nutricionales:"+JSON.stringify(err));
              sendJSONresponse(res, 200, {
                error: 'no-data'
              });
              return;
            }
            nutData = JSON.parse(JSON.stringify(nutData));
            nutData = calculateNutritionalIndicators(nutData);
            // TODO: Calcular ponderación con variables:
            //   totalStress
            //   nutData.riskIndex
            //   monthAvgTemp

            let ponderation = 0;
            if(monthAvgTemp<=14.5){
              ponderation += 0.5;
            }
            if(totalStress<=65000){
              ponderation += 0.5;
            }
            if(nutData.riskIndex<=2){
              ponderation += 2;
            }
            let potential = '';
            if(ponderation <= 1){
              potential = 'low';
            }else if(ponderation <= 3){
              potential = 'mid';
            }else{
              potential = 'high';
            }
            sendJSONresponse(res, 200, {
              monthAvgTemp : monthAvgTemp,
              riskIndex    : nutData.riskIndex,
              potential    : potential,
              totalStress  : totalStress
            });
            return;
          }
        )
      })
    })
  }else{
    sendJSONresponse(res, 400, {
      error: "La expresión fue mal formada. Revise si los parámetros están completos."
    });
    return;
  }
}

module.exports.getHarvestStoragePotentialFuji = (req, res) => {
  let stationId = req.params.stationId;
  let year      = +req.query.year;
  let sectorId  = req.query.sectorId;
  if( isObjectIdValid(stationId) && year != 'undefined' ){
    SensorData.aggregate([{
      $match: {
        station: stationId,
        date: {
          $gte: new Date(Date.UTC(year-1, 9, 1, 0, 0, 0)),
          $lt: new Date(Date.UTC(year-1, 10, 1, 0, 0, 0))
        }
      }
    }, {
      $group: {
        _id : {
          day : {
            $dayOfMonth : "$date"
          },
          month: {
            $month : "$date"
          },
          year: {
            $year : "$date"
          }
        },
        dailyAvgTemp : {$avg: "$tempOut"}
      }
    }], function(err, result){
      if(err){
        console.log(err);
        sendJSONresponse(res, 404, err);
        return;
      }
      if(result.length==0){
        sendJSONresponse(res, 200, {
          error: 'no-data'
        });
        return;
      }
      let tempSum = 0;
      result.forEach((item) => {
        tempSum += item.dailyAvgTemp;
      })
      let monthAvgTemp = tempSum / result.length;
      SensorData.aggregate([{
        $match: {
          station: stationId,
          date: {
            $gte: new Date(Date.UTC(year-1, 11, 1, 0, 0, 0)),
            $lt: new Date(Date.UTC(year, 1, 3, 0, 0, 0))
          }
        }
      }, {
        $group: {
          _id : {
            day : {
              $dayOfMonth : "$date"
            },
            month: {
              $month : "$date"
            },
            year: {
              $year : "$date"
            }
          },
          stress : {$avg: "$uEstres"}
        }
      }], function(err, result2){
        if(err){
          console.log(err);
          sendJSONresponse(res, 404, err);
          return;
        }
        if(result2.length==0){
          sendJSONresponse(res, 200, {
            error: 'no-data'
          });
          return;
        }
        let totalStress = 0;
        result2.forEach((item) => {
          totalStress += item.stress;
        })
        NutritionalData.findOne(
          {
            sectorId : sectorId,
            stage    : 'mature',
            date     : {
              $gte: new Date(Date.UTC(year, 0, 1, 0, 0, 0)),
              $lt: new Date(Date.UTC(year+1, 0, 1, 0, 0, 0))
            }
          },
          (err, nutData) => {
            if(err || !nutData){
              console.log("Error al consultar Datos Nutricionales:"+JSON.stringify(err));
              sendJSONresponse(res, 200, {
                error: 'no-data'
              });
              return;
            }
            nutData = JSON.parse(JSON.stringify(nutData));
            nutData = calculateNutritionalIndicators(nutData);

            let ponderation = 0;
            if(monthAvgTemp<=14.5){
              ponderation += 0.5;
            }
            if(totalStress<=120000){
              ponderation += 0.5;
            }
            if(nutData.riskIndex<=1){
              ponderation += 2;
            }else if(nutData.riskIndex==2){
              ponderation += 1;
            }
            let potential = '';
            if(ponderation <= 1){
              potential = 'low';
            }else if(ponderation <= 3){
              potential = 'mid';
            }else{
              potential = 'high';
            }
            sendJSONresponse(res, 200, {
              monthAvgTemp : monthAvgTemp,
              riskIndex    : nutData.riskIndex,
              potential    : potential,
              totalStress  : totalStress
            });
            return;
          }
        )
      })
    })
  }else{
    sendJSONresponse(res, 400, {
      error: "La expresión fue mal formada. Revise si los parámetros están completos."
    });
    return;
  }
}

module.exports.getHarvestStoragePotentialPink = (req, res) => {
  let stationId = req.params.stationId;
  let year      = +req.query.year;
  let sectorId  = req.query.sectorId;
  if( isObjectIdValid(stationId) && year != 'undefined' ){
    SensorData.aggregate([{
      $match: {
        station: stationId,
        date: {
          $gte: new Date(Date.UTC(year-1, 9, 1, 0, 0, 0)),
          $lt: new Date(Date.UTC(year-1, 10, 1, 0, 0, 0))
        }
      }
    }, {
      $group: {
        _id : {
          day : {
            $dayOfMonth : "$date"
          },
          month: {
            $month : "$date"
          },
          year: {
            $year : "$date"
          }
        },
        dailyAvgTemp : {$avg: "$tempOut"}
      }
    }], function(err, result){
      if(err){
        console.log(err);
        sendJSONresponse(res, 404, err);
        return;
      }
      if(result.length==0){
        sendJSONresponse(res, 200, {
          error: 'no-data'
        });
        return;
      }
      let tempSum = 0;
      result.forEach((item) => {
        tempSum += item.dailyAvgTemp;
      })
      let monthAvgTemp = tempSum / result.length;
      SensorData.aggregate([{
        $match: {
          station: stationId,
          date: {
            $gte: new Date(Date.UTC(year-1, 11, 1, 0, 0, 0)),
            $lt: new Date(Date.UTC(year, 1, 3, 0, 0, 0))
          }
        }
      }, {
        $group: {
          _id : {
            day : {
              $dayOfMonth : "$date"
            },
            month: {
              $month : "$date"
            },
            year: {
              $year : "$date"
            }
          },
          stress : {$avg: "$uEstres"}
        }
      }], function(err, result2){
        if(err){
          console.log(err);
          sendJSONresponse(res, 404, err);
          return;
        }
        if(result2.length==0){
          sendJSONresponse(res, 200, {
            error: 'no-data'
          });
          return;
        }
        let totalStress = 0;
        result2.forEach((item) => {
          totalStress += item.stress;
        })
        NutritionalData.findOne(
          {
            sectorId : sectorId,
            stage    : 'mature',
            date     : {
              $gte: new Date(Date.UTC(year, 0, 1, 0, 0, 0)),
              $lt: new Date(Date.UTC(year+1, 0, 1, 0, 0, 0))
            }
          },
          (err, nutData) => {
            if(err || !nutData){
              console.log("Error al consultar Datos Nutricionales:"+JSON.stringify(err));
              sendJSONresponse(res, 200, {
                error: 'no-data'
              });
              return;
            }
            nutData = JSON.parse(JSON.stringify(nutData));
            nutData = calculateNutritionalIndicators(nutData);

            let ponderation = 0;
            if(monthAvgTemp<=14.5){
              ponderation += 0.5;
            }
            if(totalStress<=120000){
              ponderation += 0.5;
            }
            if(nutData.riskIndex<=2){
              ponderation += 2;
            }
            let potential = '';
            if(ponderation <= 1){
              potential = 'low';
            }else if(ponderation <= 3){
              potential = 'mid';
            }else{
              potential = 'high';
            }
            sendJSONresponse(res, 200, {
              monthAvgTemp : monthAvgTemp,
              riskIndex    : nutData.riskIndex,
              potential    : potential,
              totalStress  : totalStress
            });
            return;
          }
        )
      })
    })
  }else{
    sendJSONresponse(res, 400, {
      error: "La expresión fue mal formada. Revise si los parámetros están completos."
    });
    return;
  }
}
