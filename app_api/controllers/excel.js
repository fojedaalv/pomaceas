var sendJSONresponse = function(res, status, content) {
  res.status(status);
  res.json(content);
};

const xlr = require('xlr');
const fs = require('fs');

module.exports.getExcelFile = (req, res) => {
  let name         = req.body.filename || 'Reporte';
  let tableHeaders = req.body.headers || [];
  let tableData    = req.body.data    || [];
  console.log(req.body)
  let date = (new Date()).toLocaleDateString('es-CL', {
    year  : 'numeric',
    month : '2-digit',
    day   : '2-digit',
    hour  : '2-digit',
    minute: '2-digit',
    second: '2-digit'
  })
  let confColumns = [];
  tableHeaders.forEach((item) => {
    confColumns.push({
      type  : 'string',
      width : 20
    })
  })
  const conf = {
    stylesXmlFile: __dirname + '/excel/styles.xml',
    name: 'report',
    columns: confColumns,
    rows: [
      tableHeaders,
      ...tableData
    ],
    merge: [

    ]
  }
  const result = xlr(conf);
  let filename = 'excel-reports/' + name + ' (' + date + ').xlsx';
  fs.writeFile(filename, new Buffer(result, 'binary'),  'binary', function(err) {
    if(err) {
        console.log(err);
    } else {
        console.log("Se guardó el archivo: " + filename);
    }
  });
  res.send({
    location: '/' + filename
  });

  setTimeout(() => {
    fs.unlink(filename, (err) => {
      if(err){
        console.log('Ocurrió un error al eliminar el archivo: ' + filename);
      }else{
        console.log('Eliminando el archivo: ' + filename);
      }
    });
  }, 1000*60*0.1);
}
