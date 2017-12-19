angular.module('PomaceasWebApp')
.controller('dashboardStationsCtrl', dashboardStationsCtrl);

function dashboardStationsCtrl(stationsSvc, $scope){
  var vm = this;
  vm.stations = [];
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
    vm.loadStations();
  }
  // FIN Variables para paginación

  vm.loadStations = function(){
    stationsSvc.getStationsList(vm.currentPage-1, vm.pageSize)
    .error(function(err){
      vm.errMessage = err.message;
    })
    .then(function(response){
      vm.stations = response.data.data;
      vm.totalItems = response.data.meta['total-items'];
      vm.maxPages   = response.data.meta['total-pages'];
      vm.markers = vm.buildMarkers(vm.stations);
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

  vm.cursor = {
    id: 0,
    location: {
      latitude: -35.433333,
      longitude: -71.666667
    }
  }

  vm.map = {
    center: {
      latitude: -35.433333,
      longitude: -71.666667
    },
    zoom: 10,
    events: {
      click: function(map, eventName, arguments){
        vm.cursor.location.latitude = arguments[0].latLng.lat();
        vm.cursor.location.longitude = arguments[0].latLng.lng();
        $scope.$apply();
      }
    }
  };

  vm.markers = [];

  vm.buildMarkers = function(stations){
    var markers = [];
    for (var i = 0; i < stations.length; i++) {
      var marker = {
        id: stations[i]._id,
        latitude: stations[i].location.coordinates[0],
        longitude: stations[i].location.coordinates[1],
        title: stations[i].name
      }
      markers.push(marker);
    }
    return markers;
  }

  vm.clickMarker = function(i,e,obj){

  }
  // ==================================================
  // ========= Código para Crear Estaciones ===========
  vm.newStation = {
    name: "",
    city: "",
    region: "VII",
    location: [-35.433333,-71.666667]
  }
  vm.onSubmit = function(){
    vm.newStation.location[0] = vm.cursor.location.latitude;
    vm.newStation.location[1] = vm.cursor.location.longitude;
    stationsSvc.createStation(vm.newStation)
    .success(function(station){
      vm.loadStations();
    })
    .error(function (e) {
      vm.errMessage = "La estación no pudo ser creada. Detalles del error: "+e.message;
      vm.newStation = {
        name: "",
        city: "",
        region: "VII",
        location: [-35.433333,-71.666667]
      }
    });
  }
}
