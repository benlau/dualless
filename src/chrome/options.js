
function OptionsController($scope) {
	/* Pairing Mode */
	
	var bg = chrome.extension.getBackgroundPage();
	var manager = bg.manager();
	
	function updatePairingButton(val) {
		var list;
		if (val > 0) { // By default , the pairing mode is on.
			list = ["active",""];
		} else {
			list = ["","active"];
		}
		$scope.pairingButtonState = list;
	}
	
	function updateViewport(){
		var geom = manager.viewport().size().toString();
		if (geom != $scope.viewport){
			$scope.$apply("viewport = " + geom);
		}
	}
	
	$scope.viewport = manager.viewport().size().toString();
	
	$scope.setPairingMode = function(val){
		localStorage.pairingModeEnabled = val;
		updatePairingButton(val);
	};
	
	$scope.resetViewport = function(){
		manager.viewport().reset();
		$scope.viewport = manager.viewport().size().toString();
	};	

	updatePairingButton(localStorage.pairingModeEnabled);
	manager.viewport().bind(updateViewport);
	
	$scope.$on("$destroy",function() {
		manager.viewport().unbind(updateViewport);	
	});
}
