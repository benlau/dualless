/* The main program of test panel */

requirejs.config({
	paths : {
		"dualless" : ".."
	},
	baseUrl : ".."
});

require(["debug/view/component",
         "debug/view/information",
         "dualless/directive/hsplitpanel",
         "dualless/directive/vsplitpanel"
         ],
	     function app(component,
	    		 		information,
	    		 		hsplitpanel,
	    		 		vsplitpanel){

	var module = angular.module('main', []);
	
	module.config(['$routeProvider', function configRouteProvider($routeProvider) {
		  	  	
		$routeProvider.when('/info', information);
	  	$routeProvider.when('/component', component);
	  	
	  	$routeProvider.when('/preparetest', {templateUrl: "view/preparetest.html"});
	
	  	$routeProvider.otherwise({redirectTo : "/info" })
	  	
	}]);

	module.directive('hsplitpanel',hsplitpanel);
	module.directive('vsplitpanel',vsplitpanel);
	
	$(document).ready(function() {
		angular.bootstrap(document,["main"]);
	});

});