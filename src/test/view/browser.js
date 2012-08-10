
define(["module"],function browser(self){
	var uri = self.uri;
	var arr = uri.split("/");
	arr.pop();
	uri = arr.join("/");
	
	function Controller($scope) {
		$scope.data = [];
		
		$scope.data.push([ "navigator.appVersion" , navigator.appVersion ]);
		$scope.data.push([ "navigator.platform" , navigator.platform ]);
	
		$scope.data.push([ "window.screen.availWidth", window.screen.availWidth]);
		$scope.data.push([ "window.screen.availHeight", window.screen.availHeight]);
	
		$scope.data.push([ "window.screen.width", window.screen.width]);
		$scope.data.push([ "window.screen.height", window.screen.height]);
	
		$scope.innerWidth = window.innerWidth;
		$scope.innerHeight = window.innerHeight;
		$scope.width = window.screen.width;
		$scope.height = window.screen.height;
		
		var onResize = function onResize() {
			$scope.$apply("innerWidth = " + window.innerWidth); 
			$scope.$apply("innerHeight = " + window.innerHeight);
			// A hack to get into Angular World from non-Angular world. Another method is "digest()" 
			// Reference : http://goo.gl/ElCjy
		};
		
		$scope.$on('$destroy',function onDestroy() {
			// Monitor destroy
			$(window).unbind('resize',onResize);
		});
		
		$(window).resize(onResize);
	};

	
	return {
		templateUrl : uri + "/browser.html",
		controller : Controller
	};
	

});