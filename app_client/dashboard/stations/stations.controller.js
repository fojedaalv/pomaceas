angular.module('PomaceasWebApp')
.controller('dashboardStationsCtrl', dashboardStationsCtrl);

function dashboardStationsCtrl(stationsSvc){
  var vm = this;
  vm.stations = [];
  vm.errMessage = "";

  vm.loadStations = function(){
    stationsSvc.getStationsList()
    .error(function(err){
      vm.errMessage = err.message;
    })
    .then(function(data){
      vm.stations = data.data;
    });
  }

  vm.deleteStation = function(station){
    var stationId = station._id;
    var confDialog = "¿Desea eliminar la estación \""+ station.name +"\"?";
    var conf = confirm(confDialog);
    if(conf){
      console.log("Eliminar la estación: " + stationId);
      stationsSvc.deleteStation(stationId)
      .success(function (data) {
        var index = vm.stations.indexOf(station);
        vm.stations.splice(index, 1);
      })
      .error(function (e) {
        vm.errMessage = e.message;
      });;
    }
  }

  vm.loadStations();
  // ==================================================
  // ========= Código para Crear Estaciones ===========
  vm.newStation = {
    name: "",
    city: "",
    region: "VII",
    location: [-35.433333,-71.666667]
  }
  vm.onSubmit = function(){
    stationsSvc.createStation(vm.newStation)
    .success(function(station){
      vm.loadStations();
    })
    .error(function (e) {
      vm.errMessage = "La estación no pudo ser creada. Detalles del error: "+e.message;
      vm.newStation = {
        name: "",
        city: "",
        region: "",
        location: [-35.433333,-71.666667]
      }
    });
  }
}
