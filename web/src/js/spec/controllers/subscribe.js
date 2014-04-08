/* jshint expr: true  */

require('angular-mocks');
var expect = require('chai').expect;

describe('Controller: Subscribe', function() {

  var SubscribeController,
      scope,
      $httpBackend;

  beforeEach(angular.mock.module('rssApp'));

  beforeEach(inject(function($controller, $rootScope, $injector) {
    $httpBackend = $injector.get('$httpBackend');
    rootScope = $rootScope;
    scope = $rootScope.$new();
    SubscribeController = $controller('Subscribe', {
      $scope: scope
    });
  }));

  beforeEach(function() {
    scope.user = {
      _id: 'abc',
      email: 'me@nathankot.com',
      sources: [{ _id: '123' }, { _id: '1234' }]
    };
  });

  describe('scope.save()', function() {
    beforeEach(function() {
      $httpBackend.expectPOST('/api/v1/subscribers', scope.user)
                  .respond(201, scope.user);
    });

    it('should send a request', function() {
      scope.save(scope.user);
      $httpBackend.flush();
      $httpBackend.verifyNoOutstandingExpectation();
    });

    it('returns a promise', function() {
      expect(scope.save(scope.user)).to.respondTo('then');
    });
  });

});
