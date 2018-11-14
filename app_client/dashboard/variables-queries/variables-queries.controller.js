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
    vm.completedQueries = 0;
    console.log("Procesando el resumen: " + summary.name);

    // Se organizan en un arreglo todos los años con datos disponibles
    var years = [];
    for(var y of vm.stationSummary.yearsAvailable){ years.unshift(y._id.year) };
    // console.log('Años disponibles:', years);
    let firstDate = vm.stationSummary.datesAvailable[vm.stationSummary.datesAvailable.length-1]._id;
    let lastDate  = vm.stationSummary.datesAvailable[0]._id;
    // console.log('Primera Fecha Disponible:', firstDate);
    // console.log('Última Fecha Disponible:', lastDate);
    let minYear  = firstDate.year-1;
    let maxYear = lastDate.year+1;
    // console.log('Rango de años:', minYear, maxYear);
    // Calcular los periodos usando minYear y maxYear
    let periods = [];
    let i = minYear;
    while(i<maxYear){
      periods.push({
        from : i,
        to   : i+1
      });
      i++;
    }
    let measurements = new Array(summary.variables.length);
    for(let i=0; i<summary.variables.length; i++){
      measurements[i] = new Array(periods.length);
    }
    vm.summaryData = {
      values  : [],
      periods : periods,
      stats   : []
    };
    vm.completedQueries = 0;
    vm.summaryData.values = measurements;
    let completedCallback = () => {
      // Esta función verifica que se terminaron de realizar todos los cálculos
      // (aunque hayan terminado por error)
      if(vm.completedQueries == summary.variables.length * periods.length){
        // Por cada periodo, verificar todos los valores y eliminar columnas sin resultados
        periods.forEach((item, index) => {
          let isOk = true;
          for(let i=0; i < vm.summaryData.values.length; i++){
            let t = vm.summaryData.values[i][index];
            if(t == null || t == undefined){
              isOk = false;
            }
          }
          if(!isOk){
            // Elimina el periodo y los valores de cada fila
            periods.splice(index, 1);
            for(let i=0; i < vm.summaryData.values.length; i++){
              vm.summaryData.values[i].splice(index, 1);
            }
          }
        })

        // Acá calcular los promedios y variaciones
        for(let i=0; i < vm.summaryData.values.length; i++){
          let sum = 0;
          let values = vm.summaryData.values[i];
          values.forEach( item => sum += item );
          let avg = Math.round(sum / values.length);
          let lastYear = values[values.length-1];
          let variation = -Math.round((avg - lastYear) / avg * 100);
          vm.summaryData.stats.push({
            average   : avg,
            variation : variation
          })
        }
      }
    }
    for(let i=0; i<measurements.length; i++){
      for(let j=0; j<measurements[i].length; j++){
        let vari = summary.variables[i];
        let peri = periods[j];

        let startDate = '';
        let endDate = '';
        // Construir fecha inicial de consulta (los periodos comienzan en mayo)
        if(vari.startDate.month >= 5 && vari.startDate.month <=12){
          startDate = moment(new Date(peri.from, vari.startDate.month-1, vari.startDate.day)).format('YYYY-MM-DD');
        }else{
          startDate = moment(new Date(peri.to, vari.startDate.month-1, vari.startDate.day)).format('YYYY-MM-DD');
        }
        // Construir fecha final de consulta (los periodos comienzan en mayo)
        if(vari.endDate.month >= 5 && vari.endDate.month <=12){
          endDate = moment(new Date(peri.from, vari.endDate.month-1, vari.endDate.day)).format('YYYY-MM-DD');
        }else{
          endDate = moment(new Date(peri.to, vari.endDate.month-1, vari.endDate.day)).format('YYYY-MM-DD');
        }
        //console.log(measurements[i][j], vari, peri, startDate, endDate);
        sensorDataSvc.getVariable({
          station: vm.stationId,
          variable: summary.variables[i].variable,
          startDate: startDate,
          endDate: endDate,
          operation: 'sum'
        })
        .success(((i, j) => {
          return (data) => {
            vm.completedQueries+=1;
            vm.summaryData.values[i][j] = data.value;
            completedCallback();
          }
        })(i, j))
        .error((e) => {
          vm.completedQueries+=1;
          completedCallback();
          console.log('Variable nula:')
          console.log(e);
        })
      }
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
