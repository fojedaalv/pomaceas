angular.module('PomaceasWebApp')
.service('stationsSvc', stationsSvc);

function stationsSvc($http, $window, authSvc){
  var getStationsList = function(pageNumber = 0, pageSize = 0){
    return $http.get('/api/v1/stations',{
      params : {
        'page[number]' : pageNumber,
        'page[size]'   : pageSize
      },
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

  var updateSectors = function(stationId, sectors){
    var stationId = stationId;
    return $http.patch('/api/v1/stations_sectors/'+stationId, {
      sectors: sectors
    }, {
      headers: {
        'Authorization': 'Bearer '+ authSvc.getToken()
      }
    })
  }

  var getUserStations = function(userId){
    return $http.get('/api/v1/userstations/'+userId, {
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
    updateStation : updateStation,
    getUserStations : getUserStations,
    updateSectors : updateSectors
  };
}
