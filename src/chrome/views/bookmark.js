
/** Bookmark view
 * 
 */

define(["module"],
        function(self) {
   
    var uri = self.uri;
    var arr = uri.split("/");
    arr.pop();
    uri = arr.join("/");

    function Controller($scope,
                        $routeParams,
                        $rootScope,
                        WindowManager) {

        var tab = WindowManager.tab();
        
         $scope.param1 = $routeParams.param1;
         $scope.param2 = $routeParams.param2;
         $scope.orientation = $routeParams.orientation.toUpperCase();
         $scope.position = $routeParams.position;        
         
         $scope.key = buttonKey($scope.orientation,
                                   $scope.param1,
                                   $scope.param2,
                                   $scope.position
         );
        
        // The link of current browsing page. It is pending to add to bookmark
        $scope.pending = { title : tab.title,
                           url : tab.url
                          };

        // bookmark.links => links , buttons
        $rootScope.$watch(function(scope) {
            return scope.bookmark.links.length;
        },function() {
            $scope.$evalAsync(function() {
                $scope.links = $rootScope.bookmark.links[$scope.key];               
                $scope.buttons = [{},{}];
                $scope.buttons[$scope.position] = $scope.links;
                $scope.buttons[1 - $scope.position]= undefined;
                delete $scope.selected;
            });
        },true);

        // links => bookmark.links        
        $scope.$watch(function(scope) {
            return scope.links;    
        },function() {
            $rootScope.$evalAsync(function() {
                $rootScope.bookmark.links[$scope.key] = $scope.links;
            });
        },
        true);
        
        // Add new link to bookmark
        $scope.add = function() {
            if ($scope.links === undefined)
                $scope.links = [];
            $scope.pending.color = "blue";
            $scope.links.push($scope.pending);
            delete $scope.pending;
        };
        
        // Select a link. It will update $scope.selected
        $scope.select = function(idx) {
            if (idx >= $scope.links.length )
                return;
            $scope.selected = $scope.links[idx];
        };
         
        /* 
         // bookmarks.links , bookmarks.bindings => links
         $rootScope.$watch(function(scope) {
             return {
                 links : scope.bookmarks.links,
                 bindings : scope.bookmarks.bindings
             };
         },function() {
             $scope.links = {}; // Clear all the value as links could be removed.

             $scope.$evalAsync(function() {
                 for (var i in $rootScope.bookmarks.links) {
                     $scope.links[i] = { pin : false }; // Extra attribute is added
                     
                     $.extend($scope.links[i],$rootScope.bookmarks.links[i]);
                     var bindings = $.grep($rootScope.bookmarks.bindings,function(value) {
                         return value.key == $scope.key;
                     });
                     if (bindings.length > 0)
                        $scope.links[i].pin = true;
                 }                 
             });
         }, 
         true);
         
         // links => bookmarks.links , bookmarks.bindings
         $scope.$watch(function() {
             return $scope.links;
         } , function() { // Write back the change to $rootScope
            $rootScope.$evalAsync(function() {
                 $scope.bookmarks.links = []
                 for (var i in $scope.links) {
                    var link = {};
                    $.extend(link,$scope.links[i]);
                    var pin = link.pin;
                    delete link.pin;
                    $scope.bookmarks.links.push(link);
                    
                    if (pin) {
                        
                        $rootScope.bookmarks.bindings.push({
                           key : $scope.key,
                           id : link.id 
                        });
                        
                    } else {
                        var bindings = $.grep($rootScope.bookmarks.bindings, function(value) { 
                            return value.key == $scope.key && value.id == link.id;
                        },true );
                        $rootScope.bookmarks.bindings = bindings;
                    }
                 }
                 // @TODO : Update binding
            });
         },
         true);

         // $rootScope -> buttons
         $rootScope.$watch(function(scope) {
             return scope.bookmarks.buttons;
         },function() {
             $scope.$evalAsync(function() {
                 $scope.buttons = [{},{}];
                 console.log($rootScope.bookmarks.buttons,$scope.key);
                 var button = $rootScope.bookmarks.buttons[$scope.key];
                 $scope.buttons[$scope.position] = button;
                 $scope.buttons[1 - $scope.position]= undefined;
                 console.log($scope.buttons);
             });
         },
         true);
         */
         
         $scope.back = function() {
             history.back();
             $scope.$evalAsync();
         };
         
    }
    
    Controller.inject = ["$scope" , 
                           "$routeParams",
                           "$rootScope",
                        "WindowManager"];

    // Construction the key for a button    
    function buttonKey(o,p1,p2,pos) {
        return o.toUpperCase() + "_" + p1 *10  + "_" + p2 * 10 + "_" + pos;
    }

    // Factory for route provider
    return {
        templateUrl : uri + "/bookmark.html",
        controller : Controller
    };
});
