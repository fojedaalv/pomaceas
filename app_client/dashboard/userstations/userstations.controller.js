angular.module('PomaceasWebApp')
.controller('dashboardUserStationsCtrl', dashboardUserStationsCtrl);

function dashboardUserStationsCtrl(stationsSvc, authSvc){
  var vm = this;
  vm.stations = [];
  vm.errMessage = "";
  vm.user = authSvc.currentUser();

  vm.loadUserStations = function(){
    stationsSvc.getUserStations(vm.user.id)
    .error(function(err){
      vm.errMessage = err.message;
    })
    .then(function(data){
      vm.stations = data.data;
    });
  }

  vm.loadUserStations();
}
