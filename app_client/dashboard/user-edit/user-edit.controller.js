angular.module('PomaceasWebApp')
.controller('dashboardUserEditCtrl', dashboardUserEditCtrl);

function dashboardUserEditCtrl(usersSvc, authSvc, $routeParams, $location){
  var vm = this;
  vm.user = authSvc.currentUser();
  vm.userId = vm.user.id;
  vm.errMessage = "";
  vm.formInfo ="";

  usersSvc.getUser(vm.userId)
  .success(function (data) {
    vm.user = data;
  })
  .error(function (e) {
    //vm.errMessage = e.message;
    vm.errMessage = "El usuario solicitado no se pudo encontrar.";
  });;

  vm.onSubmit = function(){
    usersSvc.updateSelfUser(vm.user)
    .success(function(data) {
      vm.errMessage ="";
      vm.infoMessage ="Los datos del usuario han sido actualizados exitosamente.";
      vm.user = data.user;
      authSvc.saveToken(data.token);
    })
    .error(function (e) {
      vm.errMessage = "El usuario no se pudo modificar. Detalles del error: "+e.message;
      vm.formInfo = "";
    })
  }
}
