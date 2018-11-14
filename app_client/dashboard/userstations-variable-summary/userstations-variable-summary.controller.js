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
