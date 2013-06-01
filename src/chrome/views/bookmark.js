
/** Bookmark view
 * 
 */

define(["module"],
        function(self) {
   
    var uri = self.uri;
    var arr = uri.split("/");
    arr.pop();
    uri = arr.join("/");

    function Controller($scope,$routeParams) {
         $scope.param1 = $routeParams.param1;
         $scope.param2 = $routeParams.param2;
         $scope.orientation = $routeParams.orientation;
    }
    
    Controller.inject = ["$scope" , "$routeParams"]
    
    // Factory for route provider
    return {
        templateUrl : uri + "/bookmark.html",
        controller : Controller
    }
});
