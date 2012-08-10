requirejs.config({
	paths : {
		"dualless" : "."
	}
});

function SplitController($scope,$location) {
	var bg = chrome.extension.getBackgroundPage();
	var manager = bg.manager();
	
	var win; // The current window
	var tab; // The current tab
	
	manager.currentWindowTab(function (val1,val2){
		win = val1;
		tab = val2;
	});

	$scope.$on("split",function(event,args) {
		event.stopPropagation();
		args.window = win;
		args.tab = tab;
		manager.split(args,function(windows){
			win = windows[0]; 
			// Current window could be changed for some condition
			/* 
			 * Condition 1. Single Window. 
			 * The current tab will be moved to a new window. So the current window will be changed , but tab will not 
			 * be changed.  
			 * 
			 */ 
		});
	});
	
	$scope.$on("merge",function(event) {
		console.log("merge1");
		event.stopPropagation();
		var args = {};
		args.window = win;
		args.tab = tab;
		console.log("merge2");
		manager.merge(args);
		console.log("merge3");
	});
	
	$scope.$on("$destroy",function(event) {
		if (localStorage.lastPopupPath != $location.path())
			localStorage.lastPopupPath = $location.path();
	});
};

SplitController.$inject = ["$scope","$location"];

require([ "dualless/directive/hsplitpanel",
          "dualless/directive/vsplitpanel"],
          function popup(hsplitpanel,vsplitpanel){
	var module = angular.module("popup",[]);
	
	module.config(['$routeProvider', function configRouteProvider($routeProvider) {
			$routeProvider.when("/hsplit",{
				template : "<hsplitpanel></hsplitpanel",
				controller : SplitController
			});

			$routeProvider.when("/vsplit",{
				template : "<vsplitpanel></vsplitpanel",
				controller : SplitController
			});
			
			var popupDefaultPath = localStorage.lastPopupPath;
			if (popupDefaultPath == undefined)
				popupDefaultPath = "/hsplit";
			
		  	$routeProvider.otherwise({redirectTo : popupDefaultPath });
			
	}]);
	
	module.directive('hsplitpanel',hsplitpanel);
	module.directive('vsplitpanel',vsplitpanel);
	
	$(document).ready(function() {
		angular.bootstrap(document,["popup"]);
	});	
});
          
          
          