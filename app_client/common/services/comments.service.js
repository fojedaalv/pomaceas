angular.module('PomaceasWebApp')
.service('commentsSvc', commentsSvc);

function commentsSvc($http, $window, authSvc){
  var getComment = (stationId, summaryId) => {
    return $http.get('/api/v1/comments'+'?station='+stationId+'&summary='+summaryId, {
      headers: {
        'Authorization': 'Bearer '+ authSvc.getToken()
      }
    });
  }

  var createComment = (commentData) => {
    return $http.post('/api/v1/comments', commentData, {
      headers: {
        'Authorization': 'Bearer '+ authSvc.getToken()
      }
    });
  }

  var updateComment = (commentId, comment) => {
    return $http.patch('/api/v1/comments/'+ commentId, {
      comment: comment
    }, {
      headers: {
        'Authorization': 'Bearer '+ authSvc.getToken()
      }
    });
  }

  var deleteComment = (commentId) => {
    return $http.delete('/api/v1/comments/' + commentId, {
      headers: {
        'Authorization': 'Bearer '+ authSvc.getToken()
      }
    });
  }

  return {
    getComment    : getComment,
    createComment : createComment,
    updateComment : updateComment,
    deleteComment : deleteComment
  };
}
