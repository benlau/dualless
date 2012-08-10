
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
		$scope.viewport = manager.viewport().size().toString();	
	}

	$scope.setPairingMode = function(val){
		localStorage.pairingModeEnabled = val;
		updatePairingButton(val);
	};
	
	$scope.resetViewport = function(){
		manager.viewport().reset();
		updateViewport();
	};
		
	updateViewport();
	updatePairingButton(localStorage.pairingModeEnabled);
}
