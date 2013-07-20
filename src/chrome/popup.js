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
          "dualless/sys/service",
          "dualless/directives/colorpicker",
          "dualless/data/bookmarkdata"
          ],
          function popup(PanelView,
                            bookmarklist,
                            winbutton,
                            bookmark,
                            bookmarkeditor,
                            bookmarkitem,
                            WindowManagerService,
                            colorPicker,
                            bookmarkData
                            ){

	var app = angular.module("popup",[]);
	
	app.config(['$routeProvider', function configRouteProvider($routeProvider) {
        
        $routeProvider.when("/panel",PanelView);
        $routeProvider.when("/panel/:orientation",PanelView);
        $routeProvider.when("/bookmark/:orientation/:param1/:param2/:position",bookmark);
        // @TODO - Enable to remember the horizontal or vertical mode.
        $routeProvider.otherwise({redirectTo : "/panel" });
			
	}]);
	
	app.directive('bookmarklist',bookmarklist);
	app.directive('bookmarkeditor',bookmarkeditor);
    app.directive('bookmarkitem',bookmarkitem);
    app.directive('winbutton',winbutton);
    app.directive('colorPicker',colorPicker);    
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
            console.log("Load data bookmark",bookmarkData.data());
            // Initial data
            localStorage.bookmark = JSON.stringify(bookmarkData.data());
        }
        
        try {
            $rootScope.bookmark = JSON.parse(localStorage.bookmark);
            
            if ($rootScope.bookmark.links === undefined) // In case the data is corrupted
                $rootScope.bookmark.links = {}

        } catch (e) {
            console.log("Loading bookmark fail : " + e);
            console.log("Create a empty bookmark");
            $rootScope.bookmark = {
                links : {}    
            }
        }
        
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
          
          
          
