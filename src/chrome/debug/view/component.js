/* Components View */

define(["module"],
		function component(self) {
	var uri = self.uri;
	var arr = uri.split("/");
	arr.pop();
	uri = arr.join("/");

	var bg = chrome.extension.getBackgroundPage();
	var manager = bg.manager();
	
	console.log(manager);
	console.log(manager.os());
	
	function Controller($scope) {	
		$scope.$on("split",function(event,args) {
			event.stopPropagation();
			
			var manager = chrome.extension.getBackgroundPage().manager();
			
			var rects = manager.split(args);
			
			
		});
		
		$scope.$on("merge",function(event) {
			event.stopPropagation();
			
			var manager = chrome.extension.getBackgroundPage().manager();
			manager.merge();
		});
	};
	
	return {
		templateUrl : uri + "/component.html",
		controller: Controller,
	};
});
