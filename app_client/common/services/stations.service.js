angular.module('PomaceasWebApp')
.service('stationsSvc', stationsSvc);

function stationsSvc($http, $window, authSvc){
  var getStationsList = function(){
    return $http.get('/api/v1/stations',{
      headers: {
        Authorization: 'Bearer '+ authSvc.getToken()
      }
    });
  }

  var getPublicStationsList = function(){
    return $http.get('/api/v1/stations-public');
  }

  var createStation = function(station){
    return $http.post('/api/v1/stations', station,{
      headers: {
        Authorization: 'Bearer '+ authSvc.getToken()
      }
    })
  }

  var deleteStation = function(stationId){
    return $http.delete('/api/v1/stations/'+stationId, {
      headers: {
        'Authorization': 'Bearer '+ authSvc.getToken()
      }
    });
  }

  var getStation = function(stationId){
    return $http.get('/api/v1/stations/'+stationId, {
      headers: {
        'Authorization': 'Bearer '+ authSvc.getToken()
      }
    });
  }

  var updateStation = function(station){
    var stationId = station._id;
    return $http.put('/api/v1/stations/'+stationId, station, {
      headers: {
        'Authorization': 'Bearer '+ authSvc.getToken()
      }
    });
  }

  return {
    getStationsList : getStationsList,
    createStation : createStation,
    deleteStation : deleteStation,
    getPublicStationsList : getPublicStationsList,
    getStation : getStation,
    updateStation : updateStation
  };
}
