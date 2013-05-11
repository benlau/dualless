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
         "sys/toolbox"],
		function(WindowManager,toolbox) {

	if (localStorage.pairingModeEnabled == undefined)
		localStorage.pairingModeEnabled = 1;
	
	_manager = new WindowManager();
	_display = new toolbox.PairDisplay();
	_display.start(_manager);
	
	// If a paired window is removed, the remaining one will occupy the screen automatically
	_manager.events.on("removed",function() {
		var windows = _manager.windows();
		if (windows.length > 0) {
			_manager.maximize(windows[0].id);
		}
	});
	
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
