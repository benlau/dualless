requirejs.config({
	paths : {
		"dualless" : "."
	}
});

// The main controller for popup
function PopupCtrl($scope,$location,$timeout) {
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
    
    $scope.bookmark = {
        // List of link
        links : [
            { id : "1", // Each link should have an unique id
              color : "#f4b400",
              title : "Google Keep",
              url : "https://drive.google.com/keep" 
            }
        ],
        // Binding between link and window button
        bindings : [
            { key: "H_70_30_1", // The id of the button
              id : "1"
            }
        ],
        // The link for specific window button. It is the result after combined links and bindings
        buttons : {
        }
    }

	// @TODO : Pregenerate the buttons
	
    $scope.$watch(function(scope) {
            // Due to CSP problem
            return JSON.stringify({
                list : scope.bookmark.links,
                binding : scope.bookmark.bindings
            });
        },function() {
        var buttons = {};
        for (var i  in $scope.bookmark.bindings) {
            var binding = $scope.bookmark.bindings[i];
            for (var j in $scope.bookmark.links) {
                var link = $scope.bookmark.links[j];
                if (link.id== binding.id) {
                    var res = {};
                    $.extend(res,binding);
                    $.extend(res,link);
                    if (buttons[binding.key] == undefined) {
                        buttons[binding.key] = [];
                    }
                    buttons[binding.key].push(res);
                    break;
                } 
            }
        }
        $.extend($scope.bookmark.buttons , buttons);
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

PopupCtrl.$inject = ["$scope","$location","$timeout"];

require([ "dualless/directives/splitpanel",
          "dualless/directives/bookmarklist",
          "dualless/directives/winbutton",
          "dualless/views/bookmark",
          "dualless/directives/bookmarkeditor"
          ],
          function popup(splitpanel,
                            bookmarklist,
                            winbutton,
                            bookmark,
                            bookmarkeditor){

	var module = angular.module("popup",[]);
	
	module.config(['$routeProvider', function configRouteProvider($routeProvider) {
			$routeProvider.when("/hsplit",{
				template : "<hsplitpanel ng-model='bookmark'></hsplitpanel>"
				//controller : SplitController
			});

			$routeProvider.when("/vsplit",{
				template : "<vsplitpanel ng-model='bookmark'></vsplitpanel>"
				//controller : SplitController
			});

			$routeProvider.when("/bookmark/:orientation/:param1/:param2",bookmark);
			
			var popupDefaultPath = localStorage.lastPopupPath;
			if (popupDefaultPath == undefined)
				popupDefaultPath = "/hsplit";

		  	$routeProvider.otherwise({redirectTo : popupDefaultPath });
			
	}]);
	
	module.directive('hsplitpanel',splitpanel("H"));
	module.directive('vsplitpanel',splitpanel("V"));
	module.directive('bookmarklist',bookmarklist);
	module.directive('bookmarkeditor',bookmarkeditor);
    module.directive('winbutton',winbutton);
	module.directive('onRepeatFinish',function() {
		return {
			restrict: 'A',
			link : function(scope,element,attr) {
				if (scope.$last == true) {
					scope.$evalAsync(attr.onRepeatFinish);
				}
			}
		}
	});
	
	$(document).ready(function() {
		angular.bootstrap(document,["popup"]);
	});	
});
          
          
          
