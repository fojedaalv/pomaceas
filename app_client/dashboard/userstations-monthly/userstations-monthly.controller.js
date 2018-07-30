angular.module('PomaceasWebApp')
.controller('dashboardUserStationsMonthlyCtrl', dashboardUserStationsMonthlyCtrl);

function dashboardUserStationsMonthlyCtrl(stationsSvc, $routeParams, $scope, sensorDataSvc, moment, excelSvc){
  var vm = this;

  var chileanFormatters = d3.locale({ "decimal": ",", "thousands": ".", "grouping": [3], "currency": ["$", ""], "dateTime": "%a %b %e %X %Y", "date": "%d.%m.%Y", "time": "%H:%M:%S", "periods": ["AM", "PM"], "days": ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"], "shortDays": ["Do", "Lu", "Ma", "Mi", "Ju", "Vi", "Sa"], "months": ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"], "shortMonths": ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"] });

  vm.station = {};
  vm.stationId = $routeParams.stationId;
  vm.errMessage = "";
  vm.stationSummary = {};
  vm.sensorData = [];
  vm.categories = [
    {name:"Temperatura", value:"temperature"},
    {name:"Humedad Relativa", value:"humidity"},
    {name:"Estrés", value:"stress"},
    {name:"Grados Día", value:"gd"},
    {name:"Días de Frío", value:"cold"},
    {name:"Heladas / Bajo 0°", value:"freeze"},
    {name:"Horas a diferentes T° umbral", value:"tempThres"},
    {name:"Evapotranspiración", value:"et"},
    {name:"Largo del día", value:"daylength"},
    {name:"Horas >300 W/m2", value:"horasRad300"},
    {name:"Radiación máxima", value:"maxRad"},
    {name:"Energía solar", value:"energy"},
    {name:"Velocidad del Viento", value:"windSpeed"},
    {name:"Temperaturas Óptimas", value:"tOpt"},
    {name:"Vuelo de Abejas", value:"hrAbe"},
    {name:"Precipitaciones", value:"pp"},
    {name:"DPV", value:"dpv"},
    {name:"h > 2.5 DPV", value:"h2p5DPV"}
  ]
  vm.selection = {
    category: vm.categories[0].value
  }

  // ========== Date selection code ==========
  vm.startCalendar = {
    format: 'MMMM yyyy',
    isOpen: false
  }
  vm.endCalendar = {
    format: 'MMMM yyyy',
    isOpen: false
  }
  vm.dateOptions = {
    dateDisabled: disabled,
    formatYear: 'yy',
    datepickerMode: 'month',
    minMode:'month',
    maxMode:'month',
    initDate: null,
    maxDate: null,
    minDate: null,
    startingDay: 1
  };
  function disabled(data) {
    var date = data.date,
      mode = data.mode;
    return mode === 'day' && (date.getDay() === 0 || date.getDay() === 6);
  }
  vm.openCal1 = function(){
    vm.startCalendar.isOpen = true;
  }
  vm.openCal2 = function(){
    vm.endCalendar.isOpen = true;
  }
  // ========== End of Date selection code ==========

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
    if(vm.stationSummary.lastReading==null) return;
    var jsonDate = vm.stationSummary.monthsAvailable[vm.stationSummary.monthsAvailable.length-1]._id;
    vm.startDate = new Date(jsonDate.year, jsonDate.month-1);
    vm.minDate = new Date(jsonDate.year, jsonDate.month-1);
    jsonDate = vm.stationSummary.monthsAvailable[0]._id;
    vm.endDate = new Date(jsonDate.year, jsonDate.month-1);
    vm.maxDate = new Date(jsonDate.year, jsonDate.month-1);

    vm.dateOptions.initDate = vm.minDate;
    vm.dateOptions.maxDate = vm.maxDate;
    vm.dateOptions.minDate = vm.minDate;
  })
  .error(function(e){
    vm.errMessage = "Ha ocurrido un error en la obtención de los datos de la estación.";
  })

  $scope.$watchGroup(['vm.startDate', 'vm.endDate'], function(){
    if(vm.startDate != "" && vm.endDate != "" && vm.station._id != null){
      var start = moment(vm.startDate).format("YYYY-MM-DD");
      var end = moment(vm.endDate).format("YYYY-MM-DD");
      sensorDataSvc.getReportByMonth(vm.station._id, start, end)
      .success(function(data){
        console.log(data);
        data.forEach(function(row) {
          // TODO: Arreglar cuando se implemente Moment.js
          // Parche cuma para ajustar la zona horaria
          row.date = row.date.replace('Z','-04:00');
          row.date = new Date(row.date);
        });
        vm.data.dataset0 = data;
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
            key: "hrMedia",
            label: "Humedad Relativa Media",
            color: "#c4ac2f",
            type: ['line', 'dot'],
            id: 'serieHRMedia'
          },{
            axis: "y",
            dataset: "dataset0",
            key: "hrMaxima",
            label: "Humedad Relativa Máxima",
            color: "#c4ac2f",
            type: ['line', 'dot'],
            id: 'serieHRMaxima'
          },{
            axis: "y",
            dataset: "dataset0",
            key: "hrMinima",
            label: "Humedad Relativa Mínima",
            color: "#c4ac2f",
            type: ['line', 'dot'],
            id: 'serieHRMinima'
          }
        ];
        return;
      case "stress":
        console.log("Displaying Stress.");
        vm.options.series = [
          {
            axis: "y",
            dataset: "dataset0",
            key: "estres",
            label: "Estrés",
            color: "#c4ac2f",
            type: ['line', 'dot'],
            id: 'serieEstres'
          }
        ];
        return;
      case "gd":
        console.log("Displaying GD.");
        vm.options.series = [
          {
            axis: "y",
            dataset: "dataset0",
            key: "gdh",
            label: "GDH",
            color: "#c4ac2f",
            type: ['line', 'dot'],
            id: 'serieGDH'
          }
        ];
        return;
      case "cold":
        console.log("Displaying Cold.");
        vm.options.series = [
          {
            axis: "y",
            dataset: "dataset0",
            key: "mineq10",
            label: "< 10°C",
            color: "#c4ac2f",
            type: ['line', 'dot'],
            id: 'serieMinEq10'
          },{
            axis: "y",
            dataset: "dataset0",
            key: "min105hrs",
            label: "Días con 5 horas < 10°C",
            color: "#c4ac2f",
            type: ['line', 'dot'],
            id: 'seriemin105hrs'
          },{
            axis: "y",
            dataset: "dataset0",
            key: "mineq7",
            label: "< 7°C",
            color: "#c4ac2f",
            type: ['line', 'dot'],
            id: 'seriemineq7'
          }
        ];
        return;
      case "freeze":
        console.log("Displaying Freeze.");
        vm.options.series = [
          {
            axis: "y",
            dataset: "dataset0",
            key: "diasHel",
            label: "Días con heladas",
            color: "#c4ac2f",
            type: ['line', 'dot'],
            id: 'serieDiasHel'
          }
        ];
        return;
      case "tempThres":
        console.log("Displaying different Temperatures.");
        vm.options.series = [
          {
            axis: "y",
            dataset: "dataset0",
            key: "hrmay27c",
            label: "T > 27°C",
            color: "#c4ac2f",
            type: ['line', 'dot'],
            id: 'seriehrmay27c'
          },{
            axis: "y",
            dataset: "dataset0",
            key: "hrmay29c",
            label: "T > 29°C",
            color: "#c4ac2f",
            type: ['line', 'dot'],
            id: 'seriehrmay29c'
          },{
            axis: "y",
            dataset: "dataset0",
            key: "hrmay32c",
            label: "T > 32°C",
            color: "#c4ac2f",
            type: ['line', 'dot'],
            id: 'seriehrmay32c'
          },{
            axis: "y",
            dataset: "dataset0",
            key: "hrmen6c",
            label: "T < 6°C",
            color: "#c4ac2f",
            type: ['line', 'dot'],
            id: 'seriehrmen6c'
          },{
            axis: "y",
            dataset: "dataset0",
            key: "hrmen12c",
            label: "T < 12°C",
            color: "#c4ac2f",
            type: ['line', 'dot'],
            id: 'seriehrmen12c'
          },{
            axis: "y",
            dataset: "dataset0",
            key: "hrmen18c",
            label: "T < 18°C",
            color: "#c4ac2f",
            type: ['line', 'dot'],
            id: 'seriehrmen18c'
          },{
            axis: "y",
            dataset: "dataset0",
            key: "hrmay15c",
            label: "T > 15°C",
            color: "#c4ac2f",
            type: ['line', 'dot'],
            id: 'seriehrmay15c'
          }
        ];
        return;
      case "et":
        console.log("Displaying evapotranspiration.");
        vm.options.series = [
          {
            axis: "y",
            dataset: "dataset0",
            key: "et0",
            label: "Días con heladas",
            color: "#c4ac2f",
            type: ['line', 'dot'],
            id: 'serieEvapotrans'
          }
        ];
        return;
      case "daylength":
        console.log("Displaying day length.");
        vm.options.series = [
          {
            axis: "y",
            dataset: "dataset0",
            key: "horasRad12",
            label: "Largo del día",
            color: "#c4ac2f",
            type: ['line', 'dot'],
            id: 'serieDayLength'
          }
        ];
        return;
      case "horasRad300":
        console.log("Displaying hrs 300.");
        vm.options.series = [
          {
            axis: "y",
            dataset: "dataset0",
            key: "horasRad300",
            label: "Horas >300 W/m2",
            color: "#c4ac2f",
            type: ['line', 'dot'],
            id: 'serieRad300'
          }
        ];
        return;
      case "maxRad":
        console.log("Displaying max radiation.");
        vm.options.series = [
          {
            axis: "y",
            dataset: "dataset0",
            key: "maxRad",
            label: "Radiación máxima",
            color: "#c4ac2f",
            type: ['line', 'dot'],
            id: 'serieMaxRad'
          }
        ];
        return;
      case "energy":
        console.log("Displaying solar energy.");
        vm.options.series = [
          {
            axis: "y",
            dataset: "dataset0",
            key: "energia",
            label: "Energía solar (MJ/m2)",
            color: "#c4ac2f",
            type: ['line', 'dot'],
            id: 'serieEnergiaSolar'
          }
        ];
        return;
      case "windSpeed":
        console.log("Displaying wind speed.");
        vm.options.series = [
          {
            axis: "y",
            dataset: "dataset0",
            key: "vmaxViento",
            label: "Velocidad Máxima del Viento (m/s)",
            color: "#c4ac2f",
            type: ['line', 'dot'],
            id: 'serieVelocidadViento'
          }
        ];
        return;
      case "tOpt":
        console.log("Displaying optimal temperature.");
        vm.options.series = [
          {
            axis: "y",
            dataset: "dataset0",
            key: "hrTOpt",
            label: "Horas con T° Óptima",
            color: "#c4ac2f",
            type: ['line', 'dot'],
            id: 'serieTOpt'
          }
        ];
        return;
      case "hrAbe":
        vm.options.series = [
          {
            axis: "y",
            dataset: "dataset0",
            key: "hrAbe",
            label: "Horas de Abejas",
            color: "#c4ac2f",
            type: ['line', 'dot'],
            id: 'serieHrAbe'
          }
        ];
        return;
      case "pp":
        vm.options.series = [
          {
            axis: "y",
            dataset: "dataset0",
            key: "pp",
            label: "Precipitaciones",
            color: "#c4ac2f",
            type: ['line', 'dot'],
            id: 'seriePP'
          }
        ];
        return;
      case "dpv":
        vm.options.series = [
          {
            axis: "y",
            dataset: "dataset0",
            key: "dpv",
            label: "DPV kPa",
            color: "#c4ac2f",
            type: ['line', 'dot'],
            id: 'serieDPV'
          }
        ];
        return;
      case "h2p5DPV":
        vm.options.series = [
          {
            axis: "y",
            dataset: "dataset0",
            key: "hrsDPVmay2p5",
            label: "h DPV > 2.5",
            color: "#c4ac2f",
            type: ['line', 'dot'],
            id: 'serieDPV25'
          }
        ];
        return;
      case "other":
        console.log("Displaying other categories.");
        vm.options.series = [

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
    axes: {
      x: {
        key: "date",
        type: "date",
        tickFormat: chileanFormatters.timeFormat('%B')
      },
      y: {
        type: "linear",
        tickFormat: function(value, index) {
          return parseFloat(value).toFixed(2);
        }
      }
    },
  };


  // ===============================================
  // ======= Código para exportar en CSV ===========
  // ===============================================
  vm.getFileName = function(){
    return "Datos desde "+ moment(vm.startDate).format("YYYY-MM") +" hasta "+moment(vm.endDate).format("YYYY-MM")+".csv";
  }
  vm.getFileSeparator = function(){
    return ',';
  }
  vm.getFileHeaders = function(){
    return ['Fecha', 'Temp Media Diaria', 'Temp Media Máxima', 'Temp Media Mínima',
      'Temp Máxima', 'Temp Mínima', 'HR Media', 'HR Máxima', 'HR Mínima', 'h > 95%', 'Estrés',
      'Max y Mín', 'GDH', 'GD', '<10°C', '5h<10°C', '<7°C', 'Richardson', 'Unrath', 'Días con Heladas',
      'T < 0°C', 'T>27°C', 'T>29°C', 'T>32°C','5h>27°C','5h>29°C','5h>32°C','T < 6°C','T < 12°C','T < 18°C',
      'T > 15°C', 'ET0', 'Horas luz', 'Horas  >300 W/m2', 'Rad Max (W/m2)', 'Energía Solar (MJ/m2)',
      'Velocidad del Viento (m/s)', 'Hrs. Abejas', 'Precipitaciones', 'Hrs. con T° Óptima',
      'DPV kPa', 'h > 2.5 DPV'];
  }
  vm.getDataInArray = function(){
    //return [{a:1, b:2},{a:3, b:4}];
    var data = [];
    for(var i=0;i<vm.data.dataset0.length;i++){
      var row = vm.data.dataset0[i];
      data.push({
        date:            moment(row.date).format('YYYY-MM'),
        tempMediaDiaria: row.tempMediaDiaria ? row.tempMediaDiaria.toLocaleString('es-CL') : '---',
        tempMediaMaxi:   row.tempMediaMax ? row.tempMediaMax.toLocaleString('es-CL') : '---',
        tempMediaMin:    row.tempMediaMin ? row.tempMediaMin.toLocaleString('es-CL') : '---',
        tempMaxMax:      row.tempMaxMax ? row.tempMaxMax.toLocaleString('es-CL') : '---',
        tempMinMin:      row.tempMinMin ? row.tempMinMin.toLocaleString('es-CL') : '---',
        hrMedia:         row.hrMedia ? row.hrMedia.toLocaleString('es-CL') : '---',
        hrMaxima:        row.hrMaxima ? row.hrMaxima.toLocaleString('es-CL') : '---',
        hrMinima:        row.hrMinima ? row.hrMinima.toLocaleString('es-CL') : '---',
        horas95:         row.horas95 ? row.horas95.toLocaleString('es-CL') : '---',
        estres:          row.estres ? row.estres.toLocaleString('es-CL') : '---',
        gdMaxYMin:       row.gdMaxYMin ? row.gdMaxYMin.toLocaleString('es-CL') : '---',
        gdh:             row.gdh ? row.gdh.toLocaleString('es-CL') : '---',
        gd:              row.gd ? row.gd.toLocaleString('es-CL') : '---',
        mineq10:         row.mineq10 ? row.mineq10.toLocaleString('es-CL') : '---',
        min105hrs:       row.min105hrs ? row.min105hrs.toLocaleString('es-CL') : '---',
        mineq7:          row.mineq7 ? row.mineq7.toLocaleString('es-CL') : '---',
        richardson:      row.richardson ? row.richardson.toLocaleString('es-CL') : '---',
        unrath:          row.unrath ? row.unrath.toLocaleString('es-CL') : '---',
        diasHel:         row.diasHel ? row.diasHel.toLocaleString('es-CL') : '---',
        hrmen0c:         row.hrmen0c ? row.hrmen0c.toLocaleString('es-CL') : '---',
        hrmay27c:        row.hrmay27c ? row.hrmay27c.toLocaleString('es-CL') : '---',
        hrmay29c:        row.hrmay29c ? row.hrmay29c.toLocaleString('es-CL') : '---',
        hrmay32c:        row.hrmay32c ? row.hrmay32c.toLocaleString('es-CL') : '---',
        dias5hrsmay27:   row.dias5hrsmay27 ? row.dias5hrsmay27.toLocaleString('es-CL') : '---',
        dias5hrsmay29:   row.dias5hrsmay29 ? row.dias5hrsmay29.toLocaleString('es-CL') : '---',
        dias5hrsmay32:   row.dias5hrsmay32 ? row.dias5hrsmay32.toLocaleString('es-CL') : '---',
        hrmen6c:         row.hrmen6c ? row.hrmen6c.toLocaleString('es-CL') : '---',
        hrmen12c:        row.hrmen12c ? row.hrmen12c.toLocaleString('es-CL') : '---',
        hrmen18c:        row.hrmen18c ? row.hrmen18c.toLocaleString('es-CL') : '---',
        hrmay15c:        row.hrmay15c ? row.hrmay15c.toLocaleString('es-CL') : '---',
        et0:             row.et0 ? row.et0.toLocaleString('es-CL') : '---',
        horasRad12:      row.horasRad12 ? row.horasRad12.toLocaleString('es-CL') : '---',
        horasRad300:     row.horasRad300 ? row.horasRad300.toLocaleString('es-CL') : '---',
        maxRad:          row.maxRad ? row.maxRad.toLocaleString('es-CL') : '---',
        energia:         row.energia ? row.energia.toLocaleString('es-CL') : '---',
        vmaxViento:      row.vmaxViento ? row.vmaxViento.toLocaleString('es-CL') : '---',
        hrAbe:           row.hrAbe ? row.hrAbe.toLocaleString('es-CL') : '---',
        pp:              row.pp ? row.pp.toLocaleString('es-CL') : '---',
        hrTOpt:          row.hrTOpt ? row.hrTOpt.toLocaleString('es-CL') : '---',
        dpv:             row.dpv ? row.dpv.toLocaleString('es-CL') : '---',
        hrsDPVmay2p5:    row.hrsDPVmay2p5 ? row.hrsDPVmay2p5.toLocaleString('es-CL') : '---'
      })
    }
    return data;
  }

  vm.getExcelFile = () => {
    let headers = vm.getFileHeaders();
    let data    = [];
    vm.getDataInArray().forEach((item) => {
      let row = [
        item.date,
        item.tempMediaDiaria,
        item.tempMediaMaxi,
        item.tempMediaMin,
        item.tempMaxMax,
        item.tempMinMin,
        item.hrMedia,
        item.hrMaxima,
        item.hrMinima,
        item.horas95,
        item.estres,
        item.gdMaxYMin,
        item.gdh,
        item.gd,
        item.mineq10,
        item.min105hrs,
        item.mineq7,
        item.richardson,
        item.unrath,
        item.diasHel,
        item.hrmen0c,
        item.hrmay27c,
        item.hrmay29c,
        item.hrmay32c,
        item.dias5hrsmay27,
        item.dias5hrsmay29,
        item.dias5hrsmay32,
        item.hrmen6c,
        item.hrmen12c,
        item.hrmen18c,
        item.hrmay15c,
        item.et0,
        item.horasRad12,
        item.horasRad300,
        item.maxRad,
        item.energia,
        item.vmaxViento,
        item.hrAbe,
        item.pp,
        item.hrTOpt,
        item.dpv,
        item.hrsDPVmay2p5
      ]
      for(let i=0;i<row.length;i++){
        if(row[i]=='---') row[i] = '0.0';
      }
      data.push(row);
    })
    excelSvc.createExcelFile(
      "Datos mensuales desde "+ moment(vm.startDate).format("YYYY-MM") +" hasta "+moment(vm.endDate).format("YYYY-MM"),
      headers,
      data
    )
    .success(function(response, status, headers, config){
      console.log(response);
      let filePath = 'http://pomaceas.ferativ.com'+response.location;
      console.log(filePath)
      window.open(filePath, '_blank', '');
    })
    .error(function(e){

    })
  }
}
