
define(["module",
        "dualless/directive/splitpanel"],
		function vsplitpanel(self) {
	var uri = self.uri;
	var arr = uri.split("/");
	arr.pop();
	uri = arr.join("/");
	
	function Controller($scope) {
		var arr = [];
		for (var i = 3 ; i <=7;i++ ) {
			var pair = [i , 10-i];
			arr.push(pair);
		}	
			
		$scope.choices = arr;

		$scope.split = function (param1,param2,position) {		
			$scope.$emit("split",{param1: param1,
		   						    param2: param2,
		   						    position : position,
								    orientation : "V"});
		};

		$scope.merge = function() {
			$scope.$emit("merge");
		};
		
	};
	
	function factory() {
		var def = {
           replace: false,
	       transclude: true,
			templateUrl : uri + "/vsplitpanel.html",
			controller: Controller,
			restrict : 'E',
			scope : {}
		};
		return def;
	}
	
	return factory; 
});
