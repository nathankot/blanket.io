var _ = require('lodash');

angular.module('rssApp')
  .controller(
    'Sources',
    function($scope, Restangular) {
      $scope.sources = [];

      $scope.add = function(source) {
        $scope.form.source.$setDirty();

        if (_.find($scope.sources, function(s) { return s.url == source.url; })) {
          $scope.form.source.url.$setValidity('unique', false);
        } else {
          $scope.form.source.url.$setValidity('unique', true);
        }

        if ($scope.form.source.$valid) {
          $scope.sources.push(source);
          $scope.source = {};
          $scope.form.source.$setPristine();
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
