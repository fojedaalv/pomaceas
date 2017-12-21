angular.module('PomaceasWebApp')
.controller('dashboardUserStationsViewCtrl', dashboardUserStationsViewCtrl);

function dashboardUserStationsViewCtrl(
    stationsSvc,
    $routeParams,
    $scope,
    sensorDataSvc,
    Upload,
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
      name: "Cuartel Nuevo",
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

  toIsoDate = (date, time) => {
    var spl = date.split("-");
    time = time.replace("-", ":");   // En caso de que la fecha venga de un archivo procesado.
    if(time.split(":")[0].length==1){
      time = "0"+time;
    }
    return spl[2] + "-" + spl[1] + "-" + spl[0] + " " + time;
  }

  // ==================================================
  // Función para la extracción de los datos desde
  // un archivo leído
  // ==================================================
  parseData = (data) => {
    // Esta función procesa un archivo leído y genera un arreglo
    // con los datos que utiliza el sistema
    let fileData = [];
    let fileType = null;
    var lines = data.split("\n");

    // Se descubre el tipo de archivo:
    // original:
    //   Es el archivo tal como viene desde la estación. Un archivo
    //   separado por tabulaciones y de 33 columnas.
    // procesado:
    //   Es el archivo que ya ha pasado por este sistema y ha sido
    //   reducido a 10 columnas y separado por comas.
    if(lines.length==0){
      return [];
    }else{
      if(lines[0].split("\t").length == 33){
        fileType = 'original';
      }else if(lines[0].split(",").length == 10){
        fileType = 'procesado';
      }else{
        alert("No se ha podido analizar el archivo.");
        return [];
      }
    }

    // Se remueven los encabezados.
    // El archivo original tiene dos líneas y el procesado tiene una.
    if(fileType == 'original'){
      lines = lines.slice(2);
    }else if(fileType == 'procesado'){
      lines = lines.slice(1);
    }

    // Se lee cada línea y se extraen los campos relevantes
    for(var line = 0; line < lines.length; line++){
      var datum = [];
      let lineData = "";
      if(fileType == 'original'){
        lineData = lines[line].split("\t");
      }else if(fileType == 'procesado'){
        lineData = lines[line].split(",");
      }

      // En ocasiones, los archivos incluyen una última línea vacía.
      // Se elimina esta línea.
      if(lineData == ""){
        continue;
      }

      if(fileType == 'original' || fileType == 'procesado'){
        datum = [];
        let tempDate = lineData[0].split("-");
        if(tempDate[2].length==2){
          lineData[0] = tempDate[0]+"-"+tempDate[1]+"-20"+tempDate[2];
        }

        // Se construye el dato desde los campos correspondientes
        datum.push(lineData[0]);
        datum.push(lineData[1].replace(":", "-"));
        datum.push(lineData[2]);
        datum.push(lineData[3]);
        datum.push(lineData[4]);
        datum.push(lineData[5]);
        if(fileType == 'original'){
          datum.push(lineData[7]);
          datum.push(lineData[17]);
          datum.push(lineData[19]);
          datum.push(lineData[28]);
        }else if(fileType == 'procesado'){
          datum.push(lineData[6]);
          datum.push(lineData[7]);
          datum.push(lineData[8]);
          datum.push(lineData[9]);
        }

        // Cuando la estación recibe datos inválidos para un dato, en el archivo
        // aparece '---'. Se verifica si el dato leído tiene un campo inválido.
        if(datum.indexOf('---') > -1){

        }else{

        }

        fileData.push(datum);
      }else{
        continue;
      }
    }

    return fileData;
  }

  // ==================================================
  // ========= Código para Leer Archivo CSV ===========

  vm.fileData = [];
  vm.fileDataDisplay = [];
  vm.isDataLoaded = false;
  vm.loadProgress = 0;
  vm.uploadProgress = 0;
  vm.isLoadingFile   = false;
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

    r.onloadend = function(e){
      vm.fileData = parseData(e.target.result);

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
      console.log(data);
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
