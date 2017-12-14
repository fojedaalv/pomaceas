angular.module('PomaceasWebApp')
.controller('dataRepairCtrl', dataRepairCtrl);

function dataRepairCtrl(
  $scope,
  moment
){
  var vm = this;
  vm.isLoading = false;
  vm.isLoadingRepairFile = false;

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
  // Función para la extracción de los datos desde
  // un archivo leído
  // ==================================================

  // Lista de variables disponibles para insertar en los datos originales en
  // desde un archivo extra.
  vm.repairCandidates = [];

  // Código para la paginación
  vm.totalItems  = 1;
  vm.pageSize    = 100;
  vm.currentPage = 1;
  vm.pageChanged = () => {
    console.log("Page changed to: " + vm.currentPage);
    var top = Math.min(vm.pageSize*(vm.currentPage), vm.totalItems);
    vm.displayData = vm.fileData.slice((vm.currentPage-1)*vm.pageSize, top);
  }
  vm.setPage = (pageN) => {
    console.log(pageN);
    vm.currentPage = pageN;
    vm.pageChanged();
  }
  // FIN del código para la paginación

  // Lista de campos con errores
  vm.fieldsWithErrors = [];

  vm.updateErrors = () => {
    vm.fieldsWithErrors = [];
    for(var line = 0; line < vm.fileData.length; line++){
      if(vm.fileData[line].indexOf('---') > -1){
        vm.fieldsWithErrors.push(line);
      }
    }
  }

  toIsoDate = (date, time) => {
    var spl = date.split("-");
    time = time.replace("-", ":");   // En caso de que la fecha venga de un archivo procesado.
    if(time.split(":")[0].length==1){
      time = "0"+time;
    }
    return spl[2] + "-" + spl[1] + "-" + spl[0] + " " + time;
  }

  vm.loadFile = () => {
    var f = document.getElementById('file').files[0];
    if(f==undefined){
      alert("No se ha seleccionado un archivo de datos.");
      return;
    }

    vm.isLoading = true;
    console.log("Loading file.");
    vm.loadProgress = 0;
    vm.fileData = [];

    var r = new FileReader();
    r.onprogress = function(e){
      vm.loadProgress = e.loaded/e.total*100;
    }

    r.onloadend = function(e){
      vm.fileData = parseData(e.target.result);

      // ==================================================
      // Se cubren los días ausentes
      // ==================================================
      var completeData = [];
      // Se inicia la fecha esperada como la primera fecha
      var dateString = toIsoDate(vm.fileData[0][0], vm.fileData[0][1]);
      var expectedDate = moment.utc(dateString);

      var i = 0;
      for(var i = 0; i<vm.fileData.length; i++){
        let tempDate = moment.utc(toIsoDate(vm.fileData[i][0], vm.fileData[i][1]));
        while(!tempDate.isSameOrBefore(expectedDate)){
          // La fecha siguiente no es la esperada (faltan fechas)
          //console.log("Temporal / Esperada");
          //console.log(tempDate);
          //console.log(expectedDate);
          completeData.push([
            expectedDate.format('DD-MM-YY'),
            expectedDate.format('HH-mm'),
            '---',
            '---',
            '---',
            '---',
            '---',
            '---',
            '---',
            '---'
          ])
          expectedDate.add(15, 'minutes');
        }
        // Se salta fechas que no sean múltiplo de 15
        if(tempDate.get('minute') % 15 != 0){
          continue;
        }

        // La fecha siguiente es la esperada
        completeData.push([
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
        expectedDate.add(15, 'minutes');
      }
      // ==================================================
      // FIN: Se cubren los días ausentes
      // =================================================
      vm.fileData   = completeData;
      vm.totalItems = vm.fileData.length;
      // Generar el primer conjunto de datos para mostrar
      // vm.displayData corresponde a los datos a mostrar en pantalla
      // (mostrar todos los datos es demasiado costoso computacionalmente)
      var top = Math.min(vm.pageSize, vm.totalItems);
      vm.displayData = vm.fileData.slice(0, top);

      // Se crea una lista con todos los campos con errores
      vm.updateErrors();
      console.log("Lista de filas con errores:");
      console.log(vm.fieldsWithErrors);
      vm.isLoading = false;
      // Fuerza la actualización de la vista al tener los datos cargados
      $scope.$apply();
    }

    r.readAsText(f);
  }

  // ===============================================
  // ==== Código para archivo de reparación ========
  // ===============================================
  vm.loadRepairFile = () => {
    var f = document.getElementById('repairfile').files[0];
    if(f==undefined){
      alert("No se ha seleccionado un archivo de reparación.");
      return;
    }
    console.log("Loading repair file.");
    vm.repairLoadProgress = 0;
    vm.repairFileData   = [];
    vm.repairCandidates = [];
    vm.isLoadingRepairFile = true;

    var r = new FileReader();
    r.onprogress = function(e){
      vm.repairLoadProgress = e.loaded/e.total*100;
    }

    r.onloadend = function(e){
      let fileData = parseData(e.target.result);

      // la función parseData entrega las fechas en formato DD-MM-YYYY para usarlas
      // en moment.js. En vm.fileData se guardan en formato DD-MM-YY, así que deben
      // ajustarse eliminando los dos primeros caracteres del año.
      for(var i = 0; i < fileData.length; i++){
        var tempDate = fileData[i][0].split("-");
        if(tempDate[2].length==4){
          fileData[i][0] = tempDate[0]+"-"+tempDate[1]+"-"+tempDate[2].substr(2,3);
        }
      }

      for(var index=0;index<vm.fieldsWithErrors.length;index++){
        let rowIndex = vm.fieldsWithErrors[index];
        //console.log(vm.fileData[rowIndex]);
        // Buscar la fecha en los datos disponibles para reparación
        console.log("Searching for row to repair: " + vm.fileData[rowIndex][0] + ", " + vm.fileData[rowIndex][1])
        for(var i=0; i<fileData.length; i++){
          if(fileData[i][0]==vm.fileData[rowIndex][0] && fileData[i][1]==vm.fileData[rowIndex][1]){
            //console.log("Row Found");
            //console.log(fileData[i]);
            // Verificar si los datos son válidos
            // Añadir a una lista con el índice de la fila y el dato disponible
            vm.repairCandidates.push([rowIndex, fileData[i]])
            break;
          }
        }
      }
      console.log("Candidatos para reparación:");
      console.log(vm.repairCandidates);
      vm.isLoadingRepairFile = false;
      $scope.$apply();
    }

    r.readAsText(f);
  }

  vm.applyCorrectionsFromFile = () => {
    for(var i = 0; i < vm.repairCandidates.length; i++){
      //vm.fileData[rowIndex] = fileData[i];
      var candidate = vm.repairCandidates[i];
      vm.fileData[candidate[0]] = candidate[1];
    }
    vm.repairCandidates = [];
    vm.updateErrors();
    // Requerido en caso de que se esté mostrando una página con errores
    // para que se recarguen en la vista.
    vm.pageChanged();
  }

  // ===============================================
  // ======= Código para exportar en CSV ===========
  // ===============================================
  vm.getFileName = function(){
    return "Datos Corregidos.csv";
  }
  vm.getFileSeparator = function(){
    return ',';
  }
  vm.getFileHeaders = function(){
    return ['Fecha', 'Hora', 'Temp Out', 'Hi Temp', 'Low Temp', 'Out Hum',
      'Wind Speed', 'Rain', 'Solar Rad', 'ET'];
  }
  vm.getDataInArray = function(){
    //return [{a:1, b:2},{a:3, b:4}];
    var data = [];
    for(var i=0;i<vm.fileData.length;i++){
      var row = vm.fileData[i];
      data.push(row)
    }
    return data;
  }
}
