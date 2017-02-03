angular.module('PomaceasWebApp')
.controller('dashboardStationsMapCtrl', dashboardStationsMapCtrl);

function dashboardStationsMapCtrl(stationsSvc, $scope){
  var vm = this;
  vm.stations = [];
  vm.markers = [];
  vm.errMessage = "";

  vm.loadStations = function(){
    stationsSvc.getStationsList()
    .error(function(err){
      vm.errMessage = err.message;
    })
    .then(function(data){
      console.log("Loading stations and markers.");
      vm.stations = data.data;
      vm.markers = vm.buildMarkers(vm.stations);
      console.log("Hay: "+vm.markers.length+" marcadores.");
    });
  }

  vm.map = {
    center: {
      latitude: -35.433333,
      longitude: -71.666667
    },
    zoom: 10,
    events: {
      click: function(map, eventName, arguments){
        $scope.$apply();
      }
    }
  };

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

  vm.loadStations();
}
