var mongoose = require('mongoose');
var NutritionalData = mongoose.model('NutritionalData');
var Station = mongoose.model('Station');
var moment = require('moment');

const JsonApiQueryParserClass = require('jsonapi-query-parser');
const JsonApiQueryParser = new JsonApiQueryParserClass();

var isObjectIdValid = mongoose.Types.ObjectId.isValid;

var sendJSONresponse = function(res, status, content) {
  res.status(status);
  res.json(content);
};


module.exports.create = (req, res) => {
  let data = new NutritionalData();
  data.sectorId   = req.body.sectorId;
  data.station    = req.body.stationId;
  data.date       = req.body.date;
  data.stage      = req.body.stage;
  data.N          = req.body.N;
  data.P          = req.body.P;
  data.K          = req.body.K;
  data.Ca         = req.body.Ca;
  data.Mg         = req.body.Mg;
  data.Ms         = req.body.Ms;
  data.N_Frutos   = req.body.N_Frutos;
  data.Peso_Total = req.body.Peso_Total;
  data.other      = req.body.other;

  data.date.setHours(0, 0, 0, 0);

  data.save((err) => {
    if(err) {
      console.log("Error:");
      console.log(err);
      sendJSONresponse(res, 400, {
        message : "Ocurrió un error al ingresar los datos. Revise que los datos estén correctos.",
        err     : err
      })
      return;
    }
    sendJSONresponse(res, 200, {
      message: "Datos ingresados exitosamente."
    })
    return;
  })
}

module.exports.list = (req, res) => {
  let hostname    = req.headers.host;
  let requestData = JsonApiQueryParser.parseRequest(req.url);
  let pageNumber  = requestData.queryData.page.number  || 0;
  let pageSize    = requestData.queryData.page.size    || 10;
  let filter      = requestData.queryData.filter;
  let query = { };
  Station.find({
    owner: req.payload._id
  },
  '_id'
  )
  .exec((err, stations) => {
    if(err) {
      console.log(err);
      sendJSONresponse(res, 400, err);
      return;
    }
    let station_ids = [];
    stations.forEach((station) => {
      station_ids.push(station._id);
    })
    query = {
      station : { $in : station_ids}
    }
    if(filter.sector){
      query.sectorId = filter.sector;
    }
    NutritionalData.find(
      query,
      '',
      {
        sort  : { },
        skip  : pageNumber*pageSize,
        limit : pageSize*1
      }
    )
    .populate('station')
    .exec((err, data) => {
      if(err){
        console.log(err);
        sendJSONresponse(res, 400, err);
        return;
      }else{
        NutritionalData.count(query, (err, count) => {
          sendJSONresponse(res, 200, {
            meta: {
              "total-pages": Math.ceil(count/pageSize),
              "total-items": count
            },
            links: {
              self: hostname+'/api/v1/nutritional-data'
            },
            data: data
          });
        });
      }
    })
  })
}

module.exports.remove = (req, res) => {
  var dataId = req.params.id;
  if(dataId){
    NutritionalData.findByIdAndRemove(dataId)
    .exec(
      function(err, row){
        if(err){
          sendJSONresponse(res, 404, err);
          return;
        }
        sendJSONresponse(res, 204, null);
      }
    )
  }else{
    sendJSONresponse(res, 404, {
      "message": "No se encontró la estación."
    })
  }
}

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

module.exports.calculations = (req, res) => {
  let nutDataID = req.params.id;
  NutritionalData.findOne({
    _id: nutDataID
  })
  .lean()
  .exec((err, data) => {
    if(err || !data){
      sendJSONresponse(res, 404, {
        message: "No se encontró la información"
      });
      return;
    }
    data = calculateNutritionalIndicators(data);
    console.log(data);
    sendJSONresponse(res, 200, data);
  })
}
