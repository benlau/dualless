
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
                            $rootScope) {

         $scope.param1 = $routeParams.param1;
         $scope.param2 = $routeParams.param2;
         $scope.orientation = $routeParams.orientation;
         $scope.position = $routeParams.position;        
         
         $scope.key = buttonKey($scope.orientation,
                                   $scope.param1,
                                   $scope.param2,
                                   $scope.position
         );
         
         
         // bookmarks.links , bookmarks.bindings => links
         $rootScope.$watch(function(scope) {
             return {
                 links : scope.bookmarks.links,
                 bindings : scope.bookmarks.bindings
             }
         },function() {
             $scope.links = {}; // Clear all the value as links could be removed.

             $scope.$evalAsync(function() {
                 for (var i in $rootScope.bookmarks.links) {
                     $scope.links[i] = { pin : false }; // Extra attribute is added
                     
                     $.extend($scope.links[i],$rootScope.bookmarks.links[i]);
                     /*
                     if ($rootScope.bookmarks.bindings.find({ key : $scope.key}).length > 0) {
                         $scope.links[i].pin = true;
                     }*/
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
                            return value.key == $scope.key && value.id == link.id
                        },true );
                        $rootScope.bookmarks.bindings = bindings;
                    }
                 }
                 // @TODO : Update binding
            });
         },
         true);
         
         
         $scope.back = function() {
             history.back();
             $scope.$evalAsync();
         }
         
    }
    
    Controller.inject = ["$scope" , 
                           "$routeParams",
                           "$rootScope"]

    // Construction the key for a button    
    function buttonKey(o,p1,p2,pos) {
        return o.toUpperCase() + "_" + p1 *10  + "_" + p2 * 10 + "_" + pos
    }

    // Factory for route provider
    return {
        templateUrl : uri + "/bookmark.html",
        controller : Controller
    }
});
