angular.module('PomaceasWebApp')
.controller('dataRepairCtrl', dataRepairCtrl);

function dataRepairCtrl(
  $scope,
  moment
){
  var vm = this;
  vm.isLoading = false;

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

  vm.loadFile = () => {
    vm.isLoading = true;
    console.log("Loading file.");
    vm.loadProgress = 0;
    vm.fileData = [];

    toIsoDate = (date, time) => {
      var spl = date.split("-");
      if(time.split(":")[0].length==1) time = "0"+time;
      return spl[2] + "-" + spl[1] + "-" + spl[0] + " " + time;
    }

    var f = document.getElementById('file').files[0];

    var r = new FileReader();
    r.onprogress = function(e){
      vm.loadProgress = e.loaded/e.total*100;
    }

    r.onloadend = function(e){
      var lines = e.target.result.split("\n").slice(2);
      let fileData = [];
      for(var line = 0; line < lines.length; line++){
        var datum = [];
        var lineData = lines[line].split("\t");
        if(lineData.length!=33){
          continue;
        }else{
          datum = [];
          // Fix date length
          var tempDate = lineData[0].split("-");
          if(tempDate[2].length==2){
            lineData[0] = tempDate[0]+"-"+tempDate[1]+"-20"+tempDate[2];
          }

          // Se construye el dato desde los campos correspondientes
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

          // Cuando la estación recibe datos inválidos para un dato, en el archivo
          // aparece '---'. Se verifica si el dato leído tiene un campo inválido.
          if(datum.indexOf('---') > -1){

          }else{

          }

          vm.fileData.push(datum);
        }
        //if(vm.fileData.length % 1000 == 0) console.log(vm.fileData.length);
      }


      // ==================================================
      // Se cubren los días ausentes
      // ==================================================
      var completeData = [];
      // Se inicia la fecha esperada como la primera fecha
      var dateString = toIsoDate(vm.fileData[0][0], vm.fileData[0][1]);
      var expectedDate = moment.utc(dateString);

      var i = 0;
      for(var i = 0; i<vm.fileData.length; i++){
        var tempDate = moment.utc(toIsoDate(vm.fileData[i][0], vm.fileData[i][1]));
        while(!tempDate.isSame(expectedDate)){
          // La fecha siguiente no es la esperada (faltan fechas)
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
          //console.log([expectedDate.format('DD-MM-YY'), expectedDate.format('HH-mm')]);
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
      // ==================================================

      // Fuerza la actualización de la vista al tener los datos cargados
      vm.fileData   = completeData;
      vm.totalItems = vm.fileData.length;
      // Generar el primer conjunto de datos para mostrar
      // vm.displayData corresponde a los datos a mostrar en pantalla
      // (mostrar todos los datos es demasiado costoso computacionalmente)
      var top = Math.min(vm.pageSize, vm.totalItems);
      vm.displayData = vm.fileData.slice(0, top);

      // Se crea una lista con todos los campos con errores
      vm.updateErrors();
      console.log(vm.fieldsWithErrors);
      vm.isLoading = false;
      $scope.$apply();
    }

    r.readAsText(f);
  }

  // ===============================================
  // ======= Código para exportar en CSV ===========
  // ===============================================
  vm.getFileName = function(){
    return "Datos desde "+ moment(vm.startDate).format("YYYY-MM") +" hasta "+moment(vm.endDate).format("YYYY-MM")+".csv";
  }
  vm.getFileSeparator = function(){
    return ',';
  }
  vm.getFileHeaders = function(){
    return ['Fecha', 'Temp Media Diaria', 'Temp Media Máxima', 'Temp Media Mínima',
      'Temp Máxima', 'Temp Mínima', 'HR Media', 'HR Máxima', 'HR Mínima', 'h > 95%'];
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
