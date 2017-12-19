angular.module('PomaceasWebApp')
.service('usersSvc', usersSvc);

function usersSvc($http, $window, authSvc){
  var getUsersList = function(pageNumber = 0, pageSize = 0){
    return $http.get('/api/v1/users',{
      params : {
        'page[number]' : pageNumber,
        'page[size]'   : pageSize
      },
      headers: {
        Authorization: 'Bearer '+ authSvc.getToken()
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

  var deleteUser = function(userId){
    return $http.delete('/api/v1/users/'+userId, {
      headers: {
        'Authorization': 'Bearer '+ authSvc.getToken()
      }
    });
  }

  var updateSelfUser = function(user){
    return $http.put('/api/v1/user-update/'+user._id, user, {
      headers: {
        'Authorization': 'Bearer '+ authSvc.getToken()
      }
    });
  }

  return {
    getUsersList : getUsersList,
    getUser : getUser,
    updateUser : updateUser,
    deleteUser : deleteUser,
    updateSelfUser : updateSelfUser
  };
}
