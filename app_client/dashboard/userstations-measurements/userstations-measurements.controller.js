angular.module('PomaceasWebApp')
.controller('dashboardUserStationsMeasurementsCtrl', dashboardUserStationsMeasurementsCtrl);

function dashboardUserStationsMeasurementsCtrl(stationsSvc, $routeParams, $scope, sensorDataSvc){
  var vm = this;
  vm.station = {};
  vm.stationId = $routeParams.stationId;
  vm.errMessage = "";
  vm.stationSummary = {};
  vm.sensorData = [];
  vm.categories = [
    {name:"Temperatura", value:"temperature"}
  ]
  vm.selection = {
    date: "",
    category: vm.categories[0].value
  }


  stationsSvc.getStation(vm.stationId)
  .success(function (data) {
    vm.station = data;
  })
  .error(function (e) {
    //vm.errMessage = e.message;
    vm.errMessage = "La estación solicitada no se pudo encontrar.";
  });

  sensorDataSvc.getStationSummary(vm.stationId)
  .success(function(data){
    vm.stationSummary = data;
    vm.selection.date = JSON.stringify(vm.stationSummary.datesAvailable[0]._id);
  })
  .error(function(e){
    vm.errMessage = "Ha ocurrido un error en la obtención de los datos de la estación.";
  })

  $scope.$watch('vm.selection.date', function(){
    if(vm.selection.date != ""){
      var jsonDate = JSON.parse(vm.selection.date);
      var date = jsonDate.year+"-"+jsonDate.month+"-"+jsonDate.day;
      console.log("Date:"+date);
      sensorDataSvc.getSensorDataByDate(vm.station._id, date)
      .success(function(data){
        vm.sensorData = data;
      })
      .error(function(e){
        vm.errMessage = "Ha ocurrido un error en la obtención de los datos del sensor. Detalles del error: "+e.message;
      })
    }
  })
}
