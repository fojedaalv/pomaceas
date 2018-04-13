angular.module('PomaceasWebApp')
.controller('stationsPublicCtrl', stationsPublicCtrl);

function stationsPublicCtrl(stationsSvc, $scope){
  var vm = this;
  vm.stations = [];
  vm.markers = [];
  vm.errMessage = "";

  vm.windowOptions = {
    visible: false
  };

  vm.loadStations = function(){
    stationsSvc.getPublicStationsList()
    .error(function(err){
      vm.errMessage = err.message;
    })
    .then(function(response){
      vm.stations = response.data.data;
      vm.markers = vm.buildMarkers(vm.stations);
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
        city: stations[i].city,
        region: stations[i].region,
        title: stations[i].name,
        icon: 'images/antenna.png'
      }
      markers.push(marker);
    }
    return markers;
  }

  vm.closeClick = function() {
      vm.windowOptions.visible = false;
  };

  vm.clickMarker = function(marker, eventName, model){
    model.show = !model.show;
  }

  vm.loadStations();
}
