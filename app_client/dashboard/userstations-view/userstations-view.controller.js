angular.module('PomaceasWebApp')
.controller('dashboardUserStationsViewCtrl', dashboardUserStationsViewCtrl);

function dashboardUserStationsViewCtrl(
    stationsSvc,
    $routeParams,
    $scope,
    sensorDataSvc,
    APPLE_CULTIVARS
  ){
  var vm = this;
  vm.apple_cultivars = APPLE_CULTIVARS;
  vm.station = {};
  vm.stationId = $routeParams.stationId;
  vm.errMessage = "";
  vm.getData = () => {
    stationsSvc.getStation(vm.stationId)
    .success(function (data) {
      vm.station = data;
      if(!vm.station.sectors){
        vm.station.sectors = [
          {
            name: "Sector 1",
            cultivar: vm.apple_cultivars[0].value
          }
        ]
      }
    })
    .error(function (e) {
      //vm.errMessage = e.message;
      vm.errMessage = "La estación solicitada no se pudo encontrar.";
    });
  }

  vm.getData();
  vm.addSector = () => {
    vm.station.sectors.push({
      name: "Sector Nuevo",
      cultivar: vm.apple_cultivars[0].value
    })
    vm.editSectors();
  }

  vm.editSectors = () => {
    vm.editingSectors = true;
  }

  vm.removeSector = (sector) => {
    if(vm.station.sectors.length>1){
      var index = vm.station.sectors.indexOf(sector);
      vm.station.sectors.splice(index, 1);
    }else{
      alert("No se puede eliminar el sector. Debe haber al menos un sector registrado para la estación.");
    }
  }

  vm.updateSectors = () => {
    vm.editingSectors = false;
    stationsSvc.updateSectors(vm.station._id, vm.station.sectors)
    .success(function (data) {
      vm.getData();
    })
    .error(function (e) {
      //vm.errMessage = e.message;
      vm.errMessage = "Ocurrió un error al modificar los sectores.";
    });
  }

  vm.cancelEditSectors = () => {
    vm.editingSectors = false;
    vm.getData();
  }

  // ==================================================
  // ========= Código para Leer Archivo CSV ===========

  vm.fileData = [];
  vm.fileDataDisplay = [];
  vm.isDataLoaded = false;
  vm.loadProgress = 0;
  vm.uploadProgress = 0;
  vm.isUploading = true;
  vm.loadFile = function(){
    // Adapted from http://stackoverflow.com/questions/18571001/file-upload-using-angularjs
    // http://jsfiddle.net/f8Hee/1/
    console.log("Loading file.");
    var f = document.getElementById('file').files[0];
    var r = new FileReader();
    r.onprogress = function(e){
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

  vm.uploadData = function(){
    vm.isUploading = true;
    vm.uploadProgress = 100;
    var chunkSize = 100;
    var nData = vm.fileData.length;
    var i;
    var chunk = [];
    for(i = 0; i < Math.floor(nData/chunkSize); i++){
      chunk = vm.fileData.slice(chunkSize*i, chunkSize*(i+1));
      sensorDataSvc.uploadData({
        station: vm.stationId,
        data: chunk
      })
      .success(function(result){
        //vm.uploadProgress = (nData/(chunkSize*(i+1)))*100;
      })
      .error(function(e){
        vm.uploadError = e.message;
      })
    }
    chunk = vm.fileData.slice(chunkSize*i);
    console.log("Final chunk size is: "+chunk.length);
    console.log(chunk);
    sensorDataSvc.uploadData({
      station: vm.stationId,
      data: chunk
    })
    .success(function(result){
      vm.uploadProgress = 100;
      vm.uploadInfo = "Los datos fueron subidos exitosamente.";
      vm.fileDataDisplay = [];
      vm.isDataLoaded = false;
      vm.isUploading = false;
    })
    .error(function(e){
      vm.uploadError = e.message;
    })
  }
}
