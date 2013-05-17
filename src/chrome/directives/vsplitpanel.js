
define(["module",
        "dualless/controllers/splitpanelcontroller"],
		function vsplitpanel(self,
                                 splitpanelcontroller) {
	var uri = self.uri;
	var arr = uri.split("/");
	arr.pop();
	uri = arr.join("/");
	
	function factory() {
		var def = {
           replace: false,
	       transclude: true,
			templateUrl : uri + "/splitpanel.html",
			controller: splitpanelcontroller("V"),
			restrict : 'E',
			scope : {}
		};
		return def;
	}
	
	return factory; 
});
