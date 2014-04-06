var _ = require('lodash');

angular.module('rssApp')
  .controller(
    'Sources',
    function($scope, Restangular) {
      $scope.sources = [];

      $scope.add = function(source) {
        $scope.form.source.$setPristine(false);

        if ($scope.form.source.$valid) {
          $scope.form.source.$setPristine(true);
          $scope.sources.push(source);
          $scope.source = {};
        }
      };

      $scope.save = function(sources) {
        Restangular.all('sources').post(sources)
        .then(function(sources) {
          $scope.user.sources = sources;
          $scope.sources = [];
        });
      };
    });
