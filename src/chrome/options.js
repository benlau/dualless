requirejs.config({
	paths : {
		"dualless" : "."
	}
});

require([ "dualless/data/bookmarkdata"],
        function(bookmarkData) {    

function OptionsController($scope) {
    $scope.options = {}
    
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
    
    /* Auto Maximize Mode */
    
    $scope.autoMaximizeModeEnabled = localStorage.autoMaximizeModeEnabled;
    
    $scope.$watch("autoMaximizeModeEnabled",function() {
        localStorage.autoMaximizeModeEnabled = $scope.autoMaximizeModeEnabled;
    });
    
    
    /* Bookmark */
    
    $scope.options.bookmark = {
        clear : function(){
            localStorage.bookmark = JSON.stringify({});
        },
        
        restoreToDefault : function() {
            localStorage.bookmark = JSON.stringify(bookmarkData.data());
        }
    }
    
    
	$scope.$on("$destroy",function() {
		manager.viewport().unbind(updateViewport);	
	});
}

    var app = angular.module("options",[]);
    app.controller("OptionsController",OptionsController);
    $(document).ready(function() {
		angular.bootstrap(document,["options"]);
	});	
})
