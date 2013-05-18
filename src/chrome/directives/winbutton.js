
/* Window Button 
 * 
 * Represent the size of a window after the action
 */

define(["module"],
         function(self) {
    
    function Controller($scope,$element,$timeout) {
        
        $scope.color = "#FFFFFF";
        
        $scope.refresh = function() {
            if ($scope.bookmark) {
                var ret = $scope.bookmark.find($scope.key);
                if (ret.length > 0) {
                    $scope.color = ret[0].color;
                    $($scope.element).css("background-color",$scope.color);
                }
            }
        }
       
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
            $scope.refresh();
        });
    }
    
    Controller.inject = ["$scope","$element","$timeout"];
    
    function factory() {
        var def = {
            replace: true,
            transclude: false,
            template : "<div></div>",
            controller: Controller,
            restrict : 'E',
            require : "?ngModel",
            scope : {
                orientation : "@",
                ratio : "@",
                key : "@",
                bookmark : "=ngModel",
                onClick : "&"
            },
            link : function(scope, element, attrs, ngModel) {
                scope.element = element;
                $(element).hover(function() {
                    $(element).css("background-color","yellow");  
                },function() {
                    $(element).css("background-color",scope.color);  
                });
                
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
