angular.module('PomaceasWebApp')
.controller('dashboardUserEditCtrl', dashboardUserEditCtrl);

function dashboardUserEditCtrl(usersSvc, authSvc, $routeParams, $location){
  var vm = this;
  vm.user = authSvc.currentUser();
  vm.userId = vm.user.id;
  vm.errMessage = "";
  vm.passErrMessage = "";
  vm.passFormInfo ="";
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
      vm.formInfo ="Los datos del usuario han sido actualizados exitosamente.";
      vm.user = data.user;
      authSvc.saveToken(data.token);
    })
    .error(function (e) {
      vm.errMessage = "El usuario no se pudo modificar. Detalles del error: "+e.message;
      vm.formInfo = "";
    })
  }

  vm.newPassword = {}

  vm.onSubmitPasswordChange = () => {
    vm.passErrMessage = "";
    vm.passFormInfo = "";
    if(vm.newPassword.old && vm.newPassword.new && vm.newPassword.new2){
      if(vm.newPassword.new == vm.newPassword.new2){
        authSvc.passwordChange(vm.newPassword)
        .success(function(data){
          authSvc.saveToken(data.token);
          vm.passFormInfo = 'Contraseña cambiada exitosamente.';
        })
        .error(function(error){
          vm.passErrMessage = error.message;
        });
      }else{
        vm.passErrMessage = 'Las contraseñas no coinciden.';
      }
    }else{
      vm.passErrMessage = 'Existen datos incompletos en el formulario.';
    }
  }
}
