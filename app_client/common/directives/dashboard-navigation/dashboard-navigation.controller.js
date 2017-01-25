angular.module('PomaceasWebApp')
.controller('dashboardNavigationCtrl', dashboardNavigationCtrl);

function dashboardNavigationCtrl($location, authSvc){
  var vm = this;
  vm.isActive = function (viewLocation) {
    return viewLocation === $location.path();
  };
}
