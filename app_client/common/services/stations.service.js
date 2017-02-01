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

  var getUser = function(userId){
    return $http.get('/api/v1/users/'+userId, {
      headers: {
        'Authorization': 'Bearer '+ authSvc.getToken()
      }
    });
  }

  var updateUser = function(user){
    var userId = user._id;
    return $http.put('/api/v1/users/'+userId, user, {
      headers: {
        'Authorization': 'Bearer '+ authSvc.getToken()
      }
    });
  }

  return {
    getStationsList : getStationsList,
    createStation : createStation,
    deleteStation : deleteStation,
    getUser : getUser,
    updateUser : updateUser
  };
}
