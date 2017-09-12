angular.module('PomaceasWebApp')
.controller('dashboardUserStationsPredictionsCtrl', dashboardUserStationsPredictionsCtrl);

function dashboardUserStationsPredictionsCtrl(stationsSvc, $routeParams, $scope, sensorDataSvc, predictionsSvc){
  var vm = this;
  vm.station = {};
  vm.stationId = $routeParams.stationId;
  vm.errMessage = "";
  vm.stationSummary = {};
  vm.selectedSector = {};
  vm.predictions = {};
  vm.selectedYear = null;
  vm.yearsAvailable = [];

  vm.getData = () => {
    stationsSvc.getStation(vm.stationId)
    .success(function (data) {
      vm.station = data;
      vm.selectedSector = vm.station.sectors[0];

      sensorDataSvc.getStationSummary(vm.stationId)
      .success(function(data){
        vm.stationSummary = data;
        for (let y of vm.stationSummary.yearsAvailable) {
          vm.yearsAvailable.push(y._id.year+"");
        }
        vm.selectedYear = vm.yearsAvailable[vm.yearsAvailable.length-1]+"";
      })
      .error(function(e){
        vm.errMessage = "Ha ocurrido un error en la obtención de los datos de la estación.";
      })
    })
    .error(function (e) {
      //vm.errMessage = e.message;
      vm.errMessage = "La estación solicitada no se pudo encontrar.";
    });
  }

  $scope.$watchGroup(['vm.selectedSector', 'vm.selectedYear'], (newValues, oldValues, scope) => {
    //alert(JSON.stringify(vm.selectedSector, null, '\t'));
    vm.predictions = {};
    if(!angular.equals(vm.selectedSector,{}) && vm.selectedYear != null){
      console.log("Consultar Predicciones...");
      if(vm.selectedSector.cultivar == 'gala'){
        predictionsSvc.getPredictionColorGala(vm.stationId, vm.selectedYear)
        .success(function(data){
          vm.predictions.colorPotential = {
            potential : data.potential,
            hours     : data.hr10
          }
        })
        .error(function(e){
          vm.errMessage = e.error;
          console.log(e);
        })

        predictionsSvc.getPredictionSizeGala(vm.stationId, vm.selectedYear)
        .success(function(data){
          if(data.error){
            vm.predictions.size = 'no-data';
          }else{
            vm.predictions.size = {
              temp: data.temp,
              bigSizePercent: Number(data.bigSizePercent.toFixed(2)),
              avgWeight: Number(data.avgWeight.toFixed(2)),
              errorMargin: data.errorMargin,
              status: data.status
            }
          }
        })
        .error(function(e){
          vm.errMessage = e.error;
          console.log(e);
        })
      }
    }
  })

  vm.getHarvestDate = () => {
    var year = vm.floweringDate.getFullYear();
    var month = vm.floweringDate.getMonth()+1;
    var day = vm.floweringDate.getDate();
    predictionsSvc.getPredictionHarvestGala(vm.stationId, year, month, day)
    .success(function(data){
      console.log(data);
      vm.predictions.harvestDate = moment(vm.floweringDate).add(data.daysToStartHarvest, 'days').toDate();
    })
    .error(function(e){
      vm.errMessage = e.error;
      console.log(e);
    })
  }

  // Code for date selection
  vm.floweringDate = moment().subtract(1, 'year').toDate();
  vm.startCalendar = {
    format: 'dd MMMM yyyy',
    isOpen: false
  }
  vm.dateOptions = {
    formatYear: 'yy',
    datepickerMode: 'day',
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

  vm.getData();
}
