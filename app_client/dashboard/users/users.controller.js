angular.module('PomaceasWebApp')
.controller('dashboardUsersCtrl', dashboardUsersCtrl);

function dashboardUsersCtrl($scope, usersSvc){
  var vm = this;
  vm.users = [];
  vm.formError = "";

  usersSvc.getUsersList()
  .error(function(err){
    vm.formError = err.message;
  })
  .then(function(data){
    vm.users = data.data;
  });
}
