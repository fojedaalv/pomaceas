angular.module('PomaceasWebApp')
.controller('dashboardNutritionalDataCtrl', dashboardNutritionalDataCtrl);

function dashboardNutritionalDataCtrl(stationsSvc, authSvc, usersSvc, nutritionalDataSvc, $scope, $filter){
  var vm = this;
  vm.stations = [];
  vm.sectors  = [];
  vm.nutritionalData = [];
  vm.errMessage = "";
  vm.originalData = [];
  vm.displayData  = [];
  vm.cultivars = [
    {value:'',            text:'Todos'},
    {value:'gala',        text:'Gala'},
    {value:'cripps_pink', text:'Cripps Pink'},
    {value:'fuji',        text:'Fuji'}
  ]
  vm.users = [
    {value:'',            text:'Todos'}
  ]
  vm.filter = {
    owner    : '',
    cultivar : ''
  }

  vm.init = () => {
    usersSvc.getUsersList()
    .success(function(data){
      data.data.forEach((item) => {
        vm.users.push({
          value : item._id,
          text  : item.name
        })
      })
    })
    .error(function(e){
      console.log(e);
    })
  }
  vm.init();

  $scope.$watchGroup(['vm.filter.cultivar', 'vm.filter.owner'], () => {
    vm.displayData = vm.originalData.filter(
      (item) => {
        let cultivarFilter = false;
        let ownerFilter    = false;
        if(vm.filter.cultivar != ''){
          cultivarFilter = (item.sector.cultivar == vm.filter.cultivar)
        }else{
          cultivarFilter = true;
        }

        if(vm.filter.owner != ''){
          ownerFilter = (item.owner._id == vm.filter.owner)
        }else{
          ownerFilter = true;
        }

        return cultivarFilter && ownerFilter
      }
    )
  })

  vm.loadBulk = () => {
    nutritionalDataSvc.getBulkData()
    .error((err) => {
      vm.errMessage = err.message;
      console.log(err);
    })
    .then((response) => {
      console.log(response);
      vm.originalData = response.data.data;
      vm.displayData  = response.data.data;
    })
  }

  vm.loadBulk();

  stageTranslate = (stage) => {
    if(stage=='small'){
      return 'Fruto 60 ddpf'
    }
    if(stage=='mature'){
      return 'Fruto a Cosecha'
    }
  }

  vm.getData = function(dataSet){
    var data = [];
    vm.displayData.forEach(
      (item) => {
        let d = {
          owner   : item.owner.name,
          station : item.station.name,
          sector  : item.sector.name,
          cultivar: $filter('cultivarTranslate')(item.sector.cultivar),
          date    : $filter('amDateFormat')(item.date, 'YYYY-MM-DD'),
          stage   : stageTranslate(item.stage),
          N       : item.N,
          P       : item.P,
          K       : item.K,
          Ca      : item.Ca,
          Mg      : item.Mg,
          Ms      : item.Ms,
          other   : item.other,
          NdivCa  : item.NdivCa,
          KdivCa  : item.KdivCa,
          MgdivCa : item.MgdivCa,
          NdivK   : item.NdivK,
          KdivP   : item.KdivP,
          PdivCa  : item.PdivCa,
          KMgdivCa: item.KMgdivCa,
          riskIndex : item.riskIndex,
          N_Frutos : item.N_Frutos,
          Peso_Total : item.Peso_Total,
          Peso_Promedio : (item.Peso_Total / item.N_Frutos)
        }
        data.push(d);
      }
    )
    return data;
  }
  vm.getFileHeaders = function(){
    return [
      'Dueño',
      'Estación',
      'Cuartel',
      'Variedad',
      'Fecha',
      'Momento de Medición',
      'N',
      'P',
      'K',
      'Ca',
      'Mg',
      'Ms',
      'Otros',
      'N/Ca',
      'K/Ca',
      'Mg/Ca',
      'N/K',
      'K/P',
      'P/Ca',
      '(K+Mg)/Ca',
      'Índice de Riesgo',
      'N° de Frutos',
      'Peso Total (g)',
      'Peso Promedio (g)'
    ];
  }
  vm.getFileName = function(){
    return 'Datos Nutricionales.csv';
  }
  vm.getFileSeparator = function(){
    return ",";
  }
}
