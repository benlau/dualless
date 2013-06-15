/* Components View */

define(["module"],
		function component(self) {
	var uri = self.uri;
	var arr = uri.split("/");
	arr.pop();
	uri = arr.join("/");

	var bg = chrome.extension.getBackgroundPage();
	var manager = bg.manager();
	
	var currentWin;
	var currentTab;
	
	manager.currentWindowTab(function(win,tab){
		currentWin = win;
		currentTab = tab;
	});
	
	function Controller($scope) {	
		$scope.$on("split",function(event,args) {
			event.stopPropagation();
			
			var manager = chrome.extension.getBackgroundPage().manager();
			args.window = currentWin;
			args.tab = currentTab;
			
			manager.split(args,function(windows){
				currentWin = windows[0];
			});
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
