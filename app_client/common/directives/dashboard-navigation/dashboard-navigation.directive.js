angular.module('PomaceasWebApp')
.directive('dashboardNavigation', dashboardNavigation);

function dashboardNavigation(){
  return {
    restrict: 'E',
    templateUrl: 'common/directives/dashboard-navigation/dashboard-navigation.view.html',
    controller: 'dashboardNavigationCtrl as navvm'
  };
}
