
/* Color Picker
 */

define(["module",
        "dualless/lib/bootstrap-colorpicker"],
         function(self) {
    
    function factory() {
        var def = {
            replace: false,
            transclude: false,
            restrict : 'A',
            require : "?ngModel",
            link : function(scope, element, attrs, ngModel) {
                $(element).colorpicker();
            }
        };
        return def;
	}
    
    return factory;
});
