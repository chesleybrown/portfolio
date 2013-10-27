var app = angular.module('ngPortfolio', [])
	
	.config(function ($routeProvider) {
		$routeProvider
			.when('/blog/:key', { controller: 'PortfolioCtrl', templateUrl: 'app.html' })
			.otherwise({ controller: 'PortfolioCtrl', templateUrl: 'app.html' })
		;
	})
	
	.controller('PortfolioCtrl', function ($window, $scope, $routeParams, $http) {
		$scope.article = {
			blog: true,
			aboutme: true,
			workeducation: true,
			skills: true,
			projects: true,
			social: true,
			contact: true
		};
		$scope.feed = null;
		$scope.blogs = null;
		$scope.requested = $routeParams.key;
		
		$http
			.get('/api/feed')
			.success(function(data, status, headers, config){
				$scope.feed = data;
			})
			.error(function(data, status, headers, config){})
		;
		
		if (!$routeParams.key) {
			$routeParams.key = '';
		}
		else {
			// show full article by default if requesting one
			$scope.article['blog'] = false;
		}
		
		$http
			.get('/api/blog/' + $routeParams.key)
			.success(function(data, status, headers, config){
				$scope.blogs = data;
				
				if ($scope.blogs && $scope.blogs.length > 0) {
					$window.document.title = 'Chesley - ' + $scope.blogs[0].title;
				}
			})
			.error(function(data, status, headers, config){})
		;
		
		$scope.readmore = function(article) {
			$scope.article[article] = !$scope.article[article];
		}
		
	})
	
;