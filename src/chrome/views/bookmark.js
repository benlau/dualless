
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
         
         $rootScope.$watch(function(scope) {
             return {
                 links : scope.bookmarks.links,
                 bindings : scope.bookmarks.bindings
             }
         },function() {
             $scope.$evalAsync(function() {
                 $scope.links = $rootScope.bookmarks.links
             });
         }, 
         true);
         
    }
    
    Controller.inject = ["$scope" , 
                           "$routeParams",
                           "$rootScope"]
    
    // Factory for route provider
    return {
        templateUrl : uri + "/bookmark.html",
        controller : Controller
    }
});
