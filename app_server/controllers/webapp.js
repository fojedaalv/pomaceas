var path = require("path");

module.exports.angularWebApp = function(req, res){
  res.status(200);
  res.sendFile(path.join(__dirname, '../../app_client', 'index.html'));
}
