angular.module('PomaceasWebApp')
.controller('loginCtrl', loginCtrl);

function loginCtrl(authSvc, $location, $rootScope){
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
      vm.doLogin();
    }
  };

  vm.doLogin = function(){
    vm.formError = "";
    vm.formInfo = "Accediendo al sistema...";
    authSvc
    .login(vm.credentials)
    .error(function(err){
      vm.formError = err.message;
    })
    .then(function(){
      $location.path('/dashboard');
      $rootScope.$emit("UserLoggedIn", {});
    });
  }
}
