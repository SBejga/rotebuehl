'use strict';

angular.module('rotebuehlApp')
  .controller('ForgotCtrl', function ($scope, User, Auth) {
    $scope.errors = {other: false};

    $scope.forgotPassword = function(form) {
      $scope.submitted = true;
      if(form.$valid) {
        Auth.createNewPassword($scope.user.email)
        .then( function() {
          $scope.message = 'Password sent to your email.';
          $scope.errors.other = false;
        })
        .catch( function() {
          $scope.message = '';
          $scope.errors.other = true;
        });
      }
		};
  });
