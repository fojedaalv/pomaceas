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
      Peso_Total : 0
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
      Peso_Total: vm.fdata.Peso_Total
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
}
