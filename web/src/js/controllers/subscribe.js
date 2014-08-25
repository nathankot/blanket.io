var _ = require('lodash');

angular.module('rssApp')
  .controller(
    'Subscribe',
    function($scope, Restangular) {

      $scope.submit = function(subscriber) {
        $scope.form.subscriber.$setDirty();
        $scope.form.subscriber.email.$setValidity('processable', true);
        if ($scope.form.subscriber.$valid) {
          $scope.save(subscriber)
          .then(function(subscriber) {
            _.merge($scope.user, subscriber);
            $scope.user.subscribed = true;
          })
          .catch(function(err) {
            $scope.form.subscriber.email.$setValidity('processable', false);
          });
        }
      };

      $scope.save = function(subscriber) {
        return Restangular.all('subscribers').post(subscriber);
      };
    });
