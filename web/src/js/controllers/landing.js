angular.module('rssApp')
  .controller(
    'Landing',
    function($scope) {
      $scope.user = { deliveryFrequency: '1 day' };
    });
