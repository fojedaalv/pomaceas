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
  vm.predictionsList = [];

  vm.isSectorEmpty = () => {
    return Object.keys(vm.selectedSector).length === 0;
  }

  vm.getData = () => {
    stationsSvc.getStation(vm.stationId)
    .success(function (data) {
      vm.station = data;
      if(data.sectors.length>0){
        vm.selectedSectorIndex = 0+"";
        vm.selectedSector = vm.station.sectors[0];
      }

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

  $scope.$watch('vm.selectedSectorIndex', () => {
    if(!angular.equals(vm.selectedSector, {})){
      vm.selectedSector = vm.station.sectors[vm.selectedSectorIndex];

      switch(vm.selectedSector.cultivar){
        case 'gala':{
          vm.predictionsList = [
            {value:"size", name:"Calibre"},
            {value:"harvestDate", name:"Maduración"},
            {value:"color", name:"Color"},
            {value:"skinAlterations", name:"Alteraciones de la Piel"}
          ]
          vm.predictionDisplayed = vm.predictionsList[0].value;
          break;
        }
        case 'fuji':{
          vm.predictionsList = []
          break;
        }
        case 'cripps_pink':{
          vm.predictionsList = []
          break;
        }
        default:
          vm.predictionsList = []
          break;
      }
    }
  })

  $scope.$watchGroup(['vm.selectedSector', 'vm.selectedYear'], (newValues, oldValues, scope) => {
    //alert(JSON.stringify(vm.selectedSector, null, '\t'));
    vm.predictions = {};
    if(!angular.equals(vm.selectedSector,{}) && vm.selectedYear != null && vm.stationSummary.lastReading){
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
      }else if(vm.selectedSector.cultivar == 'fuji'){
        predictionsSvc.getPredictionSunDamageFuji(vm.stationId, vm.selectedYear)
        .success(function(data){
          if(data.error){
            vm.predictions.sunFuji = 'no-data';
          }else{
            vm.predictions.sunFuji = {
              incidence  : data.incidence,
              riskDays   : data.riskDays
            }
          }
        })
        .error(function(e){
          vm.errMessage = e.error;
          console.log(e);
        })

        predictionsSvc.getPredictionRussetFuji(vm.stationId, vm.selectedYear)
        .success(function(data){
          if(data.error){
            vm.predictions.russetFuji = 'no-data';
          }else{
            vm.predictions.russetFuji = {
              incidence  : data.incidence,
              hours      : data.hours
            }
          }
        })
        .error(function(e){
          vm.errMessage = e.error;
          console.log(e);
        })

        predictionsSvc.getPredictionColorFujiPink(vm.stationId, vm.selectedYear)
        .success(function(data){
          vm.predictions.colorPotential = {
            potential : data.potential,
            days      : data.days
          }
        })
        .error(function(e){
          vm.errMessage = e.error;
          console.log(e);
        })
      }else if(vm.selectedSector.cultivar == 'cripps_pink'){
        predictionsSvc.getPredictionSunDamagePink(vm.stationId, vm.selectedYear)
        .success(function(data){
          if(data.error){
            vm.predictions.sunPink = 'no-data';
          }else{
            vm.predictions.sunPink = {
              incidence  : data.incidence,
              riskDays   : data.riskDays
            }
          }
        })
        .error(function(e){
          vm.errMessage = e.error;
          console.log(e);
        })

        predictionsSvc.getPredictionColorFujiPink(vm.stationId, vm.selectedYear)
        .success(function(data){
          vm.predictions.colorPotential = {
            potential : data.potential,
            days      : data.days
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
      if(data.error){
        vm.predictions.harvestDate = data.error;
      }else{
        vm.predictions.harvestDate = moment(vm.floweringDate).add(data.daysToStartHarvest, 'days').toDate();
      }
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
