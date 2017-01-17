angular.module('PomaceasWebApp')
.directive('navigation', navigation);

function navigation(){
  return {
    restrict: 'E',
    templateUrl: 'common/directives/navigation/navigation.view.html',
    controller: 'navigationCtrl as navvm'
  };
}
