const roleTranslate = (SYSTEM_ROLES) => {
  var variables = SYSTEM_ROLES;
  return (value) => {
    var element = variables.find((element) => {
      return element.value == value
    });
    return element != undefined ? element.text : 'No Definido';
  }
}

angular
.module('PomaceasWebApp')
.filter('roleTranslate', roleTranslate);
