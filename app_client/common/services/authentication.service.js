angular.module('PomaceasWebApp')
.service('authSvc', authSvc);

function authSvc($http, $window){
  var saveToken = function (token) {
    $window.localStorage['pomaceas-token'] = token;
  };

  var getToken = function () {
    return $window.localStorage['pomaceas-token'];
  };

  var isLoggedIn = function() {
    var token = getToken();

    if(token){
      var payload = JSON.parse($window.atob(token.split('.')[1]));
      return payload.exp > Date.now() / 1000;
    } else {
      return false;
    }
  };

  var currentUser = function() {
    if(isLoggedIn()){
      var token = getToken();
      var payload = JSON.parse(decodeURIComponent(escape($window.atob(token.split('.')[1]))));
      return {
        email : payload.email,
        name: payload.name,
        role: payload.role
      };
    }
  };

  var register = function(user) {
    return $http.post('/api/v1/register', user).success(function(data){
      saveToken(data.token);
    });
  };

  var login = function(user) {
    return $http.post('/api/v1/login', user).success(function(data) {
      saveToken(data.token);
    });
  };

  var logout = function() {
    $window.localStorage.removeItem('pomaceas-token');
  };

  return {
    currentUser : currentUser,
    saveToken : saveToken,
    getToken : getToken,
    isLoggedIn : isLoggedIn,
    register : register,
    login : login,
    logout : logout
  };
}
