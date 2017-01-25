angular.module('PomaceasWebApp')
.controller('dashboardUsersCtrl', dashboardUsersCtrl);

function dashboardUsersCtrl($scope, usersSvc){
  var vm = this;
  vm.users = [];
  vm.errMessage = "";

  usersSvc.getUsersList()
  .error(function(err){
    vm.errMessage = err.message;
  })
  .then(function(data){
    vm.users = data.data;
  });
}
