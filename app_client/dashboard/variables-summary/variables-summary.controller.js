angular.module('PomaceasWebApp')
.controller('variablesSummaryCtrl', variablesSummaryCtrl);

function variablesSummaryCtrl(usersSvc, authSvc, $routeParams, $location, APPLE_VARIABLES, summariesSvc){
  var vm = this;
  vm.errMessage = "";
  vm.formInfo ="";
  vm.variables = APPLE_VARIABLES;

  // NEW CODE
  vm.summary = {
    name : '',
    variables : []
  }

  vm.removeRow = (row) => {
    var confDialog = "¿Desea eliminar la variable?";
    var conf = confirm(confDialog);
    if(conf){
      var index = vm.summary.variables.indexOf(row);
      vm.summary.variables.splice(index, 1);
    }
  }

  vm.moveUp = (index) => {
    let temp = vm.summary.variables[index-1];
    vm.summary.variables[index-1] = vm.summary.variables[index];
    vm.summary.variables[index] = temp;
  }

  vm.moveDown = (index) => {
    let temp = vm.summary.variables[index+1];
    vm.summary.variables[index+1] = vm.summary.variables[index];
    vm.summary.variables[index] = temp;
  }

  vm.addNewRow = () => {
    let row = {
      factor: '',
      variable: APPLE_VARIABLES[0].value,
      startDate: new Date(),
      endDate: new Date()
    }
    if(vm.summary.variables.length>0){
      row.startDate = vm.summary.variables[vm.summary.variables.length-1].startDate;
      row.endDate   = vm.summary.variables[vm.summary.variables.length-1].endDate;
    }
    vm.summary.variables.push(row);
  }

  vm.saveSummary = () => {
    vm.errMessage = "";
    if(vm.summary.name==''){
      vm.errMessage = 'No se puede dejar el nombre del resumen en blanco.';
      return;
    }
    let summary = {
      name      : vm.summary.name,
      variables : JSON.parse(JSON.stringify(vm.summary.variables))
    }
    for(var i=0; i<summary.variables.length; i++){
      if(vm.summary.variables[i].factor==''){
        vm.errMessage = 'No se puede dejar el factor productivo en blanco.';
        return;
      }
      summary.variables[i] = {
        factor    : vm.summary.variables[i].factor,
        variable  : vm.summary.variables[i].variable,
        startDate : {
          month   : vm.summary.variables[i].startDate.getMonth()+1,
          day     : vm.summary.variables[i].startDate.getDate()
        },
        endDate   : {
          month   : vm.summary.variables[i].endDate.getMonth()+1,
          day     : vm.summary.variables[i].endDate.getDate()
        }
      }
    }

    summariesSvc.createSummary(summary)
    .success(function(summary){
      alert('Resumen creado exitosamente.');
      vm.getSummariesList();
      vm.summary = {
        name : '',
        variables : []
      }
    })
    .error(function (e) {
      vm.errMessage = "El resumen no pudo ser creado. Detalles del error: "+e.message;
    });
  }

  // Code for summaries list
  vm.summaries = [];
  vm.getSummariesList = () => {
    summariesSvc.getSummariesList()
    .success((data) => {
      vm.summaries = data;
    })
    .error((e) => {
      console.log("Ocurrió un error al obtener la lista de resúmenes. Error:"+ e);
    })
  }
  vm.getSummariesList();

  vm.removeSummary = (summary) => {
    var confDialog = "¿Desea eliminar el resumen?";
    var conf = confirm(confDialog);
    if(conf){
      summariesSvc.deleteSummary(summary._id)
      .success(() => {
        vm.getSummariesList();
      })
      .error((e) => {
        console.log("Ocurrió un error al eliminar el resumen. Error:"+ e);
      })
    }
  }

  // Code for date selection
  vm.calendarFormat = 'dd/MMM';
  vm.dateOptions = {
    formatYear: 'yy',
    datepickerMode: 'day',
    formatDayTitle: 'MMMM',
    minMode:'day',
    maxMode:'day',
    initDate: null,
    maxDate: null,
    minDate: null,
    startingDay: 1
  };
  vm.openCal1 = function(row){
    row.isCalendar1Open = true;
  }
  vm.openCal2 = function(row){
    row.isCalendar2Open = true;
  }
}
