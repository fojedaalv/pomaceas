angular.module('PomaceasWebApp')
.service('summariesSvc', summariesSvc);

function summariesSvc($http, $window, authSvc){
  var createSummary = function(summaryData){
    return $http.post('/api/v1/summaries/',
      summaryData,
      {
        headers: {
          'Authorization': 'Bearer '+ authSvc.getToken()
        }
      }
    );
  }

  var getSummariesList = () => {
    return $http.get('/api/v1/summaries');
  }

  var deleteSummary = function(summaryId){
    return $http.delete('/api/v1/summaries/'+summaryId, {
      headers: {
        'Authorization': 'Bearer '+ authSvc.getToken()
      }
    });
  }

  return {
    createSummary: createSummary,
    getSummariesList: getSummariesList,
    deleteSummary: deleteSummary
  };
}
