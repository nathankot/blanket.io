/* jshint expr: true  */

require('angular-mocks');
var expect = require('chai').expect;

describe.only('Controller: Sources', function() {

  var SourcesController,
      scope,
      $httpBackend;

  beforeEach(angular.mock.module('rssApp'));

  beforeEach(inject(function($controller, $rootScope, $injector) {
    $httpBackend = $injector.get('$httpBackend');
    rootScope = $rootScope;
    scope = $rootScope.$new();
    SourcesController = $controller('Sources', {
      $scope: scope
    });
  }));

  it('should have an array of sources', function() {
    expect(scope.sources).to.be.instanceOf(Array);
  });

  describe('scope.add()', function() {

    it('should be callable', function() {
      expect(scope).to.respondTo('add');
    });

  });

  describe('scope.save()', function() {

    beforeEach(function() {
      scope.user = { sources: [] };
      scope.sources = [
        { url: 'http://nzherald.co.nz' },
        { url: 'http://news.ycombinator.com' }
      ];

      $httpBackend.expectPOST(
        '/api/v1/sources',
        [{ url: 'http://nzherald.co.nz' },
         { url: 'http://news.ycombinator.com' }]
      ).respond(201, [
        { url: 'http://nzherald.co.nz', title: 'New Zealand Herald' },
        { url: 'http://news.ycombinator.com', title: 'Hacker News' }
      ]);
    });

    it('should be callable', function() {
      expect(scope).to.respondTo('save');
    });

    it('should make a request', function() {
      scope.save(scope.sources);
      $httpBackend.flush();
      $httpBackend.verifyNoOutstandingExpectation();
    });

    it('should reset scopes', function() {
      scope.save(scope.sources);
      $httpBackend.flush();
      rootScope.$apply();
      expect(scope.sources).to.be.empty;
    });

    it('should assign response to user.sources', function() {
      scope.save(scope.sources);
      $httpBackend.flush();
      rootScope.$apply();
      expect(scope.user.sources).not.to.be.empty;
    });
    
  });


});
