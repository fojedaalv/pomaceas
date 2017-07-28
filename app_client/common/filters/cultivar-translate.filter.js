const cultivarTranslate = (APPLE_CULTIVARS) => {
  var cultivars = APPLE_CULTIVARS;
  return (value) => {
    var element = cultivars.find((element) => {
      return element.value == value
    });
    return element != undefined ? element.text : 'No Definido';
  }
}

angular
.module('PomaceasWebApp')
.filter('cultivarTranslate', cultivarTranslate);
