angular.module('PomaceasWebApp')
.controller('dashboardCtrl', dashboardCtrl);

function dashboardCtrl($scope, authSvc){
  var vm = this;
  vm.userRole = authSvc.currentUser().role;
}
