angular.module('PomaceasWebApp')
.controller('navigationCtrl', navigationCtrl);

function navigationCtrl($location, authSvc, $rootScope){
  var vm = this;
  vm.currentPath = $location.path();
  vm.isLoggedIn = authSvc.isLoggedIn();
  vm.currentUser = authSvc.currentUser();
  vm.logout = function() {
    authSvc.logout();
    vm.isLoggedIn = authSvc.isLoggedIn();
    $location.path('/');
  };
  $rootScope.$on("UserLoggedIn", function(){
    vm.isLoggedIn = authSvc.isLoggedIn();
    vm.currentUser = authSvc.currentUser();
  });
  vm.isActive = function (viewLocation) {
    //console.log(viewLocation)
    return viewLocation === $location.path();
  };
}
