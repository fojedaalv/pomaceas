var passport = require('passport');
var mongoose = require('mongoose');
var User = mongoose.model('User');

var sendJSONresponse = function(res, status, content) {
  res.status(status);
  res.json(content);
};

module.exports.list = function(req, res){
  User.find(
    {},
    '_id name email role',
    {},
    function(err, users){
      if(err){
        console.log(err);
        sendJSONresponse(res, 400, err);
      }else{
        sendJSONresponse(res, 201, users);
      }
    });
};

module.exports.readOne = function(req, res){
  User.findOne(
    {
      _id: req.params.userId
    },
    '_id name email role',
    {},
    function(err, user){
      if(err){
        console.log(err);
        sendJSONresponse(res, 404, err);
      }else{
        sendJSONresponse(res, 201, user);
      }
    }
  );
};

module.exports.updateOne = function(req, res){
  if (!req.params.userId) {
    sendJSONresponse(res, 404, {
      "message": "Usuario no encontrado. Se requiere un ID para buscarlo."
    });
    return;
  }
  User.findById(req.params.userId)
  .exec(
    function(err, user){
      if (!user) {
        sendJSONresponse(res, 404, {
          "message": "ID de usuario no encontrado."
        });
        return;
      } else if (err) {
        sendJSONresponse(res, 400, err);
        return;
      }
      user.name = req.body.name;
      user.email = req.body.email;
      user.role = req.body.role;
      user.save(function(err){
        var token;
        if (err){
          sendJSONresponse(res, 404, {
            "message": "Ha ocurrido un error en la actualización de los datos. Revise que el correo no exista o los datos sean inconsistentes."
          })
        }else{
          sendJSONresponse(res, 200, user);
        }
      });
    }
  )
};

module.exports.deleteOne = function (req, res) {
  var userId = req.params.userId;
  if(userId){
    if(userId==req.payload._id){
      sendJSONresponse(res, 401, {
        "message": "Un administrador no puede eliminarse a sí mismo."
      });
      return;
    }
    User.findByIdAndRemove(userId)
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
      "message": "No se encontró el usuario."
    })
  }
};
