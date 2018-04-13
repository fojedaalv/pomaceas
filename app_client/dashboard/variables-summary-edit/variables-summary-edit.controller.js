angular.module('PomaceasWebApp')
.controller('variablesSummaryEditCtrl', variablesSummaryEditCtrl);

function variablesSummaryEditCtrl($routeParams, $location, summariesSvc, APPLE_VARIABLES){
  var vm = this;
  vm.variables = APPLE_VARIABLES;
  vm.errMessage = "";
  vm.formInfo ="";
  vm.summary = null;

  vm.loadData = () => {
    let summaryId = $routeParams.summaryId;
    summariesSvc.getSummary(summaryId)
    .success((data) => {
      vm.summary = data;
      for(var i=0; i<vm.summary.variables.length; i++){
        let startDateVar =new Date(
          2000,
          vm.summary.variables[i].startDate.month-1,
          vm.summary.variables[i].startDate.day
        )
        let endDateVar =new Date(
          2000,
          vm.summary.variables[i].endDate.month-1,
          vm.summary.variables[i].endDate.day
        )
        vm.summary.variables[i].startDate = startDateVar;
        vm.summary.variables[i].endDate = endDateVar;
        vm.summary.variables[i].isCalendar1Open = false;
        vm.summary.variables[i].isCalendar2Open = false;
      }
    })
    .error((error) => {

    })
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
    vm.summary.variables.push({
      factor: '',
      variable: APPLE_VARIABLES[0].value,
      startDate: new Date(),
      endDate: new Date()
    });
  }

  vm.saveChanges = () => {
    vm.errMessage = "";
    let summary = {
      _id       : vm.summary._id,
      name      : vm.summary.name,
      variables : JSON.parse(JSON.stringify(vm.summary.variables))
    }
    for(var i=0; i<summary.variables.length; i++){
      if(vm.summary.variables[i].factor==''){
        alert('No se puede dejar el factor productivo en blanco.');
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
    summariesSvc.updateSummary(summary)
    .success((data) => {
      $location.path('dashboard/variables-summary');
    })
    .error((error) => {
      vm.errMessage = "Ocurrió un error en la actualización del resumen de variables.";
    });
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

  vm.loadData();
}
