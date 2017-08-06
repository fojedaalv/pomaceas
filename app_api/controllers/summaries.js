var passport = require('passport');
var mongoose = require('mongoose');
var Summary = mongoose.model('Summary');

var isObjectIdValid = mongoose.Types.ObjectId.isValid;

var sendJSONresponse = function(res, status, content) {
  res.status(status);
  res.json(content);
};

module.exports.listSummaries = (req, res) => {
  Summary.find(
    {},
    '_id name variables',
    {},
    function(err, summaries){
      if(err){
        console.log(err);
        sendJSONresponse(res, 400, err);
      }else{
        sendJSONresponse(res, 201, summaries);
      }
    });
}

module.exports.createSummary = (req, res) => {
  var name = req.body.name;
  var variables = req.body.variables;
  if(name != null && variables.length > 0){
    console.log(name, variables);
    var summ = new Summary();
    summ.name = name;
    summ.variables = variables;
    summ.save((err) => {
      if (err){
        sendJSONresponse(res, 404, {
          "message": "Ha ocurrido un error en la creación del resumen. Revise los datos e intente nuevamente. Detalles del error: "+err
        });
        return;
      }else{
        sendJSONresponse(res, 201, {
          name: name,
          variables: variables
        });
      }
    });
  }else{
    sendJSONresponse(res, 400, {
      "message": "Existen campos incompletos en la consulta. Revise si los datos enviados son correctos."
    })
  }
}

module.exports.deleteSummary = (req, res) => {
  var summaryId = req.params.summaryId;
  if(isObjectIdValid(summaryId)){
    Summary.findByIdAndRemove(summaryId)
    .exec(
      function(err, summary){
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

module.exports.getSummary = (req, res) => {

}
