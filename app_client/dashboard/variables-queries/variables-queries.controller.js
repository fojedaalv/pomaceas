angular.module('PomaceasWebApp')
.controller('variablesQueriesCtrl', variablesQueriesCtrl);

function variablesQueriesCtrl(
    usersSvc,
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
  vm.stationId = null;
  vm.summaries = [];

  vm.stations = [];

  vm.loadStations = function(){
    stationsSvc.getStationsList()
    .error(function(err){
      vm.errMessage = err.message;
    })
    .then(function(response){
      vm.stations = response.data.data;
      if(vm.stations.length>0){
        // En caso de que no hayan estaciones,
        // no es necesario seleccionar una estación inicial
        vm.stationId = vm.stations[0]._id;
      }
    });
  }

  vm.loadStations();

  vm.getSummariesList = () => {
    summariesSvc.getSummariesList()
    .success((data) => {
      vm.summaries = data;
      if(vm.summaries.length>0){
        // En caso de que no hayan resúmenes,
        // no es necesario seleccionar un resumen inicial
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
      vm.summary = vm.summaries.find((summ) => { return summ._id === vm.selectedSummary });
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

    // PARCHE para que no desaparezcan los encabezados si el último registro no tiene datos.
    // El arreglo más largo de fechas consultables, para generar los encabezados
    let longestQueriableDates = [];

    var variableIndex = 0;    // Índice de la variable seleccionada
    // Para cada una de las variables (filas de la tabla) obtiene las fechas a consultar
    for(var variable of summary.variables){
      // Se obtienen las fechas en texto para mostrar en la tabla
      var startDateString = new Date(2000, variable.startDate.month-1, variable.startDate.day, 12).toLocaleString("es-CL", {day: 'numeric', month: 'numeric'}); // Para nombre usar short
      var endDateString = new Date(2000, variable.endDate.month-1, variable.endDate.day, 12).toLocaleString("es-CL", {day: 'numeric', month: 'numeric'});
      var stringDates = startDateString + " - " + endDateString;

      // Se definen los tres elementos de la fila de la tabla
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
            //continue;
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

      // PARCHE para que no desaparezcan los encabezados si el último registro no tiene datos.
      if(queriableDates.length>longestQueriableDates.length) longestQueriableDates = queriableDates;

      // Ejecuta las consultas y añade los resultados a la celda correspondiente
      for (var index in queriableDates){
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
            index = 3 + Number(index);
            vm.table.rows[variableIndex][index] = data.value;

            // Verifica si los valores ya se terminaron de cargar
            // Si se cargaron, calcular el promedio
            let values = vm.table.rows[variableIndex].slice(3);
            let complete = (values.indexOf("---") == -1) && (values.length > 0);
            if(complete){
              let sum = 0;
              values.forEach( item => sum += item );
              let avg = Math.round(sum / values.length);
              vm.table.rows[variableIndex].push(avg);

              // Calcular la variación porcentual entre el promedio y el último año
              let position = vm.table.rows[variableIndex].length-2;
              let lastYear = vm.table.rows[variableIndex][position];
              let variation = Math.round((avg - lastYear) / avg * 100);
              vm.table.rows[variableIndex].push(variation);
            }
          }
        })(variableIndex, index))
        .error((e) => {
          console.log(e);
        })
      }
      tableRows.push(tableRow);
      variableIndex += 1;
    }

    // Se calcula el encabezado de la tabla usando la última fila de variable
    for(var dat of longestQueriableDates){
      let startYear = dat.start.getFullYear();
      let endYear   = dat.end.getFullYear();
      let mayFirst  = new Date(startYear, 4, 1, 0, 0, 0);
      if(startYear == endYear){
        if(dat.start >= mayFirst){
          // La fecha es después de Mayo : Periodo YY / YY + 1
          let headerString = startYear.toString().substr(2) + '/' +
                             (endYear + 1).toString().substr(2)
          tableHeader.push(headerString);
        }else{
          // La fecha es antes de Mayo : Periodo YY - 1 / YY
          let headerString = (startYear - 1).toString().substr(2) + '/' +
                             endYear.toString().substr(2)
          tableHeader.push(headerString);
        }
      }else{
        var d = dat.start.getFullYear().toString().substr(2,3) + '/' + dat.end.getFullYear().toString().substr(2,3);
        tableHeader.push(d);
      }
    }
    if(longestQueriableDates.length > 0) {
      tableHeader.push('Promedio');
      tableHeader.push('Variación');
    }
    console.log(tableHeader);
    vm.table = {
      header: tableHeader,
      rows: tableRows
    }
  }


  vm.comment = "";
  vm.commentId = null;
  vm.hasComment = false;
  $scope.$watchGroup(['vm.selectedSummary', 'vm.stationId'], () => {
    if(vm.selectedSummary && vm.stationId){
      vm.getCommentData();
    }
  })

  vm.getCommentData = () => {
    commentsSvc.getComment(vm.stationId, vm.selectedSummary)
    .success((data) => {
      if(data.comment){
        console.log(data);
        vm.comment = data.comment.comment;
        vm.commentId = data.comment._id;
        vm.hasComment = true;
      }else{
        vm.comment = "";
        vm.commentId = null;
        vm.hasComment = false;
      }
    })
    .error((e) => {
      console.log(e);
    })
  }

  vm.saveComment = () => {
    if(vm.comment==""){
      alert("No se puede guardar un comentario vacío.");
    }else{
      //DO SAVE
      var commentData = {
        comment: vm.comment,
        stationId: vm.stationId,
        summaryId: vm.selectedSummary
      }
      commentsSvc.createComment(commentData)
      .success((data) => {
        vm.getCommentData();
      })
      .error((e) => {
        alert("Comentario creado.");
        console.log(e);
      })
    }
  }

  vm.deleteComment = () => {
    var conf = confirm("¿Deseas eliminar el comentario técnico?");
    if(conf){
      commentsSvc.deleteComment(vm.commentId)
      .success((data) => {
        alert("Comentario eliminado exitosamente.");
        vm.getCommentData();
      })
      .error((e) => {
        alert("Ocurrió un error al eliminar el comentario.");
        console.log(e);
      })
    }
  }

  vm.updateComment = () => {
    commentsSvc.updateComment(vm.commentId, vm.comment)
    .success((data) => {
      alert("Comentario actualizado exitosamente.");
      vm.getCommentData();
    })
    .error((e) => {
      alert("Ocurrió un error al actualizar el comentario.");
      console.log(e);
    })
  }
}
