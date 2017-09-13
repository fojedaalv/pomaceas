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
            name: "Cuartel 1",
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
        var datum = [];
        var lineData = lines[line].split("\t");
        // Default file has 33 columns
        if(lineData.length==33){
          datum = [];
          // Fix date length
          var tempDate = lineData[0].split("-");
          if(tempDate[2].length==2){
            lineData[0] = tempDate[0]+"-"+tempDate[1]+"-20"+tempDate[2];
          }

          // Build datum from corresponding fields
          datum.push(lineData[0]);
          datum.push(lineData[1]);
          datum.push(lineData[2]);
          datum.push(lineData[3]);
          datum.push(lineData[4]);
          datum.push(lineData[5]);
          datum.push(lineData[7]);
          datum.push(lineData[17]);
          datum.push(lineData[19]);
          datum.push(lineData[28]);
        }else{
          datum = lineData;
        }
        if(datum.indexOf('---') > -1){
          //alert("Este dato está pifiao: " + datum);
          var lastDatum = vm.fileData[vm.fileData.length-1];
          for(var i=2; i < datum.length; i++){
            datum[i]=lastDatum[i];
          }
          vm.fileData.push(datum);
        }else{
          vm.fileData.push(datum);
        }
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
      vm.loadStationSummary();
    })
    .error(function(e){
      //vm.uploadError = e.message;
      vm.uploadProgress = 100;
      vm.uploadInfo = "Los datos fueron subidos exitosamente.";
      vm.fileDataDisplay = [];
      vm.isDataLoaded = false;
      vm.isUploading = false;
      vm.loadStationSummary();
      console.log(e);
    })
  }

  // ========== Date selection code ==========
  vm.startCalendar = {
    format: 'dd MMMM yyyy',
    isOpen: false
  }
  vm.endCalendar = {
    format: 'dd MMMM yyyy',
    isOpen: false
  }
  vm.dateOptions = {
    formatYear: 'yy',
    datepickerMode: 'day',
    minMode:'day',
    maxMode:'day',
    initDate: null,
    maxDate: null,
    minDate: null,
    startingDay: 1
  };
  vm.openCal1 = function(){
    vm.startCalendar.isOpen = true;
  }
  vm.openCal2 = function(){
    vm.endCalendar.isOpen = true;
  }

  vm.stationSummary = {};
  vm.loadStationSummary = () => {
    sensorDataSvc.getStationSummary(vm.stationId)
    .success(function(data){
      vm.stationSummary = data;
      if(vm.stationSummary.datesAvailable.length>0){
        var jsonDate = vm.stationSummary.datesAvailable[vm.stationSummary.datesAvailable.length-1]._id;
        vm.startDate = new Date(jsonDate.year, jsonDate.month-1, jsonDate.day);
        vm.minDate = new Date(jsonDate.year, jsonDate.month-1, jsonDate.day);
        jsonDate = vm.stationSummary.datesAvailable[0]._id;
        vm.endDate = new Date(jsonDate.year, jsonDate.month-1, jsonDate.day);
        vm.maxDate = new Date(jsonDate.year, jsonDate.month-1, jsonDate.day);

        vm.dateOptions.initDate = vm.minDate;
        vm.dateOptions.maxDate = vm.maxDate;
        vm.dateOptions.minDate = vm.minDate;
      }
    })
    .error(function(e){
      vm.errMessage = "Ha ocurrido un error en la obtención de los datos de la estación.";
    })
  }
  vm.loadStationSummary();

  vm.removeSensorData = () => {
    var initialDate = moment(vm.startDate).format('YYYY-MM-DD');
    var endingDate = moment(vm.endDate).format('YYYY-MM-DD');
    var conf = confirm("Se eliminarán datos entre las fechas: "+initialDate+" y "+endingDate+". ¿Está seguro?");
    if(conf){
      sensorDataSvc.deleteDataByDate(vm.stationId, initialDate, endingDate)
      .success(function(data){
        alert("Datos eliminados con éxito.");
        vm.loadStationSummary();
      })
      .error(function(e){
        alert("Ha ocurrido un error en la eliminación de los datos de la estación.");
        console.log(e);
      })
    }
  }
}
