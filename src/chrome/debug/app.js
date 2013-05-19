/* The main program of test panel */

requirejs.config({
	paths : {
		"dualless" : ".."
	},
	baseUrl : ".."
});

require(["debug/view/component",
         "debug/view/information",
         "dualless/directives/splitpanel",
         "dualless/directives/winbutton"
         ],
	     function app(component,
	    		 		information,
	    		 		splitpanel,
	    		 		winbutton){

	var module = angular.module('main', []);
	
	module.config(['$routeProvider', function configRouteProvider($routeProvider) {
		  	  	
		$routeProvider.when('/info', information);
	  	$routeProvider.when('/component', component);
	  	
	  	$routeProvider.when('/preparetest', {templateUrl: "view/preparetest.html"});
	
	  	$routeProvider.otherwise({redirectTo : "/info" })
	  	
	}]);

	module.directive('hsplitpanel',splitpanel("H"));
	module.directive('vsplitpanel',splitpanel("V"));
    module.directive('winbutton',winbutton);
	
	$(document).ready(function() {
		angular.bootstrap(document,["main"]);
	});

});
