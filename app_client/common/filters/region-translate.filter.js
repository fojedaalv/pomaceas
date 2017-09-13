const regionTranslate = (REGION_NAMES) => {
  var variables = REGION_NAMES;
  return (value) => {
    var element = variables.find((element) => {
      return element.value == value
    });
    return element != undefined ? element.text : 'No Definido';
  }
}

angular
.module('PomaceasWebApp')
.filter('regionTranslate', regionTranslate);
