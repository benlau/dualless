
define(["module",
        "dualless/controllers/splitpanelcontroller"],
		function hsplitpanel(self,
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
			controller: splitpanelcontroller("H"),
			restrict : 'E',
            scope : {
                bookmark : "=ngModel"
            },
            link: function(scope, element, attrs, ngModel) {
                if(!ngModel) return; // do nothing if no ng-model
                
                ngModel.$render = function() {
                    scope.refresh();
                }
                
            }
		};
		return def;
	}
	
	return factory; 
});
