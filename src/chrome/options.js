requirejs.config({
	paths: {
		"dualless": "."
	}
});

import { BookmarkDefaultData } from "./data/bookmarkdata.js";
import { perferenceInstance } from "./sys/preference.js";


function OptionsController($scope) {
	$scope.options = {}

	/* Pairing Mode */

	function updatePairingButton(val) {
		var list;
		if (val > 0) { // By default , the pairing mode is on.
			list = ["active", ""];
		} else {
			list = ["", "active"];
		}
		$scope.pairingButtonState = list;
	}

	$scope.setPairingMode = function (val) {
		perferenceInstance.setPairingModeEnabled(val);
		updatePairingButton(val);
	};

	perferenceInstance.getPairingModeEnabled().then((enabled) => {
		$scope.$apply(() => {
			updatePairingButton(enabled);
		});
	});

	/* Auto Maximize Mode */
	perferenceInstance.getAutoMaximzeModeEnalbed().then((enabled) => {
		$scope.$apply(() => {
			$scope.autoMaximizeModeEnabled = enabled;
		});
	});

	// $scope.autoMaximizeModeEnabled = localStorage.autoMaximizeModeEnabled;

	$scope.$watch("autoMaximizeModeEnabled", function () {
		if ($scope.autoMaximizeModeEnabled === undefined) {
			return;
		}
		perferenceInstance.setAutoMaximizeModeEnabled($scope.autoMaximizeModeEnabled)
	});


	/* Bookmark */

	$scope.options.bookmark = {
		clear: function () {
			localStorage.bookmark = JSON.stringify({});
		},

		restoreToDefault: function () {
			localStorage.bookmark = JSON.stringify(BookmarkDefaultData);
		}
	}


	$scope.$on("$destroy", function () {
		manager.viewport().unbind(updateViewport);
	});
}

var app = angular.module("options", []);
app.controller("OptionsController", OptionsController);
$(document).ready(function () {
	angular.bootstrap(document, ["options"]);
});
