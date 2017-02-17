angular.module('PomaceasWebApp')
.controller('dashboardUserStationsMeasurementsCtrl', dashboardUserStationsMeasurementsCtrl);

function dashboardUserStationsMeasurementsCtrl(stationsSvc, $routeParams, $scope, sensorDataSvc){
  var vm = this;
  vm.station = {};
  vm.stationId = $routeParams.stationId;
  vm.errMessage = "";
  vm.stationSummary = {};
  vm.sensorData = [];
  vm.categories = [
    {name:"Temperatura", value:"temperature"},
    {name:"Humedad Relativa", value:"humidity"},
    {name:"Viento", value:"wind"},
    {name:"Precipitaciones", value:"rain"},
    {name:"Radiación", value:"rad"},
    {name:"Evapotranspiración", value:"evtrans"}
  ]
  vm.selection = {
    date: "",
    category: vm.categories[0].value
  }


  stationsSvc.getStation(vm.stationId)
  .success(function (data) {
    vm.station = data;
  })
  .error(function (e) {
    //vm.errMessage = e.message;
    vm.errMessage = "La estación solicitada no se pudo encontrar.";
  });

  sensorDataSvc.getStationSummary(vm.stationId)
  .success(function(data){
    vm.stationSummary = data;
    vm.selection.date = JSON.stringify(vm.stationSummary.datesAvailable[0]._id);
  })
  .error(function(e){
    vm.errMessage = "Ha ocurrido un error en la obtención de los datos de la estación.";
  })

  $scope.$watch('vm.selection.date', function(){
    if(vm.selection.date != ""){
      var jsonDate = JSON.parse(vm.selection.date);
      var date = jsonDate.year+"-"+jsonDate.month+"-"+jsonDate.day;
      console.log("Date:"+date);
      sensorDataSvc.getSensorDataByDate(vm.station._id, date)
      .success(function(data){
        vm.sensorData = data;
        data.forEach(function(row) {
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
    switch(vm.selection.category){
      case "temperature":
        console.log("Displaying temperature.");
        vm.options.series = [
          {
            axis: "y",
            dataset: "dataset0",
            key: "tempOut",
            label: "Temperatura promedio",
            color: "#c4ac2f",
            type: ['line', 'dot'],
            id: 'serieTempOut'
          },{
            axis: "y",
            dataset: "dataset0",
            key: "lowTemp",
            label: "Temperatura mínima",
            color: "#349be3",
            type: ['line', 'dot'],
            id: 'serieTempMin'
          },{
            axis: "y",
            dataset: "dataset0",
            key: "hiTemp",
            label: "Temperatura máxima",
            color: "#f14610",
            type: ['line', 'dot'],
            id: 'serieTempMax'
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
