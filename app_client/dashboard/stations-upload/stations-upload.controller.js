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
      if(lines[0].split("\t").length >= 10){
        fileType = 'original';
      }else if(lines[0].split(",").length == 10){
        fileType = 'procesado';
      }else{
        alert("No se ha podido analizar el archivo.");
        vm.isLoading = false;
        vm.isLoadingRepairFile = false;
        $scope.$apply();
        return null;
      }
    }

    // Se remueven los encabezados.
    // El archivo original tiene dos líneas y el procesado tiene una.
    let labels = [];
    if(fileType == 'original'){
      console.log('-----Debug archivo original-----');;
      labels = lines.slice(0, 2);
      lines  = lines.slice(2);
    }else if(fileType == 'procesado'){
      console.log('-----Debug archivo procesado-----');;
      labels = lines.slice(0, 1);
      lines  = lines.slice(1);
    }

    let indices = [];
    if(fileType == 'original'){
      for(var i=0; i<labels.length; i++){
        labels[i] = labels[i].replace('\r', '');
      }
      let top = labels[0].split('\t');
      let btm = labels[1].split('\t');
      let categories = [];
      for(var i=0; i<top.length; i++){
        categories[i] = (top[i] + ' ' + btm[i]).trim();
      }
      indices.push(categories.indexOf('Date'));
      indices.push(categories.indexOf('Time'));
      indices.push(categories.indexOf('Temp Out'));
      indices.push(categories.indexOf('Hi Temp'));
      indices.push(categories.indexOf('Low Temp'));
      indices.push(categories.indexOf('Out Hum'));
      indices.push(categories.indexOf('Wind Speed'));
      indices.push(categories.indexOf('Rain'));
      indices.push(categories.indexOf('Solar Rad.'));
      indices.push(categories.indexOf('ET'));
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
        if(lineData[0].split("-").length==1){
          tempDate = lineData[0].split("/");
        }
        if(tempDate[2].length==2){
          lineData[0] = tempDate[0]+"-"+tempDate[1]+"-20"+tempDate[2];
        }

        // Se construye el dato desde los campos correspondientes
        if(fileType == 'original'){
          for(var i=0; i<indices.length; i++){
            let d = lineData[indices[i]];
            // Corrige el formato de la fecha
            if(i==1){
              d = d.replace(":", "-");
            }
            datum.push(d);
          }
        }else if(fileType == 'procesado'){
          datum.push(lineData[0]);
          datum.push(lineData[1].replace(":", "-"));
          datum.push(lineData[2]);
          datum.push(lineData[3]);
          datum.push(lineData[4]);
          datum.push(lineData[5]);
          datum.push(lineData[6]);
          datum.push(lineData[7]);
          datum.push(lineData[8]);
          datum.push(lineData[9]);
        }

        fileData.push(datum);
      }else{
        continue;
      }
    }
    // Buscando y corrigiendo datos faltantes en columnas de entrada
    let gap_report = {
      'found': 0,
      'corrected': 0,
      'moreThan2Hours': 0,
      'ignore': 0,
      'dateJumps': 0,
      'gapDates': []
    };
    // Recorrer todos los datos de entrada por fila
    for(i=0; i < fileData.length; i++) {
      let gap_indexes = [], index = -1;
      // Busca datos faltantes en filas
      while ((index = fileData[i].indexOf('---', index+1)) != -1) {
        gap_report.found++;
        // Fecha de inicio en gaps
        var expectedDate = moment.utc(toIsoDate(fileData[i][0], fileData[i][1]));
        var aditionalGaps = 0;
        if(gap_report.gapDates.indexOf(expectedDate.toDate()) === -1) {
          console.log(expectedDate.toDate());
          gap_report.gapDates.push(expectedDate.toDate());
        }
        // Si encuentra datos faltantes recorrer la columna hasta encontrar datos nuevamente
        for(j=i+1; j < fileData.length; j++) {
          expectedDate.add(15, 'minutes');
          var tempDate = moment.utc(toIsoDate(fileData[j][0], fileData[j][1]));
          if (!tempDate.isSameOrBefore(expectedDate)) {
            gap_report.dateJumps++;
            aditionalGaps++;
          };
          // si ecuentra dato pasa a hacer las validaciones para parchar los faltantes
          if(fileData[j][index]!='---') {
            // promero se serciora que no falten más de 2 horas consecutivas de datos
            if ((j+aditionalGaps)-i < 8) {
              // se calcula el dato para parchar los faltantes
              let patchValue = 0;
              // checkear el caso que el gap se encuentre al inicio del archivo
              if (i-1<0) {
                patchValue = parseFloat(fileData[j][index]);
              } else {
                patchValue = (parseFloat(fileData[i-1][index])+parseFloat(fileData[j][index]))/2;
              }
              // se parcha todos los datos faltantes en la seccion de la columna encontrada
              for(k=i; k<j; k++) {
                fileData[k][index] = parseFloat(patchValue).toFixed(2);
                gap_report.corrected++;
              }
            } else {
              // si son más de dos horas se cambian los campos para que sean ignorados en el resto de la búsqueda
              // y se guarla la información para el reporte
              gap_report.moreThan2Hours++;
              for(k=i; k<j; k++) {
                fileData[k][index] = 'ignore';
                gap_report.ignore++;
              }
            }
            break;
          } else if(j+1==fileData.length) { // Checker el caso en que el gap de datos se encuentre al final del archivo
            // promero se serciora que no falten más de 2 horas consecutivas de datos
            if (j-i < 8) {
              // se parcha todos los datos faltantes en la seccion de la columna encontrada
              for(k=i; k<j; k++) {
                fileData[k][index] = fileData[i-1][index];
                gap_report.corrected++;
              }
            } else {
              // si son más de dos horas se cambian los campos para que sean ignorados en el resto de la búsqueda
              // y se guarla la información para el reporte
              gap_report.moreThan2Hours++;
              for(k=i; k<j; k++) {
                fileData[k][index] = 'ignore';
                gap_report.ignore++;
              }
            }
            if(gap_report.gapDates.indexOf(expectedDate.toDate()) === -1) {
              console.log('last?');
              gap_report.gapDates.push(expectedDate.toDate());
            }
          } else {
            gap_report.found++;
            if(gap_report.gapDates.indexOf(expectedDate.toDate()) === -1) {
              console.log('next?');
              gap_report.gapDates.push(expectedDate.toDate());
            }
          }
        }
      }
    }

    // Reseteando gaps ignorados
    for(i=0; i < fileData.length; i++) {
      let gap_indexes = [], index = -1;
      while ((index = fileData[i].indexOf('ignore', index+1)) === -1) {
        fileData[i][index] = '---';
      }
    }
    console.table(fileData);
    console.log(gap_report);
    return fileData;
  }

  // ==================================================
  // ========== Código para la Carga de Datos =========
  vm.isLoadingFile = false;

  vm.loadStations = function(){
    stationsSvc.getStationsList()
    .error(function(err){
      vm.errMessage = err.message;
    })
    .then(function(response){
      vm.stations = response.data.data;
      if(vm.stations.length>0){
        vm.stationId = vm.stations[0]._id;
      }
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

    r.onloadend = function(e){
      vm.fileData = parseData(e.target.result);
      if(vm.fileData.length==0){
        vm.isLoadingFile = false;
        $scope.$apply();
        return;
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
            '0.00', // No duplicar datos de lluvia.
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
      if(resp.data==null){
        vm.uploadError = "Ocurrió un error mientras se subía el archivo. Esto puede deberse a una mala conexión a internet. Prueba a cargar y subir el archivo desde una ubicación con mejor señal.";
      }else{
        vm.uploadError = resp.data.message;
      }
      vm.uploadProgress = 0;
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
