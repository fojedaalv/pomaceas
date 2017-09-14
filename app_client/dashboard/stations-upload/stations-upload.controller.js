angular.module('PomaceasWebApp')
.controller('dashboardStationsUploadCtrl', dashboardStationsUploadCtrl);

function dashboardStationsUploadCtrl(
  stationsSvc,
  sensorDataSvc,
  $scope
){
  var vm = this;
  vm.errMessage = "";
  vm.stations = [];
  vm.stationId = null;
  vm.stationSummary = {};

  // ==================================================
  // ========== Código para la Carga de Datos =========

  vm.loadStations = function(){
    stationsSvc.getStationsList()
    .error(function(err){
      vm.errMessage = err.message;
    })
    .then(function(data){
      vm.stations = data.data;
      vm.stationId = vm.stations[0]._id;
    });
  }

  vm.loadStationSummary = () => {
    console.log("Cargando resumen de la estación.");
    sensorDataSvc.getStationSummary(vm.stationId)
    .success(function(data){
      vm.stationSummary = data;
      if(vm.stationSummary.datesAvailable.length>0){
        var jsonDate = vm.stationSummary.datesAvailable[vm.stationSummary.datesAvailable.length-1]._id;
        vm.minDate = new Date(jsonDate.year, jsonDate.month-1, jsonDate.day);
        jsonDate = vm.stationSummary.datesAvailable[0]._id;
        vm.maxDate = new Date(jsonDate.year, jsonDate.month-1, jsonDate.day);
      }
    })
    .error(function(e){
      vm.errMessage = "Ha ocurrido un error en la obtención de los datos de la estación.";
    })
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
      console.log(vm.fileData);
    }
    r.readAsText(f);
  }

  // ==================================================
  // ========== Código para Inicializar Datos =========

  vm.loadStations();

  // ==================================================
  // ========= Código para Observar Variables =========

  $scope.$watch('vm.stationId', () => {
    /*
    if(vm.selectedSummary != null && vm.stationSummary != null){
      vm.summary = vm.summaries.find((summ) => { return summ._id === vm.selectedSummary });
      vm.processSummary();
    }*/
    if(vm.stationId != null){
      vm.loadStationSummary();
    }
  })

  // ==================================================
  // ====== Código para la Funcionalidad del Mapa =====

}
