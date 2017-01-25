angular.module('PomaceasWebApp')
.service('usersSvc', usersSvc);

function usersSvc($http, $window, authSvc){
  var getUsersList = function(){
    return $http.get('/api/v1/users',{
      headers: {
        Authorization: 'Bearer '+ authSvc.getToken()
      }
    });
  }

  return {
    getUsersList : getUsersList
  };
}
