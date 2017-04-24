var passport = require('passport');
var mongoose = require('mongoose');
var validator = require('validator');
var User = mongoose.model('User');

var sendJSONresponse = function(res, status, content) {
  res.status(status);
  res.json(content);
};

module.exports.list = function(req, res){
  User.find(
    {},
    '_id name email role phone',
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
    '_id name email role phone',
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
      if(req.body.phone) user.phone = req.body.phone;
      //user.phone = req.body.phone;
      user.save(function(err){
        if (err){
          console.log("Error: err");
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

module.exports.updateSelf = function(req, res){
  //console.log(req.body);
  if(req.payload._id == req.body._id){
    User.findOne({
      _id: req.body._id
    }, function(err, user){
      if(err){
        sendJSONresponse(res, 404, {
          message:"El usuario a modificar no se encontró en la base de datos."
        });
        return;
      }else{
        if(!validator.isEmail(req.body.email)){
          sendJSONresponse(res, 400, {
            message:"El correo enviado no es válido."
          });
          return;
        }
        user.email = req.body.email;
        user.phone = req.body.phone;
        user.name = req.body.name;
        user.save(function(err){
          if (err){
            sendJSONresponse(res, 500, {
              "message": "Ha ocurrido un error en la actualización de los datos. Revise que el correo no exista o los datos sean inconsistentes."
            })
          }else{
            sendJSONresponse(res, 200, {
              user: user,
              token: user.generateJwt()
            });
          }
        });
      }
    })
  }else{
    sendJSONresponse(res, 400, {
      message:"Los ID del usuario autenticado y del usuario a modificar no coinciden. Un usuario no puede modificar los datos de otro usuario. Si cree que esto es un error, pruebe a salir del sistema y acceder nuevamente. Si el problema persiste, consulte a la administración."
    });
    return;
  }
}
