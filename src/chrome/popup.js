requirejs.config({
	paths : {
		"dualless" : "."
	}
});

function SplitController($scope,$location,$timeout) {
	var bg = chrome.extension.getBackgroundPage();
	var manager = bg.manager();
	
	var win; // The current window
	var tab; // The current tab

	var scr = {};
	$.extend(scr,window.screen); // Make a copy of the screen object
	
	manager.currentWindowTab(function (val1,val2){
		win = val1;
		tab = val2;
	});

	$scope.$on("split",function(event,args) {
		event.stopPropagation();
		args.window = win;
		args.tab = tab;
		
		// Manager alive in the background page. The screen object is not updated. So it need to pass the screen object from external
		args.screen = scr; 	
		
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
		event.stopPropagation();
		var args = {};
		args.window = win;
		args.tab = tab;
		args.screen = scr;
		manager.merge(args);
	});
	
	$scope.$on("$destroy",function(event) {
		if (localStorage.lastPopupPath == undefined || (
				localStorage.lastPopupPath != $location.path() 
				&& $location.path().indexOf("split") != -1
				)
			)
			localStorage.lastPopupPath = $location.path();
	});
	
    $timeout(function(){
        $(".split-panel-win").each(function() {
            $(this).attr("title","Press middle key may duplicate this page to other window.");
         });  
    });
};

SplitController.$inject = ["$scope","$location","$timeout"];

function BookmarkController($scope) {
	$scope.param1 = 3
	$scope.param2 = 7
	
	$scope.bookmarks = [
		{ color : "#FFFFFF",
		  title : "Default"
		},
		{ color : "#FFFF00",
		  title : "Note"
		},
	]
	
}

require([ "dualless/directive/hsplitpanel",
          "dualless/directive/vsplitpanel"],
          function popup(hsplitpanel,vsplitpanel){
	var module = angular.module("popup",[]);
	
	module.config(['$routeProvider', function configRouteProvider($routeProvider) {
			$routeProvider.when("/hsplit",{
				template : "<hsplitpanel></hsplitpanel>",
				controller : SplitController
			});

			$routeProvider.when("/vsplit",{
				template : "<vsplitpanel></vsplitpanel>",
				controller : SplitController
			});

			$routeProvider.when("/bookmark/:orientation/:param1/:param2",{
				templateUrl : "partials/bookmark.html",
				controller : BookmarkController
			});
			
			var popupDefaultPath = localStorage.lastPopupPath;
			if (popupDefaultPath == undefined)
				popupDefaultPath = "/hsplit";

		  	$routeProvider.otherwise({redirectTo : popupDefaultPath });
			
	}]);
	
	module.directive('hsplitpanel',hsplitpanel);
	module.directive('vsplitpanel',vsplitpanel);
	
	module.directive('ngRightClick', function($parse) {
		return function(scope, element, attrs) {
			var fn = $parse(attrs.ngRightClick);
			element.bind('contextmenu', function(event) {
				scope.$apply(function() {
					event.preventDefault();
					fn(scope, {$event:event});
				});
			});
		};
	});
	
	$(document).ready(function() {
		angular.bootstrap(document,["popup"]);
	});	
});
          
          
          
