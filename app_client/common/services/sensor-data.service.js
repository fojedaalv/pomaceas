angular.module('PomaceasWebApp')
.service('sensorDataSvc', sensorDataSvc);

function sensorDataSvc($http, $window, authSvc){
  var uploadData = function(data){
    return $http.post('/api/v1/sensor-data', data);
  }

  var getStationSummary = function(stationId){
    return $http.get('/api/v1/get-station-summary/'+stationId)
  }

  var getSensorDataByDate = function(stationId, startdate){
    return $http.get('/api/v1/get-sensordata-bydate/'+stationId+"?startdate="+startdate);
  }

  var getSensorDataByDateRange = function(stationId, startdate, enddate){
    return $http.get('/api/v1/get-sensordata-bydate/'+stationId+"?startdate="+startdate+"&enddate="+enddate);
  }

  var getReportByMonth = function(stationId, startdate, enddate){
    return $http.get('/api/v1/get-report-bymonth/'+stationId+"?startdate="+startdate+"&enddate="+enddate);
  }

  var getSensorDataDailyAvgByMonth = function(stationId, date){
    return $http.get('/api/v1/daily-avg-bymonth/'+stationId+"?date="+date);
  }

  var getVariable = function(data){
    return $http.get('/api/v1/get-variable/', {
      params: data
    });
  }

  return {
    uploadData : uploadData,
    getStationSummary : getStationSummary,
    getSensorDataByDate : getSensorDataByDate,
    getSensorDataByDateRange : getSensorDataByDateRange,
    getReportByMonth : getReportByMonth,
    getSensorDataDailyAvgByMonth : getSensorDataDailyAvgByMonth,
    getVariable: getVariable
  };
}
