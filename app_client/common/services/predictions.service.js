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

  var getPredictionSunDamageFuji = function(stationId, year){
    return $http.get('/api/v1/pred-sun-fuji/'+stationId+"?year="+year);
  }

  var getPredictionRussetFuji = function(stationId, year){
    return $http.get('/api/v1/pred-fuji-russet/'+stationId+"?year="+year);
  }

  var getPredictionColorFujiPink = function(stationId, year){
    return $http.get('/api/v1/pred-color-fujipink/'+stationId+"?year="+year);
  }

  var getPredictionSunDamagePink = function(stationId, year){
    return $http.get('/api/v1/pred-sun-pink/'+stationId+"?year="+year);
  }

  var getPredictionBitterPitFuji = function(stationId, sectorId, year){
    return $http.get('/api/v1/pred-bitterpit-fuji/'+stationId+"?year="+year+"&sectorId="+sectorId);
  }

  var getPredictionLenticelosisGala = function(stationId, sectorId, year){
    return $http.get('/api/v1/pred-lenticelosis-gala/'+stationId+"?year="+year+"&sectorId="+sectorId);
  }

  var getPredicitonEarlyStorageGala = function(stationId, sectorId, year){
    return $http.get('/api/v1/pred-earlystorage-gala/'+stationId+"?year="+year+"&sectorId="+sectorId)
  }

  var getPredicitonEarlyStorageFuji = function(stationId, sectorId, year){
    return $http.get('/api/v1/pred-earlystorage-fuji/'+stationId+"?year="+year+"&sectorId="+sectorId)
  }

  var getPredicitonEarlyStoragePink = function(stationId, sectorId, year){
    return $http.get('/api/v1/pred-earlystorage-pink/'+stationId+"?year="+year+"&sectorId="+sectorId)
  }

  return {
    getPredictionColorGala        : getPredictionColorGala,
    getPredictionSizeGala         : getPredictionSizeGala,
    getPredictionHarvestGala      : getPredictionHarvestGala,
    getPredictionSunDamageFuji    : getPredictionSunDamageFuji,
    getPredictionRussetFuji       : getPredictionRussetFuji,
    getPredictionColorFujiPink    : getPredictionColorFujiPink,
    getPredictionSunDamagePink    : getPredictionSunDamagePink,
    getPredictionBitterPitFuji    : getPredictionBitterPitFuji,
    getPredictionLenticelosisGala : getPredictionLenticelosisGala,
    getPredicitonEarlyStorageGala : getPredicitonEarlyStorageGala,
    getPredicitonEarlyStorageFuji : getPredicitonEarlyStorageFuji,
    getPredicitonEarlyStoragePink : getPredicitonEarlyStoragePink
  };
}
