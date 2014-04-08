window._ = require('lodash');
require('angular');
require('angular-ui-router');
require('restangular');

var app = angular.module('rssApp', [
  'ui.router',
  'restangular'
]).config(function (
  $locationProvider, 
  $stateProvider, 
  $urlRouterProvider,
  RestangularProvider
) {
  $locationProvider.html5Mode(true);
  $urlRouterProvider.otherwise('/');
  RestangularProvider.setRestangularFields({ id: '_id' });
  RestangularProvider.setBaseUrl('/api/v1');
  $stateProvider.state('home', {
    url: '/',
    templateUrl: 'views/landing.html'
  });
}).run(function($rootScope) {
  $rootScope.user = {
    email: null,
    sources: []
  };
});

// Controllers
require('./controllers/landing.js');
require('./controllers/sources.js');
require('./controllers/subscribe.js');
