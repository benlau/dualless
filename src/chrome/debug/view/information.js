/* Information View */

import {Rect} from "../../utils/rect.js";
import { windowManageServiceInstance } from "../../sys/service.js";

export function Information() {

	function Controller($scope) {
		$scope.screen = [];
        $scope.screen.push([ "window.screen.availLeft", window.screen.availLeft]);
        $scope.screen.push([ "window.screen.availTop", window.screen.availTop]);
		$scope.screen.push([ "window.screen.availWidth", window.screen.availWidth]);
		$scope.screen.push([ "window.screen.availHeight", window.screen.availHeight]);
		$scope.screen.push([ "window.screen.width", window.screen.width]);
		$scope.screen.push([ "window.screen.height", window.screen.height]);

		$scope.window = {};
		$scope.window.isMaximized;
		$scope.window.geometry = "";
		$scope.window.viewport = "";

		$scope.displayInfo = []
		$scope.log = "";

		windowManageServiceInstance.currentWindow().then(win => {
			$scope.$apply("window.isMaximized = " + windowManageServiceInstance.isMaximized(win));
			var geom = new Rect(win);
			$scope.$apply("window.geometry = '" + geom.toString() + "'");        	
		});

		windowManageServiceInstance.getLog().then(log => {
			$scope.$apply(function() {
				$scope.log = log;
			});
		});
	}

	return {
		templateUrl : "view/information.html",
		controller: Controller,
	};
}
