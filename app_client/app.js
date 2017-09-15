angular.module('PomaceasWebApp', [
  'ngRoute',
  'uiGmapgoogle-maps',
  'n3-line-chart',
  'angularMoment',
  'ngSanitize',
  'ngCsv',
  'ui.bootstrap',
  'ngFileUpload'
]);

function config($routeProvider, $logProvider){
  $logProvider.debugEnabled(false);
  $routeProvider
    .when('/', {
      templateUrl: 'home/home.view.html',
      controller: 'homeCtrl',
      controllerAs: 'vm'
    })
    .when('/login', {
      templateUrl: 'login/login.view.html',
      controller: 'loginCtrl',
      controllerAs: 'vm'
    })
    .when('/register', {
      templateUrl: 'register/register.view.html',
      controller: 'registerCtrl',
      controllerAs: 'vm'
    })
    .when('/dashboard', {
      templateUrl: 'dashboard/dashboard.view.html',
      controller: 'dashboardCtrl',
      controllerAs: 'vm'
    })
    .when('/dashboard/users', {
      templateUrl: 'dashboard/users/users.view.html',
      controller: 'dashboardUsersCtrl',
      controllerAs: 'vm'
    })
    .when('/dashboard/users/edit/:userId', {
      templateUrl: 'dashboard/users-edit/users-edit.view.html',
      controller: 'dashboardUsersEditCtrl',
      controllerAs: 'vm'
    })
    .when('/dashboard/stations', {
      templateUrl: 'dashboard/stations/stations.view.html',
      controller: 'dashboardStationsCtrl',
      controllerAs: 'vm'
    })
    .when('/dashboard/stations-map', {
      templateUrl: 'dashboard/stations-map/stations-map.view.html',
      controller: 'dashboardStationsMapCtrl',
      controllerAs: 'vm'
    })
    .when('/dashboard/stations-new', {
      templateUrl: 'dashboard/stations-new/stations-new.view.html',
      controller: 'dashboardStationsNewCtrl',
      controllerAs: 'vm'
    })
    .when('/dashboard/stations-edit/:stationId', {
      templateUrl: 'dashboard/stations-edit/stations-edit.view.html',
      controller: 'dashboardStationsEditCtrl',
      controllerAs: 'vm'
    })
    .when('/dashboard/stations-upload/', {
      templateUrl: 'dashboard/stations-upload/stations-upload.view.html',
      controller: 'dashboardStationsUploadCtrl',
      controllerAs: 'vm'
    })
    .when('/dashboard/variables-summary', {
      templateUrl: 'dashboard/variables-summary/variables-summary.view.html',
      controller: 'variablesSummaryCtrl',
      controllerAs: 'vm'
    })
    .when('/dashboard/variables-queries', {
      templateUrl: 'dashboard/variables-queries/variables-queries.view.html',
      controller: 'variablesQueriesCtrl',
      controllerAs: 'vm'
    })
    .when('/dashboard/userstations', {
      templateUrl: 'dashboard/userstations/userstations.view.html',
      controller: 'dashboardUserStationsCtrl',
      controllerAs: 'vm'
    })
    .when('/dashboard/userstations-view/:stationId', {
      templateUrl: 'dashboard/userstations-view/userstations-view.view.html',
      controller: 'dashboardUserStationsViewCtrl',
      controllerAs: 'vm'
    })
    .when('/dashboard/userstations-measurements/:stationId', {
      templateUrl: 'dashboard/userstations-measurements/userstations-measurements.view.html',
      controller: 'dashboardUserStationsMeasurementsCtrl',
      controllerAs: 'vm'
    })
    .when('/dashboard/userstations-predictions/:stationId', {
      templateUrl: 'dashboard/userstations-predictions/userstations-predictions.view.html',
      controller: 'dashboardUserStationsPredictionsCtrl',
      controllerAs: 'vm'
    })
    .when('/dashboard/userstations-variable-summary/:stationId', {
      templateUrl: 'dashboard/userstations-variable-summary/userstations-variable-summary.view.html',
      controller: 'dashboardUserStationsVariableSummaryCtrl',
      controllerAs: 'vm'
    })
    .when('/dashboard/station-measurements/:stationId', {
      templateUrl: 'dashboard/station-measurements/station-measurements.view.html',
      controller: 'dashboardStationMeasurementsCtrl',
      controllerAs: 'vm'
    })
    .when('/dashboard/userstations-monthly/:stationId', {
      templateUrl: 'dashboard/userstations-monthly/userstations-monthly.view.html',
      controller: 'dashboardUserStationsMonthlyCtrl',
      controllerAs: 'vm'
    })
    .when('/dashboard/userstations-bydates/:stationId', {
      templateUrl: 'dashboard/userstations-bydates/userstations-bydates.view.html',
      controller: 'dashboardUserStationsByDatesCtrl',
      controllerAs: 'vm'
    })
    .when('/dashboard/user-edit', {
      templateUrl: 'dashboard/user-edit/user-edit.view.html',
      controller: 'dashboardUserEditCtrl',
      controllerAs: 'vm'
    })
    .when('/stations-public', {
      templateUrl: 'stations-public/stations-public.view.html',
      controller: 'stationsPublicCtrl',
      controllerAs: 'vm'
    })
    .when('/about', {
      templateUrl: 'about/about.view.html',
      controller: 'aboutCtrl',
      controllerAs: 'vm'
    })
    .when('/forgot-password', {
      templateUrl: 'forgot-password/forgot-password.view.html',
      controller: 'forgotPasswordCtrl',
      controllerAs: 'vm'
    })
    .when('/reset-password', {
      templateUrl: 'reset-password/reset-password.view.html',
      controller: 'resetPasswordCtrl',
      controllerAs: 'vm'
    })
    .when('/sandbox', {
      templateUrl: 'sandbox/sandbox.view.html',
      controller: 'sandboxCtrl',
      controllerAs: 'vm'
    })
    .when('/test', {
      templateUrl: 'test/test.view.html',
      controller: 'testCtrl',
      controllerAs: 'vm'
    })
    .otherwise({redirectTo: '/'});
}

