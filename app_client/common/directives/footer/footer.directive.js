angular.module('PomaceasWebApp')
.directive('footer', footer);

function footer(){
  return {
    restrict: 'E',
    templateUrl: 'common/directives/footer/footer.view.html'
  };
}
