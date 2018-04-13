angular.module('PomaceasWebApp')
.controller('dashboardUserStationsVariableSummaryCtrl', dashboardUserStationsVariableSummaryCtrl);

function dashboardUserStationsVariableSummaryCtrl(  usersSvc,
  authSvc,
  $routeParams,
  $location,
  APPLE_VARIABLES,
  summariesSvc,
  $scope,
  sensorDataSvc,
  stationsSvc,
  commentsSvc
){
  var vm = this;
  vm.errMessage = "";
  vm.formInfo ="";
  vm.variables = APPLE_VARIABLES;
  vm.stationId = $routeParams.stationId;
  vm.station = null;
  vm.summaries = [];

  stationsSvc.getStation(vm.stationId)
  .success(function (data) {
    vm.station = data;
  })
  .error(function(e){
    vm.errMessage = "Ha ocurrido un error en la obtención de los datos de la estación.";
  })

  vm.getSummariesList = () => {
    summariesSvc.getSummariesList()
    .success((data) => {
      vm.summaries = data;
      if(data.length>0){
        vm.selectedSummary = data[0]._id;
        vm.summary = {
          id: data[0]._id,
          name: data[0].name,
          variables: data[0].variables
        }
      }
    })
    .error((e) => {
      console.log("Ocurrió un error al obtener la lista de resúmenes. Error:"+ e);
    })
  }
  vm.getSummariesList();

  $scope.$watch('vm.stationId', () => {
    console.log(vm.stationId);
    if(vm.stationId != null){
      vm.getStationSummary();
    }
  })

  vm.getStationSummary = () => {
    sensorDataSvc.getStationSummary(vm.stationId)
    .success(function(data){
      vm.stationSummary = data;
      if(vm.stationSummary.datesAvailable.length==0){
        vm.hasData = false;
      }else{
        vm.hasData = true;
        var jsonDate = vm.stationSummary.datesAvailable[vm.stationSummary.datesAvailable.length-1]._id;
        vm.minDate = new Date(jsonDate.year, jsonDate.month-1, jsonDate.day);
        jsonDate = vm.stationSummary.datesAvailable[0]._id;
        vm.maxDate = new Date(jsonDate.year, jsonDate.month-1, jsonDate.day);
        console.log("La estación tiene datos entre las siguientes fechas:");
        console.log(vm.minDate);
        console.log(vm.maxDate);
        if(vm.summary){
          vm.processSummary();
        }
      }
    })
    .error(function(e){
      vm.errMessage = "Ha ocurrido un error en la obtención de los datos de la estación.";
    })
  }

  $scope.$watch('vm.selectedSummary', () => {
    if(vm.selectedSummary != null && vm.stationSummary != null){
      var tempSummary = vm.summaries.find((summ) => { return summ._id === vm.selectedSummary });
      vm.summary = {
        id: tempSummary._id,
        name: tempSummary.name,
        variables: tempSummary.variables
      }
      vm.processSummary();
    }
  })

  vm.processSummary = () => {
    var summary = vm.summary;
    console.log("Procesando el resumen: " + summary.name);

    // Variables para el contenido de las tablas
    var tableHeader = [
      'Factor Productivo',
      'Variable',
      'Período'
    ];
    var tableRows = [];

    // Se organizan en un arreglo todos los años con datos disponibles
    var years = [];
    for(var y of vm.stationSummary.yearsAvailable){ years.unshift(y._id.year) };


    var queriableDates = [];  // Fechas que son posibles de consultar entre los datos disponibles
    var variableIndex = 0;    // Índice de la variable seleccionada
    // Para cada una de las variables (filas de la tabla) obtiene las fechas a consultar
    for(var variable of summary.variables){
      // Se obtienen las fechas en texto para mostrar en la tabla
      var startDateString = new Date(2000, variable.startDate.month-1, variable.startDate.day, 12).toLocaleString("es-CL", {day: 'numeric', month: 'numeric'});
      var endDateString = new Date(2000, variable.endDate.month-1, variable.endDate.day, 12).toLocaleString("es-CL", {day: 'numeric', month: 'numeric'});
      var stringDates = startDateString + " - " + endDateString;

      // Se inician definen los tres elementos de la fila de la tabla
      var tableRow = [
        variable.factor,
        variable.variable,
        stringDates
      ]

      console.log(">Variable: " + variable.variable);

      //Se definen las fechas que es posible consultar dentro del rango de los datos
      queriableDates = [];
      for(y of years){
        console.log(">>Year: " + y);
        var candidateStart = new Date(y, variable.startDate.month-1, variable.startDate.day);
        if(candidateStart >= vm.minDate && candidateStart <= vm.maxDate){
          // La fecha mínima está en el rango consultable
          console.log(">>>Fecha inicial consultable:" + candidateStart);

          var candidateEnd = new Date(y, variable.endDate.month-1, variable.endDate.day);
          if(candidateEnd <= candidateStart) {
            candidateEnd = moment(candidateEnd).add(1, 'year').toDate();
          }
          console.log(">>>Fecha Candidata Final: " + candidateEnd);
          // Cuando una dos fechas pertenecen al mismo año, se asume que la variable corresponde al segundo año del periodo
          // Esta condición ignora la primera fecha para que no aparezca una columna adicional en la tabla de resultados
          if(candidateEnd.getFullYear() == vm.minDate.getFullYear() && candidateStart.getFullYear() == vm.minDate.getFullYear()){
            continue;
          }
          if(candidateEnd <= vm.maxDate){
            // La fecha final también sirve
            queriableDates.push({
              start:candidateStart,
              end: candidateEnd
            })
          }else{
            console.log(">>> LA FECHA FINAL NO SIRVE");
            break;
          }
        }else{
          // No hay fecha consultable este año
          console.log(">>>No hay fecha consultable este año");
        }
      }
      console.log("Fechas consultables para la variable: " + variable.variable);
      console.log(JSON.stringify(queriableDates, null, '\t'));

      // Ejecuta las consultas y añade los resultados a la celda correspondiente
      for (var index in queriableDates){

        /*
        tableRow.push("- ("+variableIndex+","+index+")");
        setTimeout((variableIndex, index) => {
          index= 3 + Number(index);
          vm.table.rows[variableIndex][index]=Math.random();
          $scope.$apply();
        }, 3000, variableIndex, index);
        */
        tableRow.push("---");
        sensorDataSvc.getVariable({
            station: vm.stationId,
            variable: variable.variable,
            startDate: moment(queriableDates[index].start).format('YYYY-MM-DD'),
            endDate: moment(queriableDates[index].end).format('YYYY-MM-DD'),
            operation: 'sum'
        })
        .success(((variableIndex, index) => {
          return (data) => {
            index= 3 + Number(index);
            vm.table.rows[variableIndex][index]=data.value;
          }
        })(variableIndex, index))
        .error((e) => {
          console.log(e);
        })
      }
      tableRows.push(tableRow);
      variableIndex += 1;
    }
    for(var dat of queriableDates){
      var d = dat.start.getFullYear().toString().substr(2,3) + '/' + dat.end.getFullYear().toString().substr(2,3);
      tableHeader.push(d);
    }
    console.log(tableHeader);
    vm.table = {
      header: tableHeader,
      rows: tableRows
    }
  }

  $scope.$watch('vm.summary', () => {
    if(vm.summary){
      vm.getComment();
    }
  })

  vm.comment = "";
  vm.getComment = () => {
    vm.comment = "";
    commentsSvc.getComment(vm.stationId, vm.summary.id)
    .success((data) => {
      //alert(JSON.stringify(data));

      vm.comment = data.comment.comment;
    })
    .error((e)=>{
      console.log(e);
    })
  }
}
