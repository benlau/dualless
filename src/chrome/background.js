var _manager;
var _display;

function manager() {
	return _manager;
}

requirejs.config({
    paths : {
        "dualless" : "."
    }
});

require(["sys/windowmanager",
         "sys/pairdisplay"],
		function(WindowManager,PairDisplay) {

	if (localStorage.pairingModeEnabled == undefined)
		localStorage.pairingModeEnabled = 1;
	
	_manager = new WindowManager();
	_display = new PairDisplay();
	_display.start(_manager);
});

var _log = [];

function log(message) {
	_log.unshift(message);
	if (_log.length > 20)
		_log.shift();
}

function fullLog() {
	return _log;
}

log("Dualless launched");

window.log = log;
window.fullLog = fullLog;
window.manager = manager;
