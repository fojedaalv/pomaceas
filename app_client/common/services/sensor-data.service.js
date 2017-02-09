angular.module('PomaceasWebApp')
.service('sensorDataSvc', sensorDataSvc);

function sensorDataSvc($http, $window, authSvc){
  var uploadData = function(data){
    return $http.post('/api/v1/sensor-data', data);
  }

  return {
    uploadData : uploadData
  };
}
