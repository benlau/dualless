
define(["module",
        "dualless/directive/splitpanel",
        "dualless/controllers/splitpanelcontroller"],
		function hsplitpanel(self,
		                     splitpanel,
                             splitpanelcontroller) {
	var uri = self.uri;
	var arr = uri.split("/");
	arr.pop();
	uri = arr.join("/");	
	
	function factory() {
		var def = {
           replace: false,
	       transclude: true,
			templateUrl : uri + "/hsplitpanel.html",
			controller: splitpanelcontroller("H"),
			restrict : 'E',
			scope : {}
		};
		return def;
	}
	
	return factory; 
});
