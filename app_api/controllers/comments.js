var mongoose = require('mongoose');
var Comment = mongoose.model('Comment');
var moment = require('moment');

var isObjectIdValid = mongoose.Types.ObjectId.isValid;

var sendJSONresponse = function(res, status, content) {
  res.status(status);
  res.json(content);
};

module.exports.getComment = (req, res) => {
  console.log(req.query);
  if(isObjectIdValid(req.query.station) && isObjectIdValid(req.query.summary)){
    Comment.find({
      stationId: req.query.station,
      summaryId: req.query.summary
    }, (err, docs) => {
      if(err){
        sendJSONresponse(res, 400, {
          message: "Ocurrió un error al buscar el comentario técnico."
        })
        return;
      }
      if(docs.length == 0){
        sendJSONresponse(res, 200, {
          message: "No se encontró un comentario.",
          comment: null
        })
        return;
      }
      sendJSONresponse(res, 200, {
        message: "Comentario encontrado.",
        comment: docs[0]
      })
      return;
    })
  }else{
    sendJSONresponse(res, 400, {
      message: "Se deben especificar la estación y el resumen en la consulta."
    })
    return;
  }
}

module.exports.createComment = (req, res) => {
  console.log(req.body);
  /*
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
  }*/
  var comment = new Comment();
  comment.comment = req.body.comment;
  comment.stationId = req.body.stationId;
  comment.summaryId = req.body.summaryId;
  comment.save(function(err){
    if (err){
      sendJSONresponse(res, 404, {
        "message": "Ha ocurrido un error en la creación del comentario. Revise los datos e intente nuevamente. Detalles del error: "+err
      });
      return;
    }else{
      sendJSONresponse(res, 200, comment);
    }
  });
}

module.exports.updateComment = (req, res) => {
  if (!req.params.id) {
    sendJSONresponse(res, 404, {
      "message": "Comentario no encontrado."
    });
    return;
  }
  Comment.findById(req.params.id)
  .exec(
    function(err, comment){
      if (!comment) {
        sendJSONresponse(res, 404, {
          "message": "ID no encontrado."
        });
        return;
      } else if (err) {
        sendJSONresponse(res, 400, err);
        return;
      }
      comment.comment = req.body.comment;
      comment.save(function(err){
        if (err){
          console.log(err);
          sendJSONresponse(res, 404, {
            "message": "Ha ocurrido un error en la actualización de los datos. Revise que los datos sean correctos."
          })
          return;
        }else{
          sendJSONresponse(res, 200, comment);
        }
      });
    }
  )
}

module.exports.deleteComment = (req, res) => {
  var commentId = req.params.id;
  if(commentId){
    Comment.findByIdAndRemove(commentId)
    .exec(
      function(err, comment){
        if(err){
          sendJSONresponse(res, 404, err);
          return;
        }
        sendJSONresponse(res, 204, null);
      }
    )
  }else{
    sendJSONresponse(res, 404, {
      "message": "No se encontró el comentario."
    })
  }
}
