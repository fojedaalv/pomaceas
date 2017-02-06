var passport = require('passport');
var mongoose = require('mongoose');
var Station = mongoose.model('Station');

var sendJSONresponse = function(res, status, content) {
  res.status(status);
  res.json(content);
};

module.exports.list = function(req, res){
  Station.find(
    {},
    '_id name city region location',
    {},
    function(err, stations){
      if(err){
        console.log(err);
        sendJSONresponse(res, 400, err);
      }else{
        sendJSONresponse(res, 201, stations);
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
  station.location = {
    type: "Point",
    coordinates: [Number(req.body.location[0]),
                  Number(req.body.location[1])]
  }
  console.log("Creating station: " +station);
  station.save(function(err){
    if (err){
      sendJSONresponse(res, 404, {
        "message": "Ha ocurrido un error en la creación de la estación. Revise los datos e intente nuevamente."
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
    sendJSONresponse(res, 404, {
      "message": "No se encontró la estación."
    })
  }
};

module.exports.readOne = function(req, res){
  Station.findOne(
    {
      _id: req.params.stationId
    },
    '_id name city region location',
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
      station.location = {
        type: "Point",
        coordinates: [Number(req.body.location[0]),
                      Number(req.body.location[1])]
      }
      station.save(function(err){
        var token;
        if (err){
          sendJSONresponse(res, 404, {
            "message": "Ha ocurrido un error en la actualización de los datos. Revise que los datos sean correctos."
          })
        }else{
          sendJSONresponse(res, 200, station);
        }
      });
    }
  )
};
