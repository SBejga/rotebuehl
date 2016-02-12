'use strict';

angular.module('rotebuehlApp')
  .directive('appFooter', function (version) {
    return {
      templateUrl: 'components/footer/footer.html',
      restrict: 'EA',
      link: function (scope, element, attrs) {
        scope.version = version;
      }
    };
  });
