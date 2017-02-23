angular.module('PomaceasWebApp')
.service('sensorDataSvc', sensorDataSvc);

function sensorDataSvc($http, $window, authSvc){
  var uploadData = function(data){
    return $http.post('/api/v1/sensor-data', data);
  }

  var getStationSummary = function(stationId){
    return $http.get('/api/v1/get-station-summary/'+stationId)
  }

  var getSensorDataByDate = function(stationId, date){
    return $http.get('/api/v1/get-sensordata-bydate/'+stationId+"?date="+date);
  }

  var getReportByMonth = function(stationId, startdate, enddate){
    return $http.get('/api/v1/get-report-bymonth/'+stationId+"?startdate="+startdate+"&enddate="+enddate);
  }

  return {
    uploadData : uploadData,
    getStationSummary : getStationSummary,
    getSensorDataByDate : getSensorDataByDate,
    getReportByMonth : getReportByMonth
  };
}
