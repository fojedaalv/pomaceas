angular.module('PomaceasWebApp')
.controller('homeCtrl', homeCtrl);

function homeCtrl($location, authSvc){
  var vm = this;
  if(authSvc.isLoggedIn()){
    $location.path('dashboard');
  }
}
