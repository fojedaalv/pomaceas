angular.module('PomaceasWebApp')
.controller('dashboardStationMeasurementsCtrl', dashboardStationMeasurementsCtrl);

function dashboardStationMeasurementsCtrl(stationsSvc, $routeParams, $scope, sensorDataSvc){
  var vm = this;
  vm.station = {};
  vm.stationId = "5898a308bca4ab0f6fb308eb";
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
  // Variables de Localización
  var es_CL_Locales = d3.locale({
    "decimal": ",",
    "thousands": ".",
    "grouping": [3],
    "currency": ["$", ""],
    "dateTime": "%a %b %e %X %Y",
    "date": "%m/%d/%Y",
    "time": "%H:%M:%S",
    "periods": ["AM", "PM"],
    "days": ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"],
    "shortDays": ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sab"],
    "months": ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"],
    "shortMonths": ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"]
  });
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

    // Configura fechas para el selector del calendario
    var jsonDate = vm.stationSummary.datesAvailable[0]._id;
    vm.monthSelection = new Date(jsonDate.year, jsonDate.month-1, jsonDate.day);
    vm.maxDate = new Date(jsonDate.year, jsonDate.month-1, jsonDate.day);

    jsonDate = vm.stationSummary.datesAvailable[vm.stationSummary.datesAvailable.length-1]._id;
    vm.minDate = new Date(jsonDate.year, jsonDate.month-1, jsonDate.day);

    vm.dateOptionsMonth.maxDate = vm.maxDate;
    vm.dateOptionsMonth.minDate = vm.minDate;
  })
  .error(function(e){
    vm.errMessage = "Ha ocurrido un error en la obtención de los datos de la estación.";
  })

  // ========== Date selection code ==========
  vm.monthCalendar = {
    format: 'MMMM yyyy',
    isOpen: false
  }
  vm.dateOptionsMonth = {
    formatYear: 'yy',
    datepickerMode: 'month',
    minMode:'month',
    maxMode:'month',
    initDate: null,
    maxDate: null,
    minDate: null,
    startingDay: 1
  };
  vm.openCal1 = function(){
    vm.monthCalendar.isOpen = true;
  }
  vm.dayCalendar = {
    format: 'dd-MMMM-yyyy',
    isOpen: false
  }
  vm.openCal2 = function(){
    vm.dayCalendar.isOpen = true;
  }
  vm.dateOptionsDay = {
    formatYear: 'yy',
    datepickerMode: 'day',
    minMode:'day',
    maxMode:'day',
    initDate: null,
    maxDate: null,
    minDate: null,
    startingDay: 1
  };
  // ========== End of Date selection code ==========
  $scope.$watch('vm.monthSelection', function(){
    // Loads data according to selected date
    if(vm.monthSelection != "" && vm.station._id != null){
      var date = moment(vm.monthSelection).format('YYYY-MM');
      sensorDataSvc.getSensorDataDailyAvgByMonth(vm.station._id, date)
      .success(function(data){
        vm.sensorData = data;
        data.forEach(function(row) {
          row.date = new Date(row._id.year, row._id.month-1, row._id.day, 0, 0);
        });
        vm.data.dataset0 = data;
      })
      .error(function(e){
        vm.errMessage = "Ha ocurrido un error en la obtención de los datos del sensor. Detalles del error: "+e.message;
      })
    }

    // Updates configuration of lower calendar
    vm.dayInMonthSelection = new Date(moment(vm.monthSelection));
    vm.dateOptionsDay.minDate = new Date(moment(vm.monthSelection));
    vm.dateOptionsDay.maxDate = new Date(
      moment(vm.monthSelection).year(),
      moment(vm.monthSelection).month(),
      moment(vm.monthSelection).daysInMonth()
    );
  })

  $scope.$watch('vm.dayInMonthSelection', function(){
    if(vm.dayInMonthSelection != "" && vm.station._id != null){
      var date = moment(vm.dayInMonthSelection).format('YYYY-MM-DD');
      sensorDataSvc.getSensorDataByDate(vm.station._id, date)
      .success(function(data){
        vm.sensorData = data;
        data.forEach(function(row) {
          var mDate = moment.utc(row.date);
          row.date = new Date(mDate.year(), mDate.month(), mDate.date(), mDate.hour(), mDate.minutes());
        });
        vm.data.dataset1 = data;
      })
      .error(function(e){
        vm.errMessage = "Ha ocurrido un error en la obtención de los datos del sensor. Detalles del error: "+e.message;
      })
    }
  });

  $scope.$watch('vm.selection.category', function(){
    switch(vm.selection.category){
      case "temperature":
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
        break;
      case "humidity":
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
        break;
      case "wind":
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
        break;
      case "rain":
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
        break;
      case "rad":
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
        break;
      case "evtrans":
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
        break;
      default:
        console.log("Error en la selección de categoría");
    }

    // Lower plot
    switch(vm.selection.category){
      case "temperature":
        vm.options2.series = [
          {
            axis: "y",
            dataset: "dataset1",
            key: "tempOut",
            label: "Temperatura promedio",
            color: "#c4ac2f",
            type: ['line', 'dot'],
            id: 'serieTempOut'
          },{
            axis: "y",
            dataset: "dataset1",
            key: "lowTemp",
            label: "Temperatura mínima",
            color: "#349be3",
            type: ['line', 'dot'],
            id: 'serieTempMin'
          },{
            axis: "y",
            dataset: "dataset1",
            key: "hiTemp",
            label: "Temperatura máxima",
            color: "#f14610",
            type: ['line', 'dot'],
            id: 'serieTempMax'
          }
        ];
        break;
      case "humidity":
        vm.options2.series = [
          {
            axis: "y",
            dataset: "dataset1",
            key: "outHum",
            label: "Humedad Relativa",
            color: "#c4ac2f",
            type: ['line', 'dot'],
            id: 'serieHR'
          }
        ];
        break;
      case "wind":
        vm.options2.series = [
          {
            axis: "y",
            dataset: "dataset1",
            key: "windSpeed",
            label: "Velocidad del Viento",
            color: "#c4ac2f",
            type: ['line', 'dot'],
            id: 'serieWindSpeed'
          }
        ];
        break;
      case "rain":
        vm.options2.series = [
          {
            axis: "y",
            dataset: "dataset1",
            key: "rain",
            label: "Precipitaciones",
            color: "#c4ac2f",
            type: ['line', 'dot'],
            id: 'serieRain'
          }
        ];
        break;
      case "rad":
        vm.options2.series = [
          {
            axis: "y",
            dataset: "dataset1",
            key: "solarRad",
            label: "Radiación",
            color: "#c4ac2f",
            type: ['line', 'dot'],
            id: 'serieSolarRad'
          }
        ];
        break;
      case "evtrans":
        vm.options2.series = [
          {
            axis: "y",
            dataset: "dataset1",
            key: "et",
            label: "Evapotranspiración",
            color: "#c4ac2f",
            type: ['line', 'dot'],
            id: 'serieET'
          }
        ];
        break;
      default:
        console.log("Error en la selección de categoría");
    }
  })

  vm.data = {
    dataset0: [],
    dataset1: []
  };

  vm.options = {
    series: [],
    axes: {
      x: {
        key: "date",
        type: "date",
        tickFormat: es_CL_Locales.timeFormat('%b-%d')
      }
    }
  };

  vm.options2 = {
    series: [],
    axes: {
      x: {
        key: "date",
        type: "date",
        tickFormat: es_CL_Locales.timeFormat('%H:%M')
      }
    }
  };

  // File Download

  vm.getDataInArray = function(dataSet){
    var data = [];
    switch(dataSet){
      case 'avgSensorDataByMonth':
        for(var i=0;i<vm.data.dataset0.length;i++){
          var row = vm.data.dataset0[i];
          data.push({
            date: moment(row.date).format('YYYY-MM-DD'),
            tempOut: row.tempOut.toLocaleString('es-CL'),
            lowTemp: row.lowTemp.toLocaleString('es-CL'),
            hiTemp: row.hiTemp.toLocaleString('es-CL'),
            outHum: row.outHum.toLocaleString('es-CL'),
            windSpeed: row.windSpeed.toLocaleString('es-CL'),
            rain: row.rain.toLocaleString('es-CL'),
            solarRad: row.solarRad.toLocaleString('es-CL'),
            et: row.et.toLocaleString('es-CL')
          });
        }
        break;
      case 'sensorDataByDay':
        for(var i=0;i<vm.data.dataset1.length;i++){
          var row = vm.data.dataset1[i];
          data.push({
            date: moment(row.date).format('YYYY-MM-DD HH:mm'),
            tempOut: row.tempOut.toLocaleString('es-CL'),
            lowTemp: row.lowTemp.toLocaleString('es-CL'),
            hiTemp: row.hiTemp.toLocaleString('es-CL'),
            outHum: row.outHum.toLocaleString('es-CL'),
            windSpeed: row.windSpeed.toLocaleString('es-CL'),
            rain: row.rain.toLocaleString('es-CL'),
            solarRad: row.solarRad.toLocaleString('es-CL'),
            et: row.et.toLocaleString('es-CL')
          });
        }
        break;
      default:
        return [];
    }
    return data;
  }
  vm.getFileHeaders = function(){
    return [
      'Fecha',
      'T° Promedio',
      'T° Mínima',
      'T° Máxima',
      'Humedad Relativa',
      'Velocidad del Viento',
      'Lluvia',
      'Radiación',
      'Evapotranspiración'
    ];
  }
  vm.getFileName = function(dataSet){
    switch(dataSet){
      case 'sensorDataByDay':
        return 'Mediciones por día.csv';
      case 'avgSensorDataByMonth':
        return 'Promedios diarios por mes.csv';
      default:
        return '';
    }
  }
  vm.getFileSeparator = function(){
    return ",";
  }

  /*
  vm.saveChart = function(){
    // Taken from https://svgopen.org/2010/papers/62-From_SVG_to_Canvas_and_Back/index.html
    var svgElement = document.getElementById('chart01').childNodes[0];
    svg_xml = (new XMLSerializer()).serializeToString(svgElement);
    var img = new Image();
    img.src = "data:image/svg+xml;base64," + btoa(svg_xml);
    //window.open(img.src);
    //location.href = "data:image/png;base64"+btoa(svg_xml);
  }*/
}
