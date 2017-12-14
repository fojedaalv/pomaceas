angular.module('PomaceasWebApp')
.controller('dashboardStationsUploadCtrl', dashboardStationsUploadCtrl);

function dashboardStationsUploadCtrl(
  stationsSvc,
  sensorDataSvc,
  $scope,
  Upload,
  moment
){
  var vm = this;
  vm.errMessage = "";
  vm.stations = [];
  vm.stationId = null;
  vm.stationSummary = {};

  // ==================================================
  // ========== Código para la Carga de Datos =========
  vm.isLoadingFile = false;

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

        vm.startDate = new Date(vm.minDate.getTime());
        vm.endDate   = new Date(vm.maxDate.getTime());
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
  vm.isUploading = false;
  vm.clearMessages = () => {
    vm.uploadInfo  = "";
    vm.uploadError = "";
  }
  vm.loadFile = function(){
    // Adapted from http://stackoverflow.com/questions/18571001/file-upload-using-angularjs
    // http://jsfiddle.net/f8Hee/1/
    var f = document.getElementById('file').files[0];
    if(f==undefined){
      alert("No se ha seleccionado un archivo de datos.");
      return;
    }
    vm.isLoadingFile = true;
    console.log("Loading file.");
    vm.uploadProgress = 0;
    vm.fileData = [];
    vm.clearMessages();

    console.log(document.getElementById('file').files);
    var r = new FileReader();
    r.onprogress = function(e){
      vm.loadProgress = e.loaded/e.total*100;
    }

    toIsoDate = (date, time) => {
      var spl = date.split("-");
      if(time.split(":")[0].length==1) time = "0"+time;
      return spl[2] + "-" + spl[1] + "-" + spl[0] + " " + time;
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
        if(lineData.length==1) continue;
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
          // Este dato tiene errores. Se copia el registro anterior.
          var lastDatum = vm.fileData[vm.fileData.length-1];
          for(var i=2; i < datum.length; i++){
            datum[i]=lastDatum[i];
          }
          vm.fileData.push(datum);
        }else{
          vm.fileData.push(datum);
        }
      }

      // FIX MISSING DATA
      console.log("Revisando datos faltantes");
      var purifiedData = [];

      var dateString = toIsoDate(vm.fileData[0][0], vm.fileData[0][1]);
      var expectedDate = moment.utc(dateString);
      var i = 0;
      var failures = 0;
      var maxFailures = 0;
      var missingDates = [];
      for(var i = 0; i<vm.fileData.length; i++){
        var tempDate = moment.utc(toIsoDate(vm.fileData[i][0], vm.fileData[i][1]));
        while(!tempDate.isSameOrBefore(expectedDate)){
          purifiedData.push([
            expectedDate.format('DD-MM-YY'),
            expectedDate.format('HH-mm'),
            vm.fileData[i-1][2],
            vm.fileData[i-1][3],
            vm.fileData[i-1][4],
            vm.fileData[i-1][5],
            vm.fileData[i-1][6],
            vm.fileData[i-1][7],
            vm.fileData[i-1][8],
            vm.fileData[i-1][9]
          ])
          missingDates.push(expectedDate.toDate());
          failures += 1;
          expectedDate.add(15, 'minutes');
        }
        // Se salta fechas que no sean múltiplo de 15
        if(tempDate.get('minute') % 15 != 0){
          continue;
        }

        purifiedData.push([
          expectedDate.format('DD-MM-YY'),
          expectedDate.format('HH-mm'),
          vm.fileData[i][2],
          vm.fileData[i][3],
          vm.fileData[i][4],
          vm.fileData[i][5],
          vm.fileData[i][6],
          vm.fileData[i][7],
          vm.fileData[i][8],
          vm.fileData[i][9]
        ])
        //if(failures>0) console.log("Failures: " + failures);
        if(failures>maxFailures) maxFailures = failures;
        failures = 0;
        expectedDate.add(15, 'minutes');
      }
      var dataFixingReport = {
        accept: (maxFailures < 8),
        maxFailures: maxFailures,
        missingDates: missingDates,
        originalNData: vm.fileData.length,
        fixedNData: purifiedData.length
      }
      console.log(dataFixingReport);
      vm.dataFixingReport = dataFixingReport;
      vm.fileData = purifiedData;
      console.log("Fin de revisión de datos faltantes");
      // END FIX MISSING DATA

      vm.fileDataDisplay = vm.fileData.slice(0,10);
      vm.isDataLoaded = true;
      vm.loadProgress = 100;
      vm.isLoadingFile = false;
      $scope.$apply();
      //console.log(vm.fileData);
    }
    r.readAsText(f);
  }

  vm.uploadData = () => {
    console.log("UPLOAD DATA");
    vm.isUploading = true;
    vm.clearMessages();
    vm.fileDataDisplay = [];
    vm.isDataLoaded = false;

    console.log(vm.fileData.length);
    Upload.upload({
      url: '/api/v1/uploadsensordata/' + vm.stationId,
      data: {
        file: 'nofile',
        data: vm.fileData
      }
    }).then(function (resp) {
      //console.log('Success ' + resp.config.data.file.name + 'uploaded. Response: ' + resp.data);
      console.log('Upload successful');
      console.log(resp.data.message);
      vm.fileDataDisplay = [];
      vm.fileData = [];
      vm.isDataLoaded = false;
      vm.isUploading = false;
      vm.uploadInfo = resp.data.message;
      vm.loadStationSummary();
    }, function (resp) {
      console.log('Error status: ' + resp.status);
      vm.isUploading = false;
      vm.uploadError = resp.data.message;
    }, function (evt) {
      var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
      vm.uploadProgress = progressPercentage;
      console.log('progress: ' + progressPercentage + '% ' + evt.config.data.file.name);
    });
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
  // ========= Código para seleccionar fechas =========
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

  // ==================================================
  // =========== Código para eliminar datos ===========
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
