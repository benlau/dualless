
define(["module"],
		function (self) {
            
    var uri = self.uri;
    var arr = uri.split("/");
    arr.pop();
    uri = arr.join("/");
    
    function Controller($scope) {
        
        $scope.pin = false;
        
        $scope.$watch(function(scope) {
            return scope.bookmark;
        }, function() {
            $scope.title = $scope.bookmark.title;
            $scope.color = $scope.bookmark.color;
        },
        true);
        
        $scope.toggle = function() {
            $scope.pin = ! $scope.pin;
        }
    }
	
	function factory() {
		var def = {
            replace: true,
            transclude: false,
            templateUrl : uri + "/bookmarkitem.html",
            controller: Controller,
            restrict : 'E',
            scope : { bookmark : "="
                     },
            link : function(scope,iElement, iAttrs, controller) {
                
            }
		};
		return def;
	}
	
	return factory; 
});
