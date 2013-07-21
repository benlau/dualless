
QUnit.config.autostart = false;

requirejs.config({
	paths : {
		"dualless" : "../.."
	},
	baseUrl : "."
});

define([
        "test-util",
        "test-chrome",
        "test-viewport",
        "test-windowmanager",
        "module"
        ],
		function runner() {
	
	window.onbeforeunload = function(){
		return "Unexpected behaviour during testing!";
	};
	
	QUnit.done(function() {
		window.onbeforeunload = function(){ return;};
	});
	
	QUnit.start();
});
