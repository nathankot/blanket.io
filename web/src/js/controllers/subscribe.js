var _ = require('lodash');

angular.module('rssApp')
  .controller(
    'Subscribe',
    function($scope, Restangular) {

      $scope.submit = function(subscriber) {
        $scope.form.subscriber.$setDirty();

        if ($scope.form.$valid) {
          $scope.save(subscriber)
          .then(function(subscriber) {
            $scope.user = subscriber;
          });
        }
      };

      $scope.save = function(subscriber) {
        return Restangular.all('subscribers').post(subscriber);
      };
    });
