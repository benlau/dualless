
export function os() {
	var _os = "unknown";

	if (navigator.userAgent.indexOf("Win") != -1) _os = "Windows";
	if (navigator.userAgent.indexOf("Mac") != -1) _os = "MacOS";
	if (navigator.userAgent.indexOf("X11") != -1) _os = "Unix";
	if (navigator.userAgent.indexOf("Linux") != -1) _os = "Linux";

	return _os;
}

export function isMac() {
	return os() === "MacOS";
}

export function isWindows() {
	return os() === "Windows";
}