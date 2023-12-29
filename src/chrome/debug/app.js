/* The main program of test panel */

requirejs.config({
	paths : {
		"dualless" : ".."
	},
	baseUrl : ".."
});

import {Information} from "./view/information.js";
import {WinButton}  from "../directives/winbutton.js";

require([
         ],
	     function app(){

	var module = angular.module('main', []);
	
	module.config(['$routeProvider', function configRouteProvider($routeProvider) {
		
		const information = Information();

		$routeProvider.when('/info', information);
	  	//$routeProvider.when('/component', component);
	  	
	  	$routeProvider.when('/preparetest', {templateUrl: "view/preparetest.html"});
	
	  	$routeProvider.otherwise({redirectTo : "/info" })
	  	
	}]);

    module.directive('winbutton',WinButton());
	
	$(document).ready(function() {
		angular.bootstrap(document,["main"]);
	});

});
