
function OptionsController($scope) {
	/* Pairing Mode */
	
	function updatePairingButton(val) {
		var list;
		if (val > 0) { // By default , the pairing mode is on.
			list = ["active",""];
		} else {
			list = ["","active"];
		}
		$scope.pairingButtonState = list;
	}

	$scope.setPairingMode = function(val){
		localStorage.pairingModeEnabled = val;
		updatePairingButton(val);
	};
	
	updatePairingButton(localStorage.pairingModeEnabled);
}
