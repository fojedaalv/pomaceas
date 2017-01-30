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

  vm.deleteUser = function(user){
    var userId = user._id;
    var confDialog = "¿Desea eliminar al usuario \""+ user.name +"\"?";
    var conf = confirm(confDialog);
    if(conf){
      console.log("Eliminar al usuario: " + userId);
      usersSvc.deleteUser(userId)
      .success(function (data) {
        var index = vm.users.indexOf(user);
        vm.users.splice(index, 1);
      })
      .error(function (e) {
        vm.errMessage = e.message;
      });;
    }
  }
}
