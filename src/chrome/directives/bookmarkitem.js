
define(["module"],
		function (self) {
            
    var uri = self.uri;
    var arr = uri.split("/");
    arr.pop();
    uri = arr.join("/");
    
    var sheet = "<link  href='" + uri + "/../directives/bookmarkitem.css' rel='stylesheet'>";
	$("head").append(sheet);
 
    function Controller($scope) {
        
        $scope.$watch(function(scope) {
            return scope.link;
        }, function() {
            $scope.title = $scope.link.title;
            $scope.color = $scope.link.color;
            $scope.pin = $scope.link.pin;
        },
        true);
        
        $scope.$watch("pin",function() {
            $scope.$evalAsync(function() {
                $scope.link.pin = $scope.pin;
            });
        });
        
        $scope.remove = function() {
            $scope.onRemove({});
        }
    }
	
	function factory() {
		var def = {
            replace: true,
            transclude: false,
            templateUrl : uri + "/bookmarkitem.html",
            controller: Controller,
            restrict : 'E',
            scope : { link : "=",
                      onRemove : "&"
                     },
            link : function(scope,iElement, iAttrs, controller) {
                
            }
		};
		return def;
	}
	
	return factory; 
});
