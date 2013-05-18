requirejs.config({
	paths : {
		"dualless" : "."
	}
});

var bookmark;

angular.injector(['ng']).invoke(function($rootScope) {
    bookmark = $rootScope.$new();

    // Hard coded bookmark for testing purpose

    $.extend(bookmark,{
        list : [
            { color : "#f4b400",
              title : "Google Keep",
              url : "https://drive.google.com/keep" 
            }
        ],
        binding : [
            { key: "H_70_30_1",
              color : "#f4b400"
            }
        ],
        buttons : {
        }
    });
    
    bookmark.$watch(function(scope) {
            // Due to CSP problem
            return JSON.stringify({
                list : scope.list,
                binding : scope.binding
            });
        },function() {
        var buttons = {};
        for (var i  in bookmark.binding) {
            var b = bookmark.binding[i];
            var color = b.color;
            for (var j in bookmark.list) {
                var item = bookmark.list[j];
                if (item.color== color) {
                    var res = {};
                    $.extend(res,b);
                    $.extend(item);
                    if (buttons[b.key] == undefined) {
                        buttons[b.key] = [];
                    }
                    buttons[b.key].push(res);
                    break;
                } 
            }
        }
        //$.extend(this.buttons , buttons);
        bookmark.buttons = buttons;
    });   
    
    bookmark.$digest();
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
    
    $scope.bookmark = bookmark;

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
	var bg = chrome.extension.getBackgroundPage();
	var manager = bg.manager();
	
	var scr = {};
	$.extend(scr,window.screen); // Make a copy of the screen object

	manager.currentWindowTab(function (val1,val2){
		win = val1;
		tab = val2;
	});

	var win; // The current window
	var tab; // The current tab
	
	$scope.param1 = 3
	$scope.param2 = 7

    $scope.bookmark = bookmark;

	$scope.split = function(options) {
		// Create tab with specific url then split
		options.screen = scr;		
		
		// "active" should be false , otherwise the popup will
		// be destroyed before it is completed.
		chrome.tabs.create({active:false, 
		                      url : options.url
						      },function(tab) {
	
				options.window = win;
				options.tab = tab;
				delete options.url;
				manager.split(options,function(windows) {
					chrome.tabs.update(tab.id,{ active: true
									             });
				});							

		});
		
	}
}

require([ "dualless/directives/splitpanel",
          "dualless/directives/bookmarklist",
          "dualless/directives/winbutton"
          ],
          function popup(splitpanel,
                            bookmarklist,
                            winbutton){

	var module = angular.module("popup",[]);
	
	module.config(['$routeProvider', function configRouteProvider($routeProvider) {
			$routeProvider.when("/hsplit",{
				template : "<hsplitpanel ng-model='bookmark'></hsplitpanel>",
				controller : SplitController
			});

			$routeProvider.when("/vsplit",{
				template : "<vsplitpanel ng-model='bookmark'></vsplitpanel>",
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
	
	module.directive('hsplitpanel',splitpanel("H"));
	module.directive('vsplitpanel',splitpanel("V"));
	module.directive('bookmarklist',bookmarklist);
    module.directive('winbutton',winbutton);
	
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
          
          
          
