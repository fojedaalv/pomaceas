angular.module('PomaceasWebApp')
.controller('dashboardStationsEditCtrl', dashboardStationsEditCtrl);

function dashboardStationsEditCtrl(stationsSvc, usersSvc, $routeParams, $scope){
  var vm = this;
  vm.errMessage = "";
  vm.formInfo = "";
  vm.users = []

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
  vm.onSubmit = function(){
    vm.station.location[0] = vm.cursor.location.latitude;
    vm.station.location[1] = vm.cursor.location.longitude;
    stationsSvc.updateStation(vm.station)
    .success(function(station){
      //$location.path('/dashboard/stations');
      vm.formInfo = "Los datos de la estación fueron actualizados exitosamente.";
    })
    .error(function (e) {
      vm.errMessage = "La estación no pudo ser actualizada. Detalles del error: "+e.message;
    });
  }

  stationsSvc.getStation($routeParams.stationId)
  .success(function(station){
    vm.station = station;
    vm.cursor.location.latitude = vm.station.location.coordinates[0];
    vm.cursor.location.longitude = vm.station.location.coordinates[1];
  })
  .error(function (e) {
    vm.errMessage = "La estación no pudo ser leída. Revise que la ruta esté correcta.";
  });

  // ==================================================
  // ========= Código para Ejecutar al Inicio==========
  usersSvc.getUsersList()
  .success(function(response){
    vm.users = response.data;
  })
  .error(function(e){
    vm.errMessage = "No se pudo obtener la lista de usuarios. Detalles del error: "+e.message;
  })
}
