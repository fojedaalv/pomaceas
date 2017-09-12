angular.module('PomaceasWebApp')
.controller('variablesSummaryCtrl', variablesSummaryCtrl);

function variablesSummaryCtrl(usersSvc, authSvc, $routeParams, $location, APPLE_VARIABLES, summariesSvc){
  var vm = this;
  vm.errMessage = "";
  vm.formInfo ="";
  vm.variables = APPLE_VARIABLES;
  vm.newVariable = {
    factor: "",
    variable: vm.variables[0].value,
    startDate: moment().subtract(3, 'months').toDate(),
    endDate: moment().subtract(1, 'month').toDate()
  }
  vm.newSummary = {
    name: "",
    variables: []
  }
  vm.addToNewSummary = () => {
    if(vm.newVariable.factor == ""){
      alert("No se puede dejar vacío el Factor Productivo.");
      return;
    }
    vm.newSummary.variables.push({
      factor: vm.newVariable.factor,
      variable: vm.newVariable.variable,
      startDate: {
        month: vm.newVariable.startDate.getMonth(),
        day: vm.newVariable.startDate.getDate()
      },
      endDate: {
        month: vm.newVariable.endDate.getMonth(),
        day: vm.newVariable.endDate.getDate()
      }
    });

    vm.newVariable = {
      factor: vm.newVariable.factor,
      variable: vm.variables[0].value,
      startDate: vm.newVariable.startDate,
      endDate: vm.newVariable.endDate
    }
  }

  vm.removeVariable = function(variable){
    var confDialog = "¿Desea eliminar la variable?";
    var conf = confirm(confDialog);
    if(conf){
      var index = vm.newSummary.variables.indexOf(variable);
      vm.newSummary.variables.splice(index, 1);
    }
  }

  vm.saveNewSummary = () => {
    if(vm.newSummary.name==""){
      alert("No puede quedar el nombre en blanco.")
    }else if(vm.newSummary.variables.length==0){
      alert("Debe haber al menos una variable para crear el cuadro.");
    }else{
      for(index in vm.newSummary.variables){
        vm.newSummary.variables[index].startDate.month +=1;
        vm.newSummary.variables[index].endDate.month   +=1;
      }
      summariesSvc.createSummary({
        name: vm.newSummary.name,
        variables: vm.newSummary.variables
      })
      .success(function(summary){
        vm.newSummary = {
          name: "",
          variables: []
        }
        alert('Resumen creado exitosamente.')
        vm.getSummariesList();
      })
      .error(function (e) {
        vm.errMessage = "El resumen no pudo ser creado. Detalles del error: "+e.message;
      });
    }
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
  vm.startCalendar = {
    format: 'dd/MMM',
    isOpen: false
  }
  vm.endCalendar = {
    format: 'dd/MMM',
    isOpen: false
  }
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
  vm.openCal1 = function(){
    vm.startCalendar.isOpen = true;
  }
  vm.openCal2 = function(){
    vm.endCalendar.isOpen = true;
  }
}
