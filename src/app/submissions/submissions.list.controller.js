'use strict';

var module = angular.module('supportAdminApp');

module.controller('SubmissionListCtrl', ['$scope', 'SubmissionService', '$timeout',
  function($scope, $submissionService, $timeout) {
  	angular.element(document).ready(function() {
      $('.footable').footable({
        addRowToggle: true
      });
    });
    $scope.submissions = [];
    $scope.progress = [];
    var getSubmissions = function(challengeId) {
      $scope.isLoading = true;
      $submissionService.findSubmissions(challengeId).then(
          function(responseSubmissions) {
            $timeout(function() {
              $('.footable').trigger('footable_redraw');
            }, 100);
            $scope.submissions = responseSubmissions;
            $scope.isLoading = false;
          },
          function(error) {
            $scope.isLoading = false;
            $scope.$broadcast('alert.AlertIssued', {
              type: 'danger',
              message: error.error
            });
          });
    };

    $scope.reloadSubmissions = function() {
      $scope.submissions = [];
      getSubmissions($scope.challengeObj.id);
    }
    if ($scope.challengeObj) {
      getSubmissions($scope.challengeObj.id);
    }
    $scope.$watch('challengeObj', function(newValue, oldValue) {
      if (newValue !== oldValue && newValue !== null) {
        getSubmissions(newValue.id);   
      }
    })

    $scope.reprocess = function(submission) {
      $scope.progress[submission.id] = true;
      $submissionService.processSubmission(submission).then(function(sub) {
        console.log("Reprocessing Submission");
        delete $scope.progress[submission.id];
        $scope.$broadcast('alert.AlertIssued', {
          type: "success",
          message: "Submission submitted for reprocessing."
        });
        submission.status = sub.status;
      }, function(error) {
        console.log("process reprocessing failed");
        console.log(error);
        delete $scope.progress[submission.id];
        $scope.$broadcast('alert.AlertIssued', {
          type: 'danger',
          message: error.error
        });
      });
    }

  }
]);
