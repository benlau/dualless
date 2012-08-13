
requirejs.config({
	paths : {
		"dualless" : "../.."
	},
	baseUrl : "."
});

define([
        "test-util",
        "test-viewport",
        "test-windowmanager",
        "module"
        ],
		function runner() {
	
	QUnit.start();
});