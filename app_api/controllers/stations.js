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
  var station = new Station();
  station.name = req.body.name;
  station.city = req.body.city;
  station.region = req.body.region;
  station.location = {
    type: "Point",
    coordinates: [req.body.location[0], req.body.location[1]]
  }
  station.save(function(err){
    if (err){
      sendJSONresponse(res, 404, {
        "message": "Ha ocurrido un error en la creación de la estación. Revise los datos e intente nuevamente."
      })
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
