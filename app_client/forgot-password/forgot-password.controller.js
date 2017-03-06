angular.module('PomaceasWebApp')
.controller('forgotPasswordCtrl', forgotPasswordCtrl);

function forgotPasswordCtrl(authSvc, $location, authSvc){
  var vm = this;
  vm.formError="";
  vm.formInfo="";
  vm.onSubmit = function(){
    if(vm.email == null){
      vm.formError = "Por favor, ingrese un correo válido.";
    }else{
      vm.formInfo = "Enviando solicitud para cambio de clave...";
      authSvc.requestPasswordReset(vm.email)
      .success(function(data){
        vm.formInfo = data.message;
        vm.formError = "";
      })
      .error(function(err){
        vm.formError = err.message;
        vm.formInfo = "";
      });
    }
  }
}
