require('angular-mocks');
var expect = require('chai').expect;

describe('Controller: Landing', function() {

  beforeEach(angular.module('rssApp'));

  var LandingController,
      scope;

  beforeEach(inject(function($controller, $rootScope) {
    scope = $rootScope.new();
    LandingController = $controller('Landing', {
      $scope: scope
    });
  }));

  it('should run test', function() {
    expect(true).to.equal(true);
  });

});
