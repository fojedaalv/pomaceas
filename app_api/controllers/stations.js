var passport = require('passport');
var mongoose = require('mongoose');
var Station = mongoose.model('Station');
var SensorData = mongoose.model('SensorData');
const JsonApiQueryParserClass = require('jsonapi-query-parser');
const JsonApiQueryParser = new JsonApiQueryParserClass();

var sendJSONresponse = function(res, status, content) {
  res.status(status);
  res.json(content);
};

module.exports.list = function(req, res){
  let hostname    = req.headers.host;
  let requestData = JsonApiQueryParser.parseRequest(req.url);
  let pageNumber  = requestData.queryData.page.number  || 0;
  let pageSize    = requestData.queryData.page.size    || 10;
  let query = { };
  Station.find(
    query,
    '_id name city region location owner sectors',
    {
      sort:{ },
      skip:pageNumber*pageSize,
      limit:pageSize*1
    },
    function(err, stations){
      if(err){
        console.log(err);
        sendJSONresponse(res, 400, err);
      }else{
        Station.count(query, (err, count) => {
          sendJSONresponse(res, 200, {
            meta: {
              "total-pages": Math.ceil(count/pageSize),
              "total-items": count
            },
            links: {
              self: hostname+'/api/v1/stations'
            },
            data: stations
          });
        });
      }
    });
};

module.exports.create = function(req, res){
  console.log(req.body);
  if(!req.body.name){
    sendJSONresponse(res, 400, {
      "message": "Falta el nombre de la estación."
    });
    return;
  }
  if(!req.body.city){
    sendJSONresponse(res, 400, {
      "message": "Falta la ciudad de la estación."
    });
    return;
  }
  if(!req.body.region){
    sendJSONresponse(res, 400, {
      "message": "Falta la región de la estación."
    });
    return;
  }
  var station = new Station();
  station.name = req.body.name;
  station.city = req.body.city;
  station.region = req.body.region;
  station.owner = (req.body.owner == "") ? null : req.body.owner;
  station.location = {
    type: "Point",
    coordinates: [Number(req.body.location[0]),
                  Number(req.body.location[1])]
  }
  console.log("Creating station: " +station);
  station.save(function(err){
    if (err){
      sendJSONresponse(res, 404, {
        "message": "Ha ocurrido un error en la creación de la estación. Revise los datos e intente nuevamente. Detalles del error: "+err
      });
      return;
    }else{
      sendJSONresponse(res, 200, station);
    }
  });
}

module.exports.deleteOne = function (req, res) {
  var stationId = req.params.stationId;
  if(stationId){
    SensorData.count({
      station: stationId
    },(error, data) => {
      if(data == 0){
        // Sólo borrar la estación si no hay datos registrados
        Station.findByIdAndRemove(stationId)
        .exec(
          function(err, user){
            if(err){
              sendJSONresponse(res, 404, err);
              return;
            }
            sendJSONresponse(res, 204, null);
          }
        )
      }else{
        sendJSONresponse(res, 403, {
          "message": "No se puede eliminar la estación si aún contiene datos. Primero elimine los datos y luego elimine la estación."
        })
        return;
      }
    })
  }else{
    sendJSONresponse(res, 404, {
      "message": "No se encontró la estación."
    })
  }
  /*
  */
};

module.exports.readOne = function(req, res){
  Station.findOne(
    {
      _id: req.params.stationId
    },
    '_id name city region owner location sectors',
    {},
    function(err, station){
      if(err){
        console.log(err);
        sendJSONresponse(res, 404, err);
      }else{
        sendJSONresponse(res, 201, station);
      }
    }
  );
};

module.exports.updateOne = function(req, res){
  if (!req.params.stationId) {
    sendJSONresponse(res, 404, {
      "message": "Estación no encontrada. Se requiere un ID para buscarla."
    });
    return;
  }
  Station.findById(req.params.stationId)
  .exec(
    function(err, station){
      if (!station) {
        sendJSONresponse(res, 404, {
          "message": "ID de estación no encontrado."
        });
        return;
      } else if (err) {
        sendJSONresponse(res, 400, err);
        return;
      }
      station.name = req.body.name;
      station.city = req.body.city;
      station.region = req.body.region;
      if(req.body.owner == ""){
        station.owner = null;
      }else{
        station.owner = req.body.owner;
      }
      station.location = {
        type: "Point",
        coordinates: [Number(req.body.location[0]),
                      Number(req.body.location[1])]
      }
      station.save(function(err){
        if (err){
          console.log(err);
          sendJSONresponse(res, 404, {
            "message": "Ha ocurrido un error en la actualización de los datos. Revise que los datos sean correctos."
          })
          return;
        }else{
          sendJSONresponse(res, 200, station);
        }
      });
    }
  )
};

module.exports.getByUser = function(req, res){
  if (!req.params.userId) {
    sendJSONresponse(res, 404, {
      "message": "No se especificó el ID del usuario para buscar estaciones. Revise que la ruta esté correcta."
    });
    return;
  }
  Station.find(
    {
      owner: req.params.userId
    },
    '_id name city region location owner sectors',
    {},
    function(err, stations){
      if(err){
        console.log(err);
        sendJSONresponse(res, 400, err);
      }else{
        sendJSONresponse(res, 201, stations);
      }
    }
  );
}

module.exports.updateSectors = function(req, res){
  if (!req.params.stationId) {
    sendJSONresponse(res, 404, {
      "message": "Estación no encontrada. Se requiere un ID para buscarla."
    });
    return;
  }
  Station.findById(req.params.stationId)
  .exec(
    function(err, station){
      if (!station) {
        sendJSONresponse(res, 404, {
          "message": "ID de estación no encontrado."
        });
        return;
      } else if (err) {
        sendJSONresponse(res, 400, err);
        return;
      }
      if(req.body.sectors.length<1){
        sendJSONresponse(res, 400, {
          "message": "Debe haber al menos un sector por estación."
        });
        return;
      }
      station.sectors = req.body.sectors;
      station.save(function(err){
        if (err){
          console.log(err);
          sendJSONresponse(res, 404, {
            "message": "Ha ocurrido un error en la actualización de los datos. Revise que los datos sean correctos."
          })
          return;
        }else{
          sendJSONresponse(res, 200, station);
        }
      });
    }
  )
};
