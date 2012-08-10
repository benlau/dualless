/* Split Panel Shared Resource */

define(["module"],
		function splitpanel(self) {
	var uri = self.uri;
	var arr = uri.split("/");
	arr.pop();
	uri = arr.join("/");

	var sheet = "<link  href='" + uri + "/splitpanel.css' rel='stylesheet'>";
	$("head").append(sheet);

	
});
