const variableTranslate = (APPLE_VARIABLES) => {
  var variables = APPLE_VARIABLES;
  return (value) => {
    var element = variables.find((element) => {
      return element.value == value
    });
    return element != undefined ? element.text : 'No Definido';
  }
}

angular
.module('PomaceasWebApp')
.filter('variableTranslate', variableTranslate);
