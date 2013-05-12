
define(["module"],
		function (self) {
            
    var uri = self.uri;
    var arr = uri.split("/");
    arr.pop();
    uri = arr.join("/");

    
    function Controller($scope) {       
    }
	
	function factory() {
		var def = {
            replace: true,
            transclude: true,
            templateUrl : uri + "/bookmarklist.html",
            controller: Controller,
            restrict : 'E',
            scope : { model:"=model"
                     }
		};
		return def;
	}
	
	return factory; 
});
