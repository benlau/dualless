
/* Color Picker
 */

define(["module",
        "dualless/lib/bootstrap-colorpicker"],
         function(self) {
             
    function Controller($scope,$element){
        var picker = $($element).colorpicker();
        
        $scope.$watch("value",function(){
            /*
            $scope.$evalAsync(function() {
                $($element).colorpicker('setValue',$scope.value);
            });
            */
//            $element.val($scope.value);
//            $element.data('colorpicker').color.setColor($scope.value);
            $($element).colorpicker('setValue',$scope.value);
        });

        picker.on('changeColor',function(ev) {

            var v = ev.color.toHex();
            if (v == $scope.value)
                return;
            $scope.$apply(function() {
                $scope.value = v;
            });

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
