var passport = require('passport');
var mongoose = require('mongoose');
var validator = require('validator');
var crypto = require('crypto');
var moment = require('moment');
var nodemailer = require('nodemailer');

var User = mongoose.model('User');
var PasswordRequest = mongoose.model('PasswordRequest');

var sendJSONresponse = function(res, status, content) {
  res.status(status);
  res.json(content);
};

module.exports.register = function(req, res) {
  if(!req.body.name || !req.body.email || !req.body.password || !req.body.phone) {
    sendJSONresponse(res, 400, {
      "message": "All fields required"
    });
    return;
  }

  var user = new User();

  user.name = req.body.name;
  user.email = req.body.email;
  user.phone = req.body.phone;

  user.setPassword(req.body.password);

  user.save(function(err){
    var token;
    if (err){
      sendJSONresponse(res, 404, {
        "message": "Ha ocurrido un error en la creación del usuario. Probablemente el correo utilizado ya existe en el sistema."
      })
    }else{
      token = user.generateJwt();
      sendJSONresponse(res, 200, {
        "token": token
      });
    }
  });
};

module.exports.login = function(req, res){
  if(!req.body.email || !req.body.password){
    sendJSONresponse(res, 400, {
      "message": "All fields required"
    });
    return;
  }

  passport.authenticate('local', function(err, user, info){
    var token;

    if(err){
      sendJSONresponse(res, 404, err);
      return;
    }

    if(user){
      token = user.generateJwt();
      sendJSONresponse(res, 200, {
        "token": token
      });
    }else{
      sendJSONresponse(res, 401, info);
    }
  })(req, res);
};

exports.roleAuthorization = function(roles){
  return function(req, res, next){
    var user = req.payload;
    User.findById(user._id, function(err, foundUser){
      if(err){
        res.status(422).json({message: 'Usuario no encontrado.'});
        return next(err);
      }
      if(foundUser==null){
        sendJSONresponse(res, 401, {
          message: 'No tienes autorización para ver este contenido.'
        });
        return next('Unauthorized');
      }

      if(roles.indexOf(foundUser.role) > -1){
        return next();
      }
      sendJSONresponse(res, 401, {
        message: 'No tienes autorización para ver este contenido.'
      });
      return next('Unauthorized');
    });
  };
}

exports.requestPasswordReset = function(req, res){
  var email = req.body.email;
  if(validator.isEmail(email)){
    User.findOne({
      email: email
    }, function(err, doc){
      if(err){
        sendJSONresponse(res, 500, {
          message: 'Ha ocurrido un error en la búsqueda del usuario.'
        });
        return;
      }
      if(doc==null){
        sendJSONresponse(res, 404, {
          message: 'El correo buscado no está registrado en el sistema.'
        });
        return;
      }
      var token = crypto.randomBytes(20).toString('hex');
      var expirationDate = moment(new Date).add(3, 'hours');
      PasswordRequest.findOneAndUpdate({
        email: email
      },{
        email: email,
        token: token,
        expirationDate: expirationDate
      },{
        upsert: true
      },function(err, doc){
        if(err){
          sendJSONresponse(res, 500, {
            message: 'Se ha producido un error en la solicitud de nueva contraseña. Si el problema persiste, contacte a la administración.'
          });
          return;
        }else{
          // echo -n pomaceas | md5sum
          var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
              user: 'no.reply.pomaceas@gmail.com',
              pass: 'ce6d125e79ebe82ba84dffe15c911421'
            }
          });

          var mailOptions = {
            from: '"Servicio de cambio de clave " <no.reply.pomaceas@gmail.com>',
            to: email,
            subject: 'Cambio de contraseña', // Subject line
            text: 'Está recibiendo esto porque usted o alguien más ha solicitado un cambio de contraseña para la cuenta.\n' +
              'Por favor haga click en el siguiente link o cópielo en el navegador para completar el proceso:\n\n'+
              'http://' + req.headers.host + '/#/reset-password?token=' + token + '&&email='+email+'\n\n' +
              'Si no solicitó, haga caso omiso de este correo y su contraseña no se modificará.\n'
          };

          transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              return console.log(error);
            }
            console.log('Message %s sent: %s', info.messageId, info.response);
          });
          // Enviar correo con el token
          sendJSONresponse(res, 201, {
            message: 'Solicitud exitosa. Se ha enviado un correo con las instrucciones para generar una nueva contraseña. En caso de que no lo visualice en su bandeja de entrada, revise la carpeta de correos no deseados.'
          });
          return;
        }
      });
    });
  }else{
    sendJSONresponse(res, 400, {
      message: 'El correo enviado es inválido. Revise que haya sido bien escrito e intente de nuevo.'
    });
    return;
  }
}

