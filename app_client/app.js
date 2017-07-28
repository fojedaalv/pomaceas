angular.module('PomaceasWebApp', [
  'ngRoute',
  'uiGmapgoogle-maps',
  'n3-line-chart',
  'angularMoment',
  'ngSanitize',
  'ngCsv',
  'ui.bootstrap'
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
