define(function(){
	var os = "unknown";

	if (navigator.appVersion.indexOf("Win")!=-1) os="Windows";
	if (navigator.appVersion.indexOf("Mac")!=-1) os="MacOS";
	if (navigator.appVersion.indexOf("X11")!=-1) os="Unix";
	if (navigator.appVersion.indexOf("Linux")!=-1) os="Linux";
	
	return function() {
		return os;
	};
});