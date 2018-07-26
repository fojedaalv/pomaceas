const yearToPeriod = () => {
  return (value) => {
    return value.slice(2)+"/"+(Number(value.slice(2))+1)
  }
}

angular
.module('PomaceasWebApp')
.filter('yearToPeriod', yearToPeriod);
