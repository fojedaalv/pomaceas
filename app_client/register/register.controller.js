angular.module('PomaceasWebApp')
.controller('registerCtrl', registerCtrl);

function registerCtrl(authSvc){
  var vm = this;
  vm.formError="";
  vm.formInfo="";
  vm.credentials = {
    email: "",
    password: ""
  }
  vm.onSubmit = function(){
    vm.formError = "";
    if (!vm.credentials.email || !vm.credentials.password) {
      vm.formError = "Todos los campos son requeridos. Por favor, intente nuevamente.";
      return false;
    } else {
      vm.doRegister();
    }
  };
  vm.doRegister = function(){
    vm.formError = "";
    authSvc
    .register(vm.credentials)
    .error(function(err){
      vm.formError = err.message;
    })
    .then(function(){
      vm.formInfo = "El usuario ha sido registrado.";
      //$location.path('/dashboard/events');
      //$rootScope.$emit("UserLoggedIn", {});
    });
  }
}
