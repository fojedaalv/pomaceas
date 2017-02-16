angular.module('PomaceasWebApp')
.controller('dashboardStationsNewCtrl', dashboardStationsNewCtrl);

function dashboardStationsNewCtrl(stationsSvc, usersSvc, $scope, $location){
  var vm = this;
  vm.users = [];
  vm.errMessage = "";

  // ==================================================
  // ====== Código para la Funcionalidad del Mapa =====

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

  vm.clickMarker = function(i,e,obj){

  }
  // ==================================================
  // ========= Código para Crear Estaciones ===========
  vm.newStation = {
    name: "",
    city: "",
    region: "VII",
    owner: "",
    location: [-35.433333,-71.666667]
  }
  vm.onSubmit = function(){
    vm.newStation.location[0] = vm.cursor.location.latitude;
    vm.newStation.location[1] = vm.cursor.location.longitude;
    stationsSvc.createStation(vm.newStation)
    .success(function(station){
      $location.path('/dashboard/stations');
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

  // ==================================================
  // ========= Código para Ejecutar al Inicio==========
  usersSvc.getUsersList()
  .success(function(users){
    vm.users = users;
  })
  .error(function(e){
    vm.errMessage = "No se pudo obtener la lista de usuarios. Detalles del error: "+e.message;
  })
}
