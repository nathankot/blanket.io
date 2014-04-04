require('angular');
require('angular-ui-router');

angular.module('rssApp', ['ui.router'])
       .config([
         '$locationProvider',
         '$stateProvider',
         '$urlRouterProvider',
         function ($locationProvider, $stateProvider, $urlRouterProvider) {
          $locationProvider.html5Mode(true);
          $urlRouterProvider.otherwise('/');

          $stateProvider.state('home', {
            url: '/',
            templateUrl: 'views/landing.html'
          });
       }]);

// Controllers
require('./controllers/landing.js');
