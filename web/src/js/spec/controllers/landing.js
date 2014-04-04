require('angular-mocks');
var expect = require('chai').expect;

describe('Controller: Landing', function() {

  var LandingController,
      scope;

  beforeEach(angular.mock.module('rssApp'));

  beforeEach(inject(function($controller, $rootScope) {
    scope = $rootScope.$new();
    LandingController = $controller('Landing', {
      $scope: scope
    });
  }));

  it('should run test', function() {
    expect(true).to.equal(true);
  });

});
