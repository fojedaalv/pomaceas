angular.module('PomaceasWebApp')
.directive('footerWide', footerWide);

function footerWide(){
  return {
    restrict: 'E',
    templateUrl: 'common/directives/footer-wide/footer-wide.view.html'
  };
}
