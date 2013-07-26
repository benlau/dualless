
define(["module"],
		function (self) {
            
    var uri = self.uri;
    var arr = uri.split("/");
    arr.pop();
    uri = arr.join("/");
    
    function Controller($scope,$timeout) {       
        $scope.selected = -1;
        $scope.linkCount = 0;
        
        $scope.remove = function(idx) {
            $scope.links.splice(idx,1);
        };
        
        $scope.select = function(idx) {
            $scope.selected = idx;
            if (idx >=0 && idx < $scope.links.length) {
                $scope.selectedLink = $scope.links[idx];    
            } else {
                $scope.selectedLink = undefined;
            }
        };
        
        $scope.$watch(function() {
            var length = 0;
            if ($scope.links)
                length = $scope.links.length;
            return length;   
        },function() {    
            function select(idx) {
                $timeout(function() {
                    $scope.select(idx); 
                });
            }
            
            if ($scope.links.length >  $scope.linkCount) { 
            
				if ($scope.selected <0) { // First time loading
					 select(0);
				} else {
					select($scope.links.length - 1); // new link added
				}
				
			} else {
				
				if ($scope.links.length == 0) {
					$scope.select(-1);
				} else if ($scope.selected >= $scope.links.length) {
					$scope.select($scope.links.length - 1);
				} else {
					$scope.select($scope.selected);
				}
				
			}
			
			$scope.linkCount = $scope.links.length;
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
                       selectedLink : "=selectedLink",
                       onSelect: "&"
                     }
		};
		return def;
	}
	
	return factory; 
});
