requirejs.config({
	paths : {
		"dualless" : "."
	}
});

require([ "dualless/views/panel",
          "dualless/directives/bookmarklist",
          "dualless/directives/winbutton",
          "dualless/views/bookmark",
          "dualless/directives/bookmarkeditor",
          "dualless/directives/bookmarkitem",
          "dualless/sys/service"
          ],
          function popup(PanelView,
                            bookmarklist,
                            winbutton,
                            bookmark,
                            bookmarkeditor,
                            bookmarkitem,
                            WindowManagerService
                            ){

	var app = angular.module("popup",[]);
	
	app.config(['$routeProvider', function configRouteProvider($routeProvider) {
        
        $routeProvider.when("/panel/:orientation",PanelView);
        $routeProvider.when("/bookmark/:orientation/:param1/:param2/:position",bookmark);
        // @TODO - Enable to remember the horizontal or vertical mode.
        $routeProvider.otherwise({redirectTo : "/panel/h" });
			
	}]);
	
	app.directive('bookmarklist',bookmarklist);
	app.directive('bookmarkeditor',bookmarkeditor);
    app.directive('bookmarkitem',bookmarkitem);
    app.directive('winbutton',winbutton);
	app.directive('onRepeatFinish',function() {
		return {
			restrict: 'A',
			link : function(scope,element,attr) {
				if (scope.$last === true) {
					scope.$evalAsync(attr.onRepeatFinish);
				}
			}
		};
	});
	
    
    if (chrome === undefined || chrome.extension === undefined) { 
    
        // It is not running as Chrome extenison
        // Resgier a mock WindowManager service so that the program can be tested 
        // just like a normal web page. (for verify the style)
        app.factory("WindowManager",function() {
            return {
                split : function() {},
                merge : function() {},
                window : function() {},
                tab : function() {
                    return { title: "Test data",
                             url : "http://www.google.com"
                    };
                }
            };
        });
        
    } else {
        app.factory("WindowManager",WindowManagerService);
    }
    
    app.run(function($rootScope) {
        
        if (localStorage.bookmark === undefined) {
            // Initial data. For testing purpose
            localStorage.bookmark = JSON.stringify({
                // Links for each button
                links : {
                    "H_70_30_1" : [{
                        color : "#f4b400",
                        title : "Google Keep",
                        url : "https://drive.google.com/keep"    
                    }]
                }
            });
        }
        
        $rootScope.bookmark = JSON.parse(localStorage.bookmark);
        
        $rootScope.$watch(function(){ // Save bookmark to localStorage
            return $rootScope.bookmark;   
        } ,function() {
            localStorage.bookmark = JSON.stringify($rootScope.bookmark);
        },true);
    });
	
	$(document).ready(function() {
		angular.bootstrap(document,["popup"]);
	});	
});
          
          
          
