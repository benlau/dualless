/* The main program of test panel */

requirejs.config({
	paths : {
		"dualless" : "../chrome"
	}
});

require(["view/browser",
         "view/component",
         "dualless/directive/hsplitpanel",
         "dualless/directive/vsplitpanel"
         ],
	     function app(browser,
	    		 		components,
	    		 		hsplitpanel,
	    		 		vsplitpanel){

	var module = angular.module('main', []);
	
	module.config(['$routeProvider', function configRouteProvider($routeProvider) {
		
	  	$routeProvider.when('/', {template: '<div class=container> ' +
	      						   '<div class="hero-unit">' +
	      						   '<h1>Hello!</h1>' +
		          				   'It is the test program of Dualless. You may execute unit test and test the different between platform.' +
		          				   '</div>' +
	      						   	'</div>' });
	  	
	  	$routeProvider.when('/browser', browser );
	  	
	  	$routeProvider.when('/component', components);
	
	  	
	}]);

	module.directive('hsplitpanel',hsplitpanel);
	module.directive('vsplitpanel',vsplitpanel);

	
	$(document).ready(function() {
		angular.bootstrap(document,["main"]);
	});

});