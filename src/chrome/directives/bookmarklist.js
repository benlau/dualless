
define(["module"],
		function (self) {
            
    var uri = self.uri;
    var arr = uri.split("/");
    arr.pop();
    uri = arr.join("/");

    
    function Controller($scope) {       
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
        
        $scope.remove = function(idx) {
            $scope.links.splice(idx,1);
        };
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