angular.module('PomaceasWebApp')
.config(['$routeProvider', '$logProvider', config]);

angular.module('PomaceasWebApp')
.constant('APPLE_CULTIVARS',
[
  {value: 'gala', text: 'Gala'},
  {value: 'fuji', text: 'Fuji'},
  {value: 'cripps_pink', text: 'Cripps Pink'}
]);

angular.module('PomaceasWebApp')
.constant('APPLE_VARIABLES',
[
  {text:"GD (Base 10 °C)", value:"gd"},
  {text:"GDH (Base 4,5 °C)", value:"gdh"},
  {text:"Índice de estrés", value:"uEstres"},
  {text:"Días 5 h T° > 27°C", value:"5hrsmay27C"},
  {text:"Días 5 h T° > 29°C", value:"5hrsmay29C"},
  {text:"Días 5 h T° > 32°C", value:"5hrsmay32C"},
  {text:"Horas con T°> 29°C", value:"hrmay29c"},
  {text:"Días con heladas", value:"diasHel"},
  {text:"Días 5 h T° < 10°C", value:"5hrsmin10C"},
  {text:"Horas con T°< 10°C", value:"hr10"},
  {text:"Evapotranspiración (mm)", value:"et"},
  {text:"Horas con HR > 95%", value:"hr95"},
  {text:"Horas con T°< 7°C", value:"hr7"},
  {text:"Richardson", value:"richard"},
  {text:"Richardson sin negativas", value:"richardsonMod"},
  {text:"Unrath", value:"unrath"},
  {text:"Horas T° < 6  °C", value:"hrmen6c"},
  {text:"Horas T° < 12 °C", value:"hrmen12c"},
  {text:"Horas T° < 18 °C", value:"hrmen18c"},
  {text:"Horas T° > 15 °C", value:"hrmay15c"},
  {text:"Horas Luz", value:"hrrad"},
  {text:"Horas Rad > 300 W/m²", value:"hrrad300"},
  {text:"Radiación Máxima (W/m²)", value:"maxRadDia"},
  {text:"Energía Solar (MJ/m²)", value:"energia"},
  {text:"Vel. Máx. Viento (m/s)", value:"maxWindSpeed"},
  {text:"Horas Vuelo Abejas", value:"hrabe"},
  {text:"Precipitaciones (mm)", value:"totalRain"},
  {text:"Hrs. T° óptima (20-25°C)", value:"hropt"},
  {text:"DPV (kPa)", value:"dpv"},
  {text:"Hrs. DPV > 2.5", value:"hrsDPVmay2p5"},
  {text:"Temperatura (Prom.)", value:"tempOut"},
  {text:"Temperatura Máx. (Prom.)", value:"hiTemp"},
  {text:"Temperatura Mín. (Prom.)", value:"lowTemp"},
  {text:"Humedad Relativa (Prom.)", value:"outHum"},
  {text:"Vel. del Viento (Prom.)", value:"windSpeed"},
  {text:"Precipitaciones (Prom.)", value:"rain"},
  {text:"Radiación (Prom.)", value:"solarRad"}
]);

angular.module('PomaceasWebApp')
.constant('REGION_NAMES',
[
  {value:"XV", text:"XV Región de Arica y Parinacota"},
  {value:"I", text:"I Región de Tarapacá"},
  {value:"II", text:"II Región de Antofagasta"},
  {value:"III", text:"III Región de Atacama"},
  {value:"IV", text:"IV Región de Coquimbo"},
  {value:"V", text:"V Región de Valparaíso"},
  {value:"M", text:"Región Metropolitana"},
  {value:"VI", text:"VI Región del Libertador General Bernardo O'Higgins"},
  {value:"VII", text:"VII Región del Maule"},
  {value:"VIII", text:"VIII Región del Biobío"},
  {value:"IX", text:"IX Región de la Araucanía"},
  {value:"XIV", text:"XIV Región de los Ríos"},
  {value:"X", text:"X Región de los Lagos"},
  {value:"XI", text:"XI Región de Aysén"},
  {value:"XII", text:"XII Región de Magallanes y Antártica"},
]);
