var fs = require('fs');
var pdf = require('html-pdf');

var sendJSONresponse = function(res, status, content) {
  res.status(status);
  res.json(content);
};

module.exports.generatePDF = function(req, res){
  //Normalize img path: http://stackoverflow.com/questions/35335698/add-image-in-header-using-html-pdf-node-module
  var html = fs.readFileSync('reports/template.html', 'utf8');
  var options = {
    format: 'Letter',
    header: {
      height: "24mm"
    }
  };
  /*
  pdf.create(html, options).toFile('./reports/report.pdf', function(err, result) {
    if (err) return console.log(err);
    console.log(result);
    sendJSONresponse(res, 200,
      'Generado el archivo:'+result.filename
    );
  });*/
  pdf.create(html, options).toStream(function(err, stream){
    if (err) return res.send(err);
    res.type('pdf');
    stream.pipe(res);
  })
}
