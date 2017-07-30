angular.module('PomaceasWebApp')
.service('predictionsSvc', predictionsSvc);

function predictionsSvc($http, $window, authSvc){
  var getPredictionColorGala = function(stationId, year){
    return $http.get('/api/v1/pred-color-gala/'+stationId+"?year="+year);
  }

  var getPredictionSizeGala = function(stationId, year){
    return $http.get('/api/v1/pred-size-gala/'+stationId+"?year="+year);
  }

  var getPredictionHarvestGala = function(stationId, year, month, day){
    return $http.get('/api/v1/pred-harvest-gala/'+stationId+"?year="+year+"&month="+month+"&day="+day);
  }

  return {
    getPredictionColorGala: getPredictionColorGala,
    getPredictionSizeGala: getPredictionSizeGala,
    getPredictionHarvestGala: getPredictionHarvestGala
  };
}
