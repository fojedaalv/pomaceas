angular.module('PomaceasWebApp')
.controller('resetPasswordCtrl', resetPasswordCtrl);

function resetPasswordCtrl(authSvc, $location, authSvc, $routeParams){
  var vm = this;
  vm.formError="";
  vm.formInfo="";
  vm.userData = {
    token: $routeParams.token,
    email: $routeParams.email
  }
  if(vm.userData.token == null || vm.userData.email == null){
    vm.formError = "Al parecer el link que recibió posee errores en su formación. Revise el correo que recibió o consulte a la administración.";
  }
  vm.onSubmit = function(){
    vm.formError = "";
    if(vm.userData.pass1 != null && vm.userData.pass2 != null && vm.userData.pass1 == vm.userData.pass2){
      authSvc.resetPassword(vm.userData)
      .success(function(data){
        vm.formInfo = data.message;
        vm.formError = "";
      })
      .error(function(err){
        vm.formError = err.message;
        vm.formInfo = "";
      });
    }else{
      vm.formError = "Las contraseñas deben ser iguales y no quedar vacías.";
    }
  }
}