module.exports.resetPassword = function(req, res){
  // Verificaciones:
  // Tiene la estructura correcta
  // pass1 == pass2
  // Existe solicitud de cambio de contraseña
  // Está en un período válido
  // Ejecutar el cambio de contraseña
  var userData = req.body;
  if( userData.hasOwnProperty('email') &&
      userData.hasOwnProperty('token') &&
      userData.hasOwnProperty('pass1') &&
      userData.hasOwnProperty('pass2')){
    if(userData.pass1 == userData.pass2){
      PasswordRequest.findOne({
        token: userData.token,
        email: userData.email
      }, function(err, doc){
        if(err){
          sendJSONresponse(res, 500, {
            message: 'Ha ocurrido un error interno en el servidor.'
          });
          return;
        }else{
          if(doc){
            var hasExpired = moment(doc.expirationDate).isBefore(moment(new Date));
            if(hasExpired){
              sendJSONresponse(res, 400, {
                message: 'La solicitud enviada ya expiró.'
              });
              return;
            }else{
              // Aquí se ejecuta el cambio de contraseña
              User.findOne({
                email: userData.email
              }, function(err, user){
                if(err){
                  sendJSONresponse(res, 404, {
                    message: 'Se produjo un error al encontrar al usuario.'
                  });
                  return;
                }else{
                  user.setPassword(userData.pass1);
                  user.save(function(err){
                    if(err){
                      sendJSONresponse(res, 500, {
                        message: 'Ha ocurrido un error en la actualización de la contraseña del usuario.'
                      });
                      return;
                    }else{
                      var transporter = nodemailer.createTransport({
                        service: 'gmail',
                        auth: {
                          user: 'no.reply.pomaceas@gmail.com',
                          pass: 'ce6d125e79ebe82ba84dffe15c911421'
                        }
                      });

                      var mailOptions = {
                        from: '"Servicio de cambio de clave " <no.reply.pomaceas@gmail.com>',
                        to: userData.email,
                        subject: 'Cambio de contraseña realizado', // Subject line
                        text: 'Está recibiendo esto porque se realizó un cambio de contraseña en su cuenta.\n' +
                          'En caso de que usted no haya solicitado este cambio, contacte a la administración.\n\n'+
                          'Si usted solicitó el cambio de contraseña, haga caso omiso de este correo.\n'
                      };

                      transporter.sendMail(mailOptions, (error, info) => {
                        if (error) {
                          return console.log(error);
                        }
                        console.log('Message %s sent: %s', info.messageId, info.response);
                      });
                      sendJSONresponse(res, 200, {
                        message: 'La contraseña del usuario ha sido actualizada con éxito. Ahora puede ingresar con su nueva contraseña desde el menú Acceder.'
                      });
                      return;
                    }
                  })
                }
              })
            }
          }else{
            sendJSONresponse(res, 404, {
              message: 'No se encontró ninguna solicitud de cambio de contraseña para el usuario especificado. Probablemente el link recibido en el correo ya no sea válido.'
            });
            return;
          }
        }
      })
    }else{
      sendJSONresponse(res, 400, {
        message: 'Las contraseñas enviadas no son iguales.'
      });
      return;
    }
  }else{
    sendJSONresponse(res, 400, {
      message: 'Los datos enviados están mal estructurados.'
    });
    return;
  }
}
