angular.module('PomaceasWebApp')
.controller('sandboxCtrl', sandboxCtrl);

function sandboxCtrl(){
  var vm = this;

  // ==============================================
  // ===========Código para las fechas=============
  // ==============================================
  vm.calFormat = 'yyyy-MM-dd';
  vm.dates = {
    caidaHojas: new Date(),
    pronosticoFrio: new Date(),
    finReceso: new Date(),
    puntasVerdes: new Date()
  };
  vm.datesEst = {
    caidaHojas: new Date(),
    pronosticoFrio: new Date(),
    finReceso: new Date(),
    puntasVerdes: new Date()
  }
  vm.dateOptions = {
    dateDisabled: null,
    formatYear: 'yy',
    datepickerMode: 'day',
    minMode:'day',
    maxMode:'day',
    initDate: null,
    maxDate: null,
    minDate: null,
    startingDay: 1
  };
  vm.calOpen = [
    false,
    false,
    false,
    false
  ]

  vm.openCal = function(calId){
    vm.calOpen[calId] = true;
  }

  vm.saveDates = function(){
    alert("Se guardan las fechas modificadas.");
  }

  // ==============================================
  // ========= Fin Código para las fechas==========
  // ==============================================

  // ==============================================
  // ======== Código para guardar como PDF ========
  // ==============================================


}
