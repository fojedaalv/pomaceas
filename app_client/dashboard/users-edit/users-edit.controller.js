angular.module('PomaceasWebApp')
.controller('dashboardUsersEditCtrl', dashboardUsersEditCtrl);

function dashboardUsersEditCtrl(usersSvc, $routeParams, $location){
  var vm = this;
  vm.user = {};
  vm.userId = $routeParams.userId;
  vm.errMessage = "";
  usersSvc.getUser(vm.userId)
  .success(function (data) {
    vm.user = data[0];
  })
  .error(function (e) {
    //vm.errMessage = e.message;
    vm.errMessage = "El usuario solicitado no se pudo encontrar.";
  });;

  vm.onSubmit = function(){
    usersSvc.updateUser(vm.user)
    .success(function(data) {
      $location.path('/dashboard/users');
    })
    .error(function (e) {
      vm.errMessage = "El usuario no se pudo modificar. Detalles del error: "+e.message;
    })
  }
}
