
/* Color Picker
 */

define(["module",
        "dualless/lib/bootstrap-colorpicker"],
         function(self) {
             
    function Controller($scope,$element,$rootScope){
        var picker = $($element).colorpicker();
        
        $scope.value = "";
        
        $scope.$watch("value",function(){
            $($element).colorpicker('setValue',$scope.value);
        });

        picker.on('changeColor',function(ev) {

            var v = ev.color.toHex();
            if (v == $scope.value)
                return;
            
            if ($rootScope.$root.$$phase == "$digest") {
                $scope.value = v;
            } else {
                $scope.$apply(function() {
                    $scope.value = v;
                });
            }

        });
    }
    
    
    function factory() {
        var def = {
            replace: true,
            transclude: false,
            restrict : 'A',
            template: "<div data-color-format='hex' data-color='' style='background-color:{{value}}'></div>",
            scope : {
                value : "=value"
            },
            controller : Controller,
            link : function(scope, element, attrs, ngModel) {
            }
        };
        return def;
	}
    
    return factory;
});
