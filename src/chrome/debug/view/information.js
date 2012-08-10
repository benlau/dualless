/* Information View */

define(["module",
        "dualless/util/rect"],
		function info(self,
						Rect) {
	var uri = self.uri;
	var arr = uri.split("/");
	arr.pop();
	uri = arr.join("/");
	
	function Controller($scope) { 	
		var bg = chrome.extension.getBackgroundPage();
		var manager = bg.manager();

		$scope.basic = [];
		$scope.basic.push( ["OS", manager.os() ] );
		
		$scope.screen = [];
		$scope.screen.push([ "window.screen.availWidth", window.screen.availWidth]);
		$scope.screen.push([ "window.screen.availHeight", window.screen.availHeight]);
		$scope.screen.push([ "window.screen.width", window.screen.width]);
		$scope.screen.push([ "window.screen.height", window.screen.height]);

		$scope.window = {};
		$scope.window.isMaximized;
		$scope.window.geometry;
		$scope.window.viewport = manager.viewport().toString();
		
		$scope.managed = {}; // Managed window information
		$scope.managed.win1;
		$scope.managed.win2;
		$scope.log = bg.fullLog().join("\n");
			
		// Update dynamic information
		function update() {

			manager.updateWindows({},function(windows) {
			
				for (var i = 0 ; i < 2;i++) {
					var exp;
					var win = windows[i];
					if (win !=undefined) {
						var rect = new Rect(win);
						exp = "managed.win" + (i + 1) + " = " + rect.toString();
					} else {
						exp = "managed.win" + (i + 1) + " = ''";
					}				
					$scope.$apply(exp);
				}
			});

			manager.currentWindow(function(win) {
	        	$scope.$apply("window.isMaximized = " + manager.isMaximized(win));
	        	
	        	var geom = "[" + win.top + "," + win.left + "," + win.width + "," + win.height + "]"; 
	        	$scope.$apply("window.geometry = " + geom);
        	
	        	$scope.$apply("window.viewport = " + manager.viewport().size().toString());
	        });

			$scope.log = bg.fullLog().join("\n");

		}
		
		update();
		var timer = setInterval(update,2000);
		
		$scope.$on('$destroy',function onDestroy() {
//			console.log("$destroy");
			clearInterval(timer);
		});

		
	};
	
	return {
		templateUrl : uri + "/information.html",
		controller: Controller,
	};
});
