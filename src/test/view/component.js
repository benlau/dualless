
define(["module"],function components(self) {
	var uri = self.uri;
	var arr = uri.split("/");
	arr.pop();
	uri = arr.join("/");
	
	function Controller($scope) {
		console.log("Components.controller()");
		
		$scope.name ="Components View";
		
		$scope.hpanelLastAction = "";
		
		$scope.split = function() {
			console.log("Parent scope's split is called");
		};
		
		$scope.$on("split",function(event,args) {
			if (args.orientation == "H")
				$scope.hpanelLastAction = String(args.param1) + ":" + args.param2;
			else 
				$scope.vpanelLastAction = String(args.param1) + ":" + args.param2;
		});
	};
	
	
	return {
		templateUrl : uri + "/component.html",
		controller: Controller,
	};
});
