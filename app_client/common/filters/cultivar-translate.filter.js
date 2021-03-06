const cultivarTranslate = (APPLE_CULTIVARS) => {
  var variables = APPLE_CULTIVARS;
  return (value) => {
    var element = variables.find((element) => {
      return element.value == value
    });
    return element != undefined ? element.text : 'No Definido';
  }
}

angular
.module('PomaceasWebApp')
.filter('cultivarTranslate', cultivarTranslate);
