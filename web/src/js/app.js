require('angular');
require('angular-ui-router');
require('restangular');

var app = angular.module('rssApp', [
  'ui.router',
  'restangular'
]).config([
  '$locationProvider',
  '$stateProvider',
  '$urlRouterProvider',
  function (
    $locationProvider, 
    $stateProvider, 
    $urlRouterProvider,
    RestangularProvider
  ) {
    $locationProvider.html5Mode(true);
    $urlRouterProvider.otherwise('/');
    RestangularProvider.setRestangularFields({ id: '_id' });

    $stateProvider.state('home', {
      url: '/',
      templateUrl: 'views/landing.html'
    });
}]);

// Controllers
require('./controllers/landing.js');
require('./controllers/sources.js');
