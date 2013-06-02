
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
         
         $rootScope.$watch(function(scope) {
             return {
                 links : scope.bookmarks.links,
                 bindings : scope.bookmarks.bindings
             }
         },function() {
             $scope.$evalAsync(function() {
                 $scope.links = {};
                 for (var i in $rootScope.bookmarks.links) {
                     // Change to object. More easy for 2 way binding
                     $scope.links[i] = { pin : false };
                     $.extend($scope.links[i],$rootScope.bookmarks.links[i]);
                     for (var j in $rootScope.bookmarks.bindings) {
                         if ($rootScope.bookmarks.bindings[j].key == $scope.key) {
                             $scope.links[i].pin = true;
                             break;
                         }
                     }
                     
                 }
             });
         }, 
         true);
         
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
