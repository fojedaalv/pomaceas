angular.module('PomaceasWebApp')
.service('excelSvc', excelSvc);

function excelSvc($http, authSvc){
  var createExcelFile = (filename, headers, data) => {
    return $http.post('/api/v1/excel', {
        filename : filename,
        headers  : headers,
        data     : data
      }, {
      headers: {
        'Authorization': 'Bearer '+ authSvc.getToken()
      }
    });
  }

  return {
    createExcelFile    : createExcelFile,
  }
}
