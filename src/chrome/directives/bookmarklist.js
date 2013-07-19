
define(["module"],
		function (self) {
            
    var uri = self.uri;
    var arr = uri.split("/");
    arr.pop();
    uri = arr.join("/");

    
    function Controller($scope,$timeout) {       
    /*
        $scope.click = function(url) {
            var split = { // Split argument
                orientation : 'H',
                param1 : 7,
                param2 : 3,
                position : 0,
                action : {
                    url : url
                }
            };
            
            $scope.onSelect({ options : split});
        };
      */  
        
        $scope.selected = -1;
        
        $scope.remove = function(idx) {
            $scope.links.splice(idx,1);
        };
        
        $scope.select = function(idx) {
            $scope.selected = idx;
            $scope.onSelect({$index : idx});
            $scope.$broadcast("selected" , {code : idx});
        };
        
        $scope.$watch(function() {
            var length = 0;
            if ($scope.links)
                lenght = $scope.links.length
            return length;   
        },function() {
            if ($scope.selected >= $scope.links.length) {
                $timeout(function() {
                    $scope.select($scope.links.length - 1);
                });
            } else if ($scope.selected <0 && $scope.links.length > 0) { // First time loading
                $timeout(function() {
                    $scope.select(0);
                });
            } else {
                $timeout(function() {
                    $scope.select($scope.selected); // reselect the current item as it may be changed
                });
            }
        });
    }
	
	function factory() {
		var def = {
            replace: true,
            transclude: true,
            templateUrl : uri + "/bookmarklist.html",
            controller: Controller,
            restrict : 'E',
            scope : { links:"=links",
                       onSelect: "&"
                     }
		};
		return def;
	}
	
	return factory; 
});
