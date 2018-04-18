angular.module('PomaceasWebApp')
.controller('dashboardNutritionalAnalysisCtrl', dashboardNutritionalAnalysisCtrl);

function dashboardNutritionalAnalysisCtrl(stationsSvc, authSvc, nutritionalDataSvc, $scope){
  var vm = this;
  vm.stations = [];
  vm.sectors  = [];
  vm.nutritionalData = [];
  vm.errMessage = "";
  vm.fdata = {};

  // Variables para Paginación
  vm.totalItems  = 10;
  vm.currentPage = 1;
  vm.maxPages    = 5;
  vm.pageSize    = 10;
  vm.setPage     = (pageNo) => {
    vm.currentPage = pageNo;
  };
  vm.pageChanged = (pageNo) => {
    vm.loadData();
  }
  // FIN Variables para paginación

  vm.clearForm = () => {
    vm.fdata = {
      sector     : null,
      date       : new Date(),
      stage      : 'small',
      N          : 0,
      P          : 0,
      K          : 0,
      Ca         : 0,
      Mg         : 0,
      Ms         : 0,
      N_Frutos   : 0,
      Peso_Total : 0,
      other      : ""
    }
    if(vm.sectors.length>0){
      vm.fdata.sector = "0";
    }
  }

  vm.clearForm();

  vm.calendar = {
    format : 'dd-MM-yyyy',
    isOpen : false
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
  vm.openCal = function(){
    vm.calendar.isOpen = true;
  }

  vm.loadStations = function(){
    stationsSvc.getUserStations(authSvc.currentUser().id)
    .error(function(err){
      vm.errMessage = err.message;
    })
    .then(function(response){
      vm.stations = response.data;
      vm.stations.forEach((station) => {
        station.sectors.forEach((sector) => {
          let sec = {
            _id        : sector._id,
            name       : sector.name,
            cultivar   : sector.cultivar,
            station    : station.name,
            station_id : station._id
          }
          vm.sectors.push(sec);
        })
      })
      vm.clearForm();
    });
  }

  vm.loadStations();

  vm.saveData = () => {
    let sector = vm.sectors[vm.fdata.sector];
    let data = {
      sectorId  : sector._id,
      stationId : sector.station_id,
      date      : vm.fdata.date,
      stage     : vm.fdata.stage,
      N         : vm.fdata.N,
      P         : vm.fdata.P,
      K         : vm.fdata.K,
      Ca        : vm.fdata.Ca,
      Mg        : vm.fdata.Mg,
      Ms        : vm.fdata.Ms,
      N_Frutos  : vm.fdata.N_Frutos,
      Peso_Total: vm.fdata.Peso_Total,
      other     : vm.fdata.other
    }
    nutritionalDataSvc.uploadData(data)
    .error(function(err){
      vm.errMessage = err.message;
      console.log(err);
      alert("Ocurrió un error al guardar los datos. Revise que no hayan fechas repetidas y los datos estén correctos.");
    })
    .then(function(response){
      console.log(response);
      vm.loadData();
    })
    vm.clearForm();
  }

  let calculateNutritionalIndicators = (data) => {
    data.NdivCa   = data.N / data.Ca;
    data.KdivCa   = data.K / data.Ca;
    data.MgdivCa  = data.Mg / data.Ca;
    data.NdivK    = data.N / data.K;
    data.KdivP    = data.K / data.P;
    data.PdivCa   = data.P / data.Ca;
    data.KMgdivCa = (data.K + data.Mg) / data.Ca;
    // FALTAN LOS INDICADORES DE RIESGO
    if(data.stage=='small'){
      data.risk1 = (data.Ca < 15) ? 1 : 0;
      data.risk2 = (data.N  > 112) ? 1 : 0;
      data.risk3 = (data.K  > 195) ? 1 : 0;
      data.risk4 = (data.NdivCa > 7.5) ? 1 : 0;
      data.risk5 = (data.KdivCa > 19.5) ? 1 : 0;
    }
    if(data.stage=='mature'){
      data.risk1 = (data.Ca < 5.5)  ? 1 : 0;
      data.risk2 = (data.N  > 45)  ? 1 : 0;
      data.risk3 = (data.K  > 150) ? 1 : 0;
      data.risk4 = (data.NdivCa > 10) ? 1 : 0;
      data.risk5 = (data.KdivCa > 30) ? 1 : 0;
    }
    data.riskIndex = data.risk1 + data.risk2 + data.risk3 + data.risk4 + data.risk5;
    data.avgWeight = data.Peso_Total / data.N_Frutos;
    return data;
  }

  vm.loadData = () => {
    nutritionalDataSvc.getDataList(vm.currentPage-1, vm.pageSize)
    .error((err) => {
      vm.errMessage = err.message;
      console.log(err);
    })
    .then((response) => {
      vm.nutritionalData = response.data.data;
      // Añade el sector como una propiedad de cada objeto de datos
      // (la propiedad station tiene la lista de todos los sectores)
      vm.nutritionalData.forEach((item) => {
        let sectorID = item.sectorId;
        item.sector = item.station.sectors.filter((sector) => {
          return sector._id == sectorID
        })[0]
        item = calculateNutritionalIndicators(item);
      })

      vm.totalItems = response.data.meta['total-items'];
      vm.maxPages   = response.data.meta['total-pages'];
    })
  }

  vm.loadData();

  vm.removeData = (data) => {
    var conf = confirm("¿Deseas eliminar el registro?");
    if(conf){
      nutritionalDataSvc.removeData(data._id)
      .error((err) => {
        console.log(err);
      })
      .then((response) => {
        console.log(response);
        vm.loadData();
      })
    }
  }

  /*
    * Código para seleccionar indicadores nutricionales que visualizar
  */
  vm.selectedSector = 0;
  vm.displayedIndicators = [];
  vm.nutritionalIndicators = [];
  // Variables para Paginación
  vm.totalItems2  = 10;
  vm.currentPage2 = 1;
  vm.maxPages2    = 5;
  vm.pageSize2    = 10;
  vm.setPage2     = (pageNo) => {
    vm.currentPage2 = pageNo;
  };
  vm.pageChanged2 = (pageNo) => {
    vm.loadData2();
  }
  // FIN Variables para paginación
  vm.loadData2 = () => {
    if(vm.selectedSector !== 0){
      let sectorID = vm.sectors[vm.selectedSector]._id;
      nutritionalDataSvc.getDataListBySector(vm.currentPage-1, vm.pageSize, sectorID)
      .error((err) => {
        vm.errMessage = err.message;
        console.log(err);
      })
      .then((response) => {
        vm.nutritionalIndicators = response.data.data;
        // Añade el sector como una propiedad de cada objeto de datos
        // (la propiedad station tiene la lista de todos los sectores)
        vm.nutritionalIndicators.forEach((item) => {
          let sectorID = item.sectorId;
          item.sector = item.station.sectors.filter((sector) => {
            return sector._id == sectorID
          })[0]
          item = calculateNutritionalIndicators(item);
        })

        vm.totalItems2 = response.data.meta['total-items'];
        vm.maxPages2   = response.data.meta['total-pages'];
      })
    }
  }
  $scope.$watch('vm.selectedSector', () => {
    vm.displayedIndicators = [];
    vm.loadData2();
  })
}
