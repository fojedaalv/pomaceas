angular.module('PomaceasWebApp')
.controller('dashboardUserStationsViewCtrl', dashboardUserStationsViewCtrl);

function dashboardUserStationsViewCtrl(stationsSvc, $routeParams, $scope){
  var vm = this;
  vm.station = {};
  vm.stationId = $routeParams.stationId;
  vm.errMessage = "";

  stationsSvc.getStation(vm.stationId)
  .success(function (data) {
    vm.station = data;
  })
  .error(function (e) {
    //vm.errMessage = e.message;
    vm.errMessage = "La estación solicitada no se pudo encontrar.";
  });

  // ==================================================
  // ========= Código para Leer Archivo CSV ===========

  vm.fileData = [];
  vm.fileDataDisplay = [];
  vm.isDataLoaded = false;
  vm.loadProgress = 0;
  vm.loadFile = function(){
    // Adapted from http://stackoverflow.com/questions/18571001/file-upload-using-angularjs
    // http://jsfiddle.net/f8Hee/1/
    console.log("Loading file.");
    var f = document.getElementById('file').files[0];
    var r = new FileReader();
    r.onprogress = function(e){
      console.log(e.total+","+e.loaded);
      vm.loadProgress = e.loaded/e.total*100;
    }

    r.onloadend = function(e){
      /*
      var data = e.target.result.split("\n").slice(2);
      var something = data.join("\n").split("\t");
      vm.fileData = something;
      */
      var lines = e.target.result.split("\n").slice(2);
      var data = [];
      for(var line = 0; line < lines.length; line++){
        var datum = lines[line].split("\t");
        vm.fileData.push(datum);
      }
      vm.fileDataDisplay = vm.fileData.slice(0,100);
      vm.isDataLoaded = true;
      vm.loadProgress = 100;
      $scope.$apply();
    }
    r.readAsText(f);
  }
}
