angular.module('PomaceasWebApp')
.controller('dashboardUserStationsMonthlyCtrl', dashboardUserStationsMonthlyCtrl);

function dashboardUserStationsMonthlyCtrl(stationsSvc, $routeParams, $scope, sensorDataSvc){
  var vm = this;
  vm.station = {};
  vm.stationId = $routeParams.stationId;
  vm.errMessage = "";
  vm.stationSummary = {};
  vm.sensorData = [];
  vm.categories = [
    {name:"Temperatura", value:"temperature"},
    {name:"Humedad Relativa", value:"humidity"},
    {name:"Grados Día", value:"gd"},
    {name:"Días de Frío", value:"cold"},
    {name:"Heladas / Bajo 0°", value:"freeze"},
    {name:"Horas a diferentes T° umbral", value:"tempThres"},
    {name:"Cosas que me dan paja", value:"paja"}
  ]
  vm.selection = {
    startdate: "",
    enddate: "",
    category: vm.categories[0].value
  }

  stationsSvc.getStation(vm.stationId)
  .success(function (data) {
    vm.station = data;
  })
  .error(function (e) {
    vm.errMessage = "La estación solicitada no se pudo encontrar.";
  });

  sensorDataSvc.getStationSummary(vm.stationId)
  .success(function(data){
    vm.stationSummary = data;
    vm.selection.startdate = JSON.stringify(vm.stationSummary.monthsAvailable[vm.stationSummary.monthsAvailable.length-1]._id);
    vm.selection.enddate = JSON.stringify(vm.stationSummary.monthsAvailable[0]._id);
  })
  .error(function(e){
    vm.errMessage = "Ha ocurrido un error en la obtención de los datos de la estación.";
  })

  $scope.$watchGroup(['vm.selection.startdate', 'vm.selection.enddate'], function(){
    if(vm.selection.startdate != "" && vm.selection.enddate != ""){
      var jsonDate = JSON.parse(vm.selection.startdate);
      jsonDate.day = 1;
      var startdate = jsonDate.year+"-"+jsonDate.month+"-"+jsonDate.day;
      jsonDate = JSON.parse(vm.selection.enddate);
      jsonDate.day = 1;
      enddate = jsonDate.year+"-"+jsonDate.month+"-"+jsonDate.day;
      sensorDataSvc.getReportByMonth(vm.station._id, startdate, enddate)
      .success(function(data){
        vm.sensorData = data;
        console.log(data);
        data.forEach(function(row) {
          // TODO: Arreglar cuando se implemente Moment.js
          // Parche cuma para ajustar la zona horaria
          row.date = row.date.replace('Z','-03:00');
          row.date = new Date(row.date);
        });
        vm.data.dataset0 = data;
        console.log(data);
      })
      .error(function(e){
        vm.errMessage = "Ha ocurrido un error en la obtención de los datos del sensor. Detalles del error: "+e.message;
      })
    }
  })

  $scope.$watch('vm.selection.category', function(){
    console.log("Category selected: "+vm.selection.category)
    switch(vm.selection.category){
      case "temperature":
        console.log("Displaying temperature.");
        vm.options.series = [
          {
            axis: "y",
            dataset: "dataset0",
            key: "tempMediaDiaria",
            label: "T° promedio diaria",
            color: "#c4ac2f",
            type: ['line', 'dot'],
            id: 'serieTempOut'
          },{
            axis: "y",
            dataset: "dataset0",
            key: "tempMediaMin",
            label: "T° mínima promedio",
            color: "#349be3",
            type: ['line', 'dot'],
            id: 'serieTempMin'
          },{
            axis: "y",
            dataset: "dataset0",
            key: "tempMediaMax",
            label: "T° máxima promedio",
            color: "#f14610",
            type: ['line', 'dot'],
            id: 'serieTempMax'
          },{
            axis: "y",
            dataset: "dataset0",
            key: "tempMaxMax",
            label: "T° máxima",
            color: "#9c2500",
            type: ['line', 'dot'],
            id: 'serieTempMaxMax'
          },{
            axis: "y",
            dataset: "dataset0",
            key: "tempMinMin",
            label: "T° mínima",
            color: "#146dab",
            type: ['line', 'dot'],
            id: 'serieTempMinMin'
          }
        ];
        return;
      case "humidity":
        console.log("Displaying relative humidity.");
        vm.options.series = [
          {
            axis: "y",
            dataset: "dataset0",
            key: "outHum",
            label: "Humedad Relativa",
            color: "#c4ac2f",
            type: ['line', 'dot'],
            id: 'serieHR'
          }
        ];
        return;
      case "wind":
        console.log("Displaying wind.");
        vm.options.series = [
          {
            axis: "y",
            dataset: "dataset0",
            key: "windSpeed",
            label: "Velocidad del Viento",
            color: "#c4ac2f",
            type: ['line', 'dot'],
            id: 'serieWindSpeed'
          }
        ];
        return;
      case "rain":
        console.log("Displaying rain.");
        vm.options.series = [
          {
            axis: "y",
            dataset: "dataset0",
            key: "rain",
            label: "Precipitaciones",
            color: "#c4ac2f",
            type: ['line', 'dot'],
            id: 'serieRain'
          }
        ];
        return;
      case "rad":
        console.log("Displaying radiation.");
        vm.options.series = [
          {
            axis: "y",
            dataset: "dataset0",
            key: "solarRad",
            label: "Radiación",
            color: "#c4ac2f",
            type: ['line', 'dot'],
            id: 'serieSolarRad'
          }
        ];
        return;
      case "evtrans":
        console.log("Displaying evapotranspiration.");
        vm.options.series = [
          {
            axis: "y",
            dataset: "dataset0",
            key: "et",
            label: "Evapotranspiración",
            color: "#c4ac2f",
            type: ['line', 'dot'],
            id: 'serieET'
          }
        ];
        return;
      default:
        console.log("Error en la selección de categoría");
    }
  })

  vm.data = {
    dataset0: []
  };

  vm.options = {
    series: [],
    axes: {x: {key: "date", type: "date"}}
  };
}
