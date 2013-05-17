
/* Window Button 
 * 
 * Represent the size of a window after the action
 */

define(["module"],
         function(self) {
    
    function Controller($scope,$element,$timeout) {
       
        $timeout(function() {
            // link() is not used since ratio is passed by parent scope using {{}} notation.
            // "ratio" will not be resolved even in post-linking. 
            // So it now wait until the render is completed for first time setup
            var cls = "",
                 ratio = $scope.ratio || "",
                 orientation = $scope.orientation;

            $($element).addClass("split-panel-win");
            
            if (orientation == 'H') {
                cls = "hsplit-panel-win";
            } else {
                cls = "vsplit-panel-win";
            }
            
            $($element).addClass(cls);
            $($element).addClass(cls + ratio);            
            
            $($element).click(function(event) {
                $scope.onClick({ $event :event});
            });
        });
    }
    
    Controller.inject = ["$scope","$element","$timeout"];
    
    function factory() {
        var def = {
            replace: false,
            transclude: false,
            template : "<div></div>",
            controller: Controller,
            restrict : 'E',
            scope : {
                orientation : "@",
                ratio : "@",
                onClick : "&"
            }
        };
        return def;
	}
    
    return factory;
});
