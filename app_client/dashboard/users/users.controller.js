angular.module('PomaceasWebApp')
.controller('dashboardUsersCtrl', dashboardUsersCtrl);

function dashboardUsersCtrl($scope, usersSvc){
  var vm = this;
  vm.users = [];
  vm.errMessage = "";

  // Variables para Paginación
  vm.totalItems  = 10;
  vm.currentPage = 1;
  vm.maxPages    = 5;
  vm.pageSize    = 10;
  vm.setPage     = (pageNo) => {
    vm.currentPage = pageNo;
  };
  vm.pageChanged = (pageNo) => {
    vm.loadUsers();
  }
  // FIN Variables para paginación

  vm.loadUsers = () => {
    usersSvc.getUsersList(vm.currentPage-1, vm.pageSize)
    .error(function(err){
      vm.errMessage = err.message;
    })
    .then(function(response){
      vm.users      = response.data.data;
      vm.totalItems = response.data.meta['total-items'];
      vm.maxPages   = response.data.meta['total-pages'];
    });
  }

  vm.loadUsers();

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
