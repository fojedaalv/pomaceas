angular.module('PomaceasWebApp')
.controller('dashboardNutritionalAnalysisCtrl', dashboardNutritionalAnalysisCtrl);

function dashboardNutritionalAnalysisCtrl(stationsSvc, $scope){
  var vm = this;
  vm.stations = [];
  vm.errMessage = "";

  vm.loadStations = function(){
    stationsSvc.getStationsList(0, 0)
    .error(function(err){
      vm.errMessage = err.message;
    })
    .then(function(response){
      vm.stations = response.data.data;
      console.log("STATIONS")
      console.log(vm.stations)
    });
  }

  vm.loadStations();
}
