
define(["module",
        "dualless/directive/splitpanel"],
		function hsplitpanel(self) {
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

		$scope.split = function (param1,param2,position,event) {
			var args = {param1: param1,
					     param2: param2,
						  position : position,
					     orientation : "H"}
			
			if (event.button == 1) {
				args.duplicate = true;
				args.position = 1 - args.position;
			}
			
			$scope.$emit("split",args);
		};

		$scope.merge = function() {
			$scope.$emit("merge");
		};
		
	};
	
	function factory() {
		var def = {
           replace: false,
	       transclude: true,
			templateUrl : uri + "/hsplitpanel.html",
			controller: Controller,
			restrict : 'E',
			scope : {}
		};
		return def;
	}
	
	return factory; 
});
