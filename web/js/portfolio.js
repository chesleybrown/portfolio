'use strict';

angular
	.module('ngPortfolio', ['ngRoute', 'ngSanitize', 'angulartics', 'angulartics.google.analytics'])
	.config(function ($routeProvider) {
		$routeProvider
			.otherwise({controller: 'PortfolioCtrl', templateUrl: 'app.html'})
		;
	})
	.controller('PortfolioCtrl', function ($window, $scope, $routeParams, $http, $sce) {
		$scope.article = {
			aboutme: true,
			workeducation: true,
			skills: true,
			projects: true,
			contact: true
		};
		
		$scope.readmore = function (article) {
			$scope.article[article] = !$scope.article[article];
		};
		
		$scope.parseBlogContent = function (content) {
			return $sce.trustAsHtml(content);
		};
	})
;
